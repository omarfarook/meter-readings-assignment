// Record types
const RECORD_TYPES = {
    METER_CONFIGURATION: '200',
    INTERVAL_DATA: '300',
  };
  
  // Column indices
  const COLUMN_INDICES = {
    RECORD_TYPE: 0,
    NMI: 1,
    INTERVAL_LENGTH: 8,
    INTERVAL_DATE: 1, // For 300 records
    CONSUMPTION_START: 2, // First consumption value in 300 records
  };

  // Time-related constants
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MINUTES_IN_A_DAY = MINUTES_PER_HOUR * HOURS_PER_DAY;
  
  module.exports = {
    RECORD_TYPES,
    COLUMN_INDICES,
    MINUTES_IN_A_DAY
  };
  