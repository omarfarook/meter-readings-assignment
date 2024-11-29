const fs = require('fs');
const csv = require('csv-parser');

class FileReader {
  constructor(filePath) {
    this.filePath = filePath;
  }

  /**
   * Creates a readable stream for the file.
   * @returns {ReadableStream} - A stream of file data.
   */
  stream() {
    return fs.createReadStream(this.filePath).pipe(csv({ headers: false }));
  }
}

module.exports = { FileReader };


