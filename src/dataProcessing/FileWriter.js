const fs = require('fs');
const path = require('path');

class FileWriter {
  constructor(filePath) {
    if (!filePath || typeof filePath !== "string") {
      throw new Error("Invalid filePath: A valid file path must be provided.");
    }

    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      throw new Error(`Directory does not exist: ${dir}`);
    }

    try {
      fs.accessSync(dir, fs.constants.W_OK); // Check for writable access
    } catch (error) {
      throw new Error(`Directory is not writable: ${dir}`);
    }

    this.stream = fs.createWriteStream(filePath, { flags: 'a' });
    if (!this.stream) {
      throw new Error("Failed to initialize file stream.");
    }
  }

  async write(data) {
    if (!Array.isArray(data)) {
      throw new Error('Invalid data: Data to write must be an array of strings.');
    }

    if (!this.stream) {
      throw new Error('File stream is not initialized.');
    }

    const content = data.join('\n') + '\n';
    return new Promise((resolve, reject) => {
      this.stream.write(content, (err) => {
        if (err) {
          return reject(new Error(`Error writing to file: ${err.message}`));
        }
        resolve();
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (!this.stream) {
        return resolve();
      }

      this.stream.end((err) => {
        if (err) {
          return reject(new Error(`Error closing file stream: ${err.message}`));
        }
        resolve();
      });
    });
  }
}

module.exports = { FileWriter };
