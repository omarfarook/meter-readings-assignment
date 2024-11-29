const fs = require('fs');
const csv = require('csv-parser');

class FileReader {
  constructor(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid filePath: A valid file path must be provided.');
    }
  
    this.filePath = filePath;
  }

/**
   * Creates a readable stream for the file.
   * @returns {ReadableStream} - A readable stream for the file.
   * @throws {Error} - Throws an error if the file cannot be read.
   */
  stream() {
    try {
      return fs.createReadStream(this.filePath).pipe(csv({ headers: false }));
    } catch (error) {
      throw new Error(`Error reading file at ${this.filePath}: ${error.message}`);
    }
  }
}

module.exports = { FileReader };


