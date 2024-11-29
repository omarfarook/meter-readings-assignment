const { generateInsertStatement } = require('../src/services/sqlGenerator');
const { validate: isUuid } = require('uuid');

describe('generateInsertStatement', () => {
  it('should generate a valid SQL insert statement', () => {
    const nmi = 'NEM1201009';
    const timestamp = '2023-11-29T00:00:00.000Z';
    const consumption = 0.461;

    const sql = generateInsertStatement(nmi, timestamp, consumption);

    expect(sql).toMatch(/INSERT INTO meter_readings/);
    expect(sql).toContain(`'${nmi}'`);
    expect(sql).toContain(`'${timestamp}'`);
    expect(sql).toContain(consumption.toString());

    // Validate UUID in the SQL statement
    const match = sql.match(/VALUES \('([a-f0-9-]+)'/);
    expect(match).not.toBeNull();
    expect(isUuid(match[1])).toBe(true);
  });
});
