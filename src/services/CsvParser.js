const { calculateTimestamp } = require('./timestampHelper');

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

    if (fields[0] === '200') {
      this.currentNmi = fields[1];
      this.intervalLength = parseInt(fields[8], 10);
      return null;
    }

    if (fields[0] === '300' && this.currentNmi) {
      const intervalDate = fields[1];
      const intervalsPerDay = Math.floor(1440 / this.intervalLength);
      const consumptions = fields.slice(2, 2 + intervalsPerDay);

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
