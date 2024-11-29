const fs = require('fs');

class FileWriter {
  constructor(filePath) {
    this.filePath = filePath;
  }

  /**
   * Writes data to the file.
   * @param {Array<string>} data - Array of SQL statements.
   */
  write(data) {
    fs.writeFileSync(this.filePath, data.join('\n'));
  }
}

module.exports = { FileWriter };
