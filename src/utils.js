/**
 * Calculates the timestamp for a given interval.
 * @param {string} date - Interval date in YYYYMMDD format.
 * @param {number} intervalLength - Interval length in minutes.
 * @param {number} intervalIndex - Index of the interval.
 * @returns {string | null} - ISO timestamp or null for invalid input.
 */
function calculateTimestamp(date, intervalLength, intervalIndex) {
  if (!/^\d{8}$/.test(date)) {
    return null; // Return null for invalid date format
  }

  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6, 8);
  const baseDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

  if (isNaN(baseDate.getTime())) {
    return null; // Return null for invalid Date object
  }

  const timestamp = new Date(baseDate.getTime() + intervalLength * intervalIndex * 60000);
  return timestamp.toISOString();
}
  
  module.exports = { calculateTimestamp };
  