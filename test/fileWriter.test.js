const fs = require("fs");
const { FileWriter } = require("../src/dataProcessing/FileWriter");

jest.mock("fs");

describe("FileWriter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should write a SQL statement to the file", async () => {
    const mockStream = {
      write: jest.fn((data, callback) => callback()), // Simulate successful write
      end: jest.fn(),
    };

    // Mocking fs functions to simulate a valid directory and writable file
    jest.spyOn(fs, "existsSync").mockReturnValue(true); // Simulate directory exists
    jest.spyOn(fs, "accessSync").mockImplementation(() => {}); // Simulate directory is writable
    jest.spyOn(fs, "createWriteStream").mockReturnValue(mockStream); // Mock writable stream

    const fileWriter = new FileWriter("/valid-dir/output.sql");
    const sqlStatement = "INSERT INTO table VALUES (...);";

    await fileWriter.write(sqlStatement);

    expect(mockStream.write).toHaveBeenCalledWith(
      `${sqlStatement}\n`,
      expect.any(Function)
    );
  });

  it("should close the writable stream", async () => {
    const dir = "/valid-dir";
    fs.existsSync.mockReturnValue(true);

    const mockStream = {
      write: jest.fn(),
      end: jest.fn((callback) => callback()), // Simulate successful close
    };
    jest.spyOn(fs, "createWriteStream").mockReturnValue(mockStream);

    const fileWriter = new FileWriter(`${dir}/output.sql`);

    await fileWriter.close();

    expect(mockStream.end).toHaveBeenCalled();
  });
});
