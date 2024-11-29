const fs = require("fs");
const { FileWriter } = require("../src/dataProcessing/FileWriter");

const path = require("path");

jest.mock("fs");
jest.mock("path");

describe("FileWriter", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if the directory does not exist", () => {
    path.dirname.mockReturnValue("/nonexistent-dir");
    fs.existsSync.mockReturnValue(false);

    expect(() => new FileWriter("/nonexistent-dir/file.sql")).toThrow(
      "Directory does not exist: /nonexistent-dir"
    );
  });

  it("should throw an error if the directory is not writable", () => {
    path.dirname.mockReturnValue("/readonly-dir");
    fs.existsSync.mockReturnValue(true);
    fs.accessSync.mockImplementation(() => {
      throw new Error("Permission denied");
    });

    expect(() => new FileWriter("/readonly-dir/file.sql")).toThrow(
      "Directory is not writable: /readonly-dir"
    );
  });

  it("should initialize a writable stream if the directory is writable", () => {
    path.dirname.mockReturnValue("/valid-dir");
    fs.existsSync.mockReturnValue(true);
    fs.accessSync.mockImplementation(() => {});
    const mockStream = { write: jest.fn(), end: jest.fn() };
    jest.spyOn(fs, "createWriteStream").mockReturnValue(mockStream);

    const fileWriter = new FileWriter("/valid-dir/file.sql");

    expect(fs.createWriteStream).toHaveBeenCalledWith("/valid-dir/file.sql", {
      flags: "a",
    });
    expect(fileWriter.stream).toBe(mockStream);
  });

  it("should write data to the file asynchronously", async () => {
    path.dirname.mockReturnValue("/valid-dir");
    fs.existsSync.mockReturnValue(true);
    fs.accessSync.mockImplementation(() => {});
    const mockStream = {
      write: jest.fn((data, callback) => callback()),
      end: jest.fn(),
    };
    jest.spyOn(fs, "createWriteStream").mockReturnValue(mockStream);

    const fileWriter = new FileWriter("/valid-dir/file.sql");
    const sqlStatements = ["INSERT INTO table VALUES (...);"];
    await fileWriter.write(sqlStatements);

    expect(mockStream.write).toHaveBeenCalledWith(
      "INSERT INTO table VALUES (...);\n",
      expect.any(Function)
    );
  });

  it("should handle write errors gracefully", async () => {
    path.dirname.mockReturnValue("/valid-dir");
    fs.existsSync.mockReturnValue(true);
    fs.accessSync.mockImplementation(() => {});
    const mockStream = {
      write: jest.fn((data, callback) =>
        callback(new Error("Write operation failed"))
      ),
      end: jest.fn(),
    };
    jest.spyOn(fs, "createWriteStream").mockReturnValue(mockStream);

    const fileWriter = new FileWriter("/valid-dir/file.sql");
    const sqlStatements = ["INSERT INTO table VALUES (...);"];

    await expect(fileWriter.write(sqlStatements)).rejects.toThrow(
      "Error writing to file: Write operation failed"
    );
  });

  it("should close the stream asynchronously", async () => {
    path.dirname.mockReturnValue("/valid-dir");
    fs.existsSync.mockReturnValue(true);
    fs.accessSync.mockImplementation(() => {});
    const mockStream = {
      write: jest.fn(),
      end: jest.fn((callback) => callback()),
    };
    jest.spyOn(fs, "createWriteStream").mockReturnValue(mockStream);

    const fileWriter = new FileWriter("/valid-dir/file.sql");
    await fileWriter.close();

    expect(mockStream.end).toHaveBeenCalled();
  });

  it("should handle stream close errors gracefully", async () => {
    path.dirname.mockReturnValue("/valid-dir");
    fs.existsSync.mockReturnValue(true);
    fs.accessSync.mockImplementation(() => {});
    const mockStream = {
      write: jest.fn(),
      end: jest.fn((callback) =>
        callback(new Error("Failed to close the stream"))
      ),
    };
    jest.spyOn(fs, "createWriteStream").mockReturnValue(mockStream);

    const fileWriter = new FileWriter("/valid-dir/file.sql");
    await expect(fileWriter.close()).rejects.toThrow(
      "Error closing file stream: Failed to close the stream"
    );
  });
});
