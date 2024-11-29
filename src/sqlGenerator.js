const { v4: uuidv4 } = require('uuid');

/**
 * Generates an SQL INSERT statement.
 * @param {string} nmi - NMI value.
 * @param {string} timestamp - Timestamp.
 * @param {string} consumption - Consumption value.
 * @returns {string} - SQL INSERT statement.
 */
function generateInsertStatement(nmi, timestamp, consumption) {
  const id = uuidv4();
  return `INSERT INTO meter_readings (id, nmi, "timestamp", consumption) VALUES ('${id}', '${nmi}', '${timestamp}', ${consumption});`;
}

module.exports = { generateInsertStatement };
