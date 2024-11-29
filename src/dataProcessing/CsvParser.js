const { calculateTimestamp } = require('./timestampHelper');
const { RECORD_TYPES, COLUMN_INDICES } = require('../constants');

class CsvParser {
  constructor() {
    this.currentNmi = null;
    this.intervalLength = null;
  }

  /**
   * Parses a single row of the CSV file.
   * @param {Object} row - A row from the CSV file.
   * @returns {Object|null} - Parsed data or null if the row is not relevant.
   */
  parseRow(row) {
    const fields = Object.values(row);

    if (fields[COLUMN_INDICES.RECORD_TYPE] === RECORD_TYPES.TYPE_200) {
      this.currentNmi = fields[COLUMN_INDICES.NMI];
      this.intervalLength = parseInt(fields[COLUMN_INDICES.INTERVAL_LENGTH], 10);
      return null;
    }

    if (fields[COLUMN_INDICES.RECORD_TYPE] === RECORD_TYPES.TYPE_300 && this.currentNmi) {
      const intervalDate = fields[COLUMN_INDICES.INTERVAL_DATE];
      const intervalsPerDay = Math.floor(1440 / this.intervalLength);
      const consumptions = fields.slice(COLUMN_INDICES.CONSUMPTION_START, 2 + intervalsPerDay);

      return consumptions.map((value, index) => {
        if (value && !isNaN(value)) {
          const timestamp = calculateTimestamp(intervalDate, this.intervalLength, index);
          if (!timestamp) {
            console.warn(`Invalid timestamp for date: ${intervalDate}, index: ${index}`);
            return null;
          }
          return { nmi: this.currentNmi, timestamp, consumption: parseFloat(value) };
        }
        return null;
      }).filter(Boolean);
    }

    return null;
  }
}

module.exports = { CsvParser };
