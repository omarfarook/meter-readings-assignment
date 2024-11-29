const { calculateTimestamp } = require('../src/dataProcessing/timestampHelper');

describe('calculateTimestamp', () => {
  it('should calculate the correct timestamp for the first interval', () => {
    const result = calculateTimestamp('20231129', 30, 0);
    expect(result).toBe('2023-11-29T00:00:00.000Z');
  });

  it('should calculate the correct timestamp for the second interval', () => {
    const result = calculateTimestamp('20231129', 30, 1);
    expect(result).toBe('2023-11-29T00:30:00.000Z');
  });

  it('should calculate the correct timestamp for a 15-minute interval', () => {
    const result = calculateTimestamp('20231129', 15, 2);
    expect(result).toBe('2023-11-29T00:30:00.000Z');
  });

  it('should return null for invalid date format', () => {
    const result = calculateTimestamp('invalid', 30, 0);
    expect(result).toBeNull();
  });

  it('should return null for invalid date values', () => {
    const result = calculateTimestamp('20231301', 30, 0);
    expect(result).toBeNull();
  });
});