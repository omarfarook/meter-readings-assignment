const fs = require("fs");
const path = require("path");

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
      fs.accessSync(dir, fs.constants.W_OK);
    } catch (error) {
      throw new Error(`Directory is not writable: ${dir}`);
    }

    // Initialize writable stream
    this.stream = fs.createWriteStream(filePath, { flags: "a" }); // Append mode
    if (!this.stream) {
      throw new Error("Failed to initialize file stream.");
    }
  }

  /**
   * Writes a single SQL statement to the output file.
   * @param {string} sql - The SQL statement to write.
   * @returns {Promise<void>} - Resolves when the write completes.
   */
  async write(sql) {
    if (typeof sql !== "string") {
      throw new Error("Invalid data: Data to write must be a string.");
    }

    return new Promise((resolve, reject) => {
      this.stream.write(`${sql}\n`, (err) => {
        if (err) {
          return reject(new Error(`Error writing to file: ${err.message}`));
        }
        resolve();
      });
    });
  }

  /**
   * Closes the writable stream.
   * @returns {Promise<void>} - Resolves when the stream is closed.
   */
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
