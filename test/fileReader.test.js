const fs = require("fs");
const { FileReader } = require("../src/dataProcessing/FileReader");

jest.mock("fs"); // Mock the `fs` module

describe("FileReader", () => {
  const mockInputData = `200,NEM1201009,E1E2,1,E1,N1,01009,kWh,30,20231129
300,20231129,0,0,0.461,0.810,0.568,1.234`;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return a readable stream of file data", async () => {
    // Mock a valid file stream
    fs.createReadStream.mockImplementation(() => {
      const Readable = require("stream").Readable;
      const stream = new Readable();
      stream.push(mockInputData);
      stream.push(null); // End of stream
      return stream;
    });

    const fileReader = new FileReader("mock-file.csv");
    const stream = fileReader.stream();

    const result = [];
    for await (const chunk of stream) {
      result.push(chunk);
    }

    expect(result.length).toBe(2); // Two rows in the mock data
    expect(result[0]["0"]).toBe("200"); // First row starts with "200"
    expect(result[1]["0"]).toBe("300"); // Second row starts with "300"
  });

  const possibleInvalidFilePaths = [undefined, null, ""];

  Array.from(possibleInvalidFilePaths).forEach((invalidFilePath) => {
    it(`should throw an error if ${invalidFilePath} is provided`, () => {
      expect(() => new FileReader("")).toThrow(
        "Invalid filePath: A valid file path must be provided."
      );
    });
  });
});
