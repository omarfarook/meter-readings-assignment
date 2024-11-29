const { SqlGenerator } = require('../src/services/SqlGenerator');
const { validate: isUuid } = require('uuid');

describe('SqlGenerator', () => {
  let sqlGenerator;

  beforeEach(() => {
    sqlGenerator = new SqlGenerator();
  });

  it('should generate a valid SQL insert statement', () => {
    const nmi = 'NEM1201009';
    const timestamp = '2023-11-29T00:00:00.000Z';
    const consumption = 0.461;

    const sql = sqlGenerator.generateInsertStatement(nmi, timestamp, consumption);

    expect(sql).toMatch(/INSERT INTO meter_readings/);
    expect(sql).toContain(`'${nmi}'`);
    expect(sql).toContain(`'${timestamp}'`);
    expect(sql).toContain(consumption.toString());

    // Validate UUID in the SQL statement
    const match = sql.match(/VALUES \('([a-f0-9-]+)'/);
    expect(match).not.toBeNull();
    expect(isUuid(match[1])).toBe(true);
  });

  it('should handle different consumption values correctly', () => {
    const nmi = 'NEM1201009';
    const timestamp = '2023-11-29T01:00:00.000Z';
    const consumption = 123.456;

    const sql = sqlGenerator.generateInsertStatement(nmi, timestamp, consumption);

    expect(sql).toContain(consumption.toString());
  });

  it('should throw an error if required fields are missing', () => {
    expect(() => sqlGenerator.generateInsertStatement(null, '2023-11-29T00:00:00.000Z', 0.461))
      .toThrow('NMI is required');

    expect(() => sqlGenerator.generateInsertStatement('NEM1201009', null, 0.461))
      .toThrow('Timestamp is required');

    expect(() => sqlGenerator.generateInsertStatement('NEM1201009', '2023-11-29T00:00:00.000Z', null))
      .toThrow('Consumption is required');
  });
});
