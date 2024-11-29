const { CsvParser } = require('../src/dataProcessing/CsvParser');

describe('CsvParser', () => {
  it('should skip rows with invalid timestamps', () => {
    const parser = new CsvParser();
    const invalidRow = {
      0: '300',
      1: 'invalid-date',
      2: '0.461',
      3: '0.810',
    };

    const result = parser.parseRow(invalidRow);
    expect(result).toBeNull();
  });

  it('should parse valid rows correctly', () => {
    const parser = new CsvParser();
    const validRow = {
      0: '300',
      1: '20231129',
      2: '0.461',
      3: '0.810',
    };

    parser.currentNmi = 'NEM1201009';
    parser.intervalLength = 30;

    const result = parser.parseRow(validRow);
    expect(result).toEqual([
      {
        nmi: 'NEM1201009',
        timestamp: '2023-11-29T00:00:00.000Z',
        consumption: 0.461,
      },
      {
        nmi: 'NEM1201009',
        timestamp: '2023-11-29T00:30:00.000Z',
        consumption: 0.810,
      },
    ]);
  });
});
