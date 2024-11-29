const fs = require('fs');
const { FileWriter } = require('../src/dataProcessing/FileWriter');

jest.mock('fs');

describe('FileWriter', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should write data to a file', () => {
    const fileWriter = new FileWriter('mock-output.sql');
    const mockData = [
      "INSERT INTO meter_readings (id, nmi, \"timestamp\", consumption) VALUES ('uuid-1', 'NEM1201009', '2023-11-29T00:00:00Z', 0.461);",
      "INSERT INTO meter_readings (id, nmi, \"timestamp\", consumption) VALUES ('uuid-2', 'NEM1201009', '2023-11-29T00:30:00Z', 0.810);",
    ];

    fileWriter.write(mockData);

    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith('mock-output.sql', mockData.join('\n'));
  });

  it('should throw an error if writing fails', () => {
    fs.writeFileSync.mockImplementation(() => {
      throw new Error('Permission denied');
    });

    const fileWriter = new FileWriter('mock-output.sql');
    const mockData = ["INSERT INTO meter_readings (id, nmi, \"timestamp\", consumption) VALUES ('uuid-1', 'NEM1201009', '2023-11-29T00:00:00Z', 0.461);"];

    expect(() => fileWriter.write(mockData)).toThrow('Permission denied');
  });
});
