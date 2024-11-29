const fs = require("fs");

class FileWriter {
  constructor(filePath) {
    if (!filePath || typeof filePath !== "string") {
      throw new Error("Invalid filePath: A valid file path must be provided.");
    }

    this.filePath = filePath;
  }

  /**
   * Writes data to the file.
   * @param {Array<string>} data - Array of SQL statements.
   */
  write(data) {
    if (!Array.isArray(data)) {
      throw new Error(
        "Invalid data: Data to write must be an array of strings."
      );
    }

    try {
      fs.writeFileSync(this.filePath, data.join("\n"));
    } catch (error) {
      throw new Error(
        `Error writing to file at ${this.filePath}: ${error.message}`
      );
    }
  }
}

module.exports = { FileWriter };
