const { calculateTimestamp, isValidDate } = require("./timestampHelper");
const {
  RECORD_TYPES,
  COLUMN_INDICES,
  MINUTES_IN_A_DAY,
} = require("../constants");

class CsvParser {
  constructor() {
    this.currentNmi = null;
    this.intervalLength = null;
    this.invalidRows = [];
  }

  /**
   * Parses a single row of the CSV file.
   * @param {Object} row - A row from the CSV file.
   * @returns {Object|null} - Parsed data or null if the row is not relevant.
   */
  parseRow(row) {
    const fields = Array.from({
      length: Math.max(...Object.keys(row).map(Number)) + 1,
    }).map((_, index) => row[index] || null);

    const recordType = fields[COLUMN_INDICES.RECORD_TYPE];

    if (recordType === RECORD_TYPES.METER_CONFIGURATION) {
      this.currentNmi = fields[COLUMN_INDICES.NMI];
      this.intervalLength = parseInt(
        fields[COLUMN_INDICES.INTERVAL_LENGTH],
        10
      );
      return null;
    }

    if (recordType === RECORD_TYPES.INTERVAL_DATA && this.currentNmi) {
      const intervalDate = fields[COLUMN_INDICES.INTERVAL_DATE];

      if (!isValidDate(intervalDate)) {
        this.invalidRows.push({
          row,
          reason: `Invalid interval date: ${intervalDate}`,
        });
        return null;
      }

      const intervalsPerDay = Math.floor(
        MINUTES_IN_A_DAY / this.intervalLength
      );
      const consumptions = fields.slice(
        COLUMN_INDICES.CONSUMPTION_START,
        COLUMN_INDICES.CONSUMPTION_START + intervalsPerDay
      );

      return consumptions
        .map((value, index) => {
          if (value && !isNaN(value)) {
            const timestamp = calculateTimestamp(
              intervalDate,
              this.intervalLength,
              index
            );
            if (!timestamp) {
              this.invalidRows.push({
                row,
                reason: `Invalid timestamp at index ${index}`,
              });
              return null;
            }
            return {
              nmi: this.currentNmi,
              timestamp,
              consumption: parseFloat(value),
            };
          } else {
            this.invalidRows.push({
              row,
              reason: `Invalid consumption value: ${value} at index ${index}`,
            });
            return null;
          }
        })
        .filter(Boolean);
    }

    // Log unrecognized rows
    this.invalidRows.push({
      row,
      reason: `Unrecognized record type: ${recordType}`,
    });
    return null;
  }

  /**
   * Reports all problematic rows encountered during parsing.
   */
  reportIssues() {
    if (this.invalidRows.length > 0) {
      console.warn(
        `The following rows were invalid (Total: ${this.invalidRows.length}):`
      );
      this.invalidRows.forEach(({ row, reason }) => {
        console.warn(`Row: ${JSON.stringify(row)} - Reason: ${reason}`);
      });
    } else {
      console.log("No issues detected during parsing.");
    }
  }
}

module.exports = { CsvParser };
