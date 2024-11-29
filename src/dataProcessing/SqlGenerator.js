const { v4: uuidv4 } = require('uuid');

class SqlGenerator {
  /**
   * Generates an SQL INSERT statement for a single reading.
   * @param {string} nmi - NMI value (cannot be null or undefined).
   * @param {string} timestamp - Timestamp (cannot be null or undefined).
   * @param {number} consumption - Consumption value (cannot be null or undefined).
   * @returns {string} - SQL INSERT statement.
   * @throws {Error} - If any required field is missing.
   */
  generateInsertStatement(nmi, timestamp, consumption) {
    if (!nmi) throw new Error('NMI is required');
    if (!timestamp) throw new Error('Timestamp is required');
    if (consumption == null) throw new Error('Consumption is required');

    const id = uuidv4();
    return `INSERT INTO meter_readings (id, nmi, "timestamp", consumption) VALUES ('${id}', '${nmi}', '${timestamp}', ${consumption});`;
  }
}

module.exports = { SqlGenerator };
