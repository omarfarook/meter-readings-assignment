const fs = require('fs');
const { processCsv } = require('../src/services/csvProcessor');
jest.mock('fs');

describe('processCsv', () => {
  const mockInput = `200,NEM1201009,E1E2,1,E1,N1,01009,kWh,30,20231129
300,20231129,0,0,0.461,0.810,0.568,1.234`;

  beforeEach(() => {
    jest.resetAllMocks();

    fs.createReadStream.mockImplementation(() => {
      const Readable = require('stream').Readable;
      const s = new Readable();
      s.push(mockInput);
      s.push(null);
      return s;
    });

    fs.writeFileSync.mockImplementation(() => {});
  });

  it('should process the CSV file and generate SQL statements', async () => {
    const inputFile = 'data/example-data.csv';
    const outputFile = 'data/output.sql';

    await processCsv(inputFile, outputFile);

    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      outputFile,
      expect.stringContaining('INSERT INTO meter_readings')
    );
  });

  it('should handle an empty CSV gracefully', async () => {
    fs.createReadStream.mockImplementation(() => {
      const Readable = require('stream').Readable;
      const s = new Readable();
      s.push(null);
      return s;
    });

    const inputFile = 'data/empty.csv';
    const outputFile = 'data/output.sql';

    await processCsv(inputFile, outputFile);

    expect(fs.writeFileSync).toHaveBeenCalledWith(outputFile, '');
  });
});
