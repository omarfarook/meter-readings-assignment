// Record types
const RECORD_TYPES = {
    TYPE_200: '200',
    TYPE_300: '300',
  };
  
  // Column indices
  const COLUMN_INDICES = {
    RECORD_TYPE: 0,
    NMI: 1,
    INTERVAL_LENGTH: 8,
    INTERVAL_DATE: 1, // For 300 records
    CONSUMPTION_START: 2, // First consumption value in 300 records
  };
  
  module.exports = {
    RECORD_TYPES,
    COLUMN_INDICES,
  };
  