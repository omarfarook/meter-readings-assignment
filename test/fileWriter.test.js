const fs = require("fs");
const { FileWriter } = require("../src/dataProcessing/FileWriter");

const path = require('path');

jest.mock('fs');
jest.mock('path');

describe('FileWriter', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if the directory does not exist', () => {
    path.dirname.mockReturnValue('/nonexistent-dir');
    fs.existsSync.mockReturnValue(false);

    expect(() => new FileWriter('/nonexistent-dir/file.sql')).toThrow('Directory does not exist: /nonexistent-dir');
  });

  it('should throw an error if the directory is not writable', () => {
    path.dirname.mockReturnValue('/readonly-dir');
    fs.existsSync.mockReturnValue(true);
    fs.accessSync.mockImplementation(() => {
      throw new Error('Permission denied');
    });

    expect(() => new FileWriter('/readonly-dir/file.sql')).toThrow('Directory is not writable: /readonly-dir');
  });

  it('should write data to the file if the directory exists and is writable', () => {
    path.dirname.mockReturnValue('/valid-dir');
    fs.existsSync.mockReturnValue(true);
    fs.accessSync.mockImplementation(() => {}); // No error
    const mockWriteSync = jest.fn();
    fs.writeFileSync.mockImplementation(mockWriteSync);

    const fileWriter = new FileWriter('/valid-dir/file.sql');
    fileWriter.write(['INSERT INTO table VALUES (...);']);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      '/valid-dir/file.sql',
      'INSERT INTO table VALUES (...);'
    );
  });
});
