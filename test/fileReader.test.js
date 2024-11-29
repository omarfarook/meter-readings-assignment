const fs = require("fs");
const { FileReader } = require("../src/dataProcessing/FileReader");
const { Readable } = require("stream");

jest.mock("fs");
jest.mock("csv-parser", () => () => {
  const { Transform } = require("stream");
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      callback(null, {
        0: "200",
        1: "NEM1201009",
        2: "E1E2",
        3: "1",
        4: "E1",
        5: "N1",
        6: "01009",
        7: "kWh",
        8: "30300",
        9: "20231129",
        10: "0.461",
        11: "0.810",
      });
    },
  });
});

describe("FileReader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if the file does not exist", () => {
    fs.existsSync.mockReturnValue(false);
    expect(() => new FileReader("nonexistent-file.csv")).toThrow(
      "File does not exist at path: nonexistent-file.csv"
    );
  });

  it("should return a readable stream that can be piped", (done) => {
    const filePath = "valid-file.csv";

    // Mock `fs.existsSync` to return true (file exists)
    fs.existsSync.mockReturnValue(true);

    // Mock `fs.accessSync` to not throw an error (file is readable)
    fs.accessSync.mockImplementation(() => {});

    // Mock `fs.createReadStream` to simulate the CSV parser output
    fs.createReadStream.mockImplementation(() => {
      const stream = new Readable({ objectMode: true });
      stream.push({
        0: "200",
        1: "NEM1201009",
        2: "E1E2",
        3: "1",
        4: "E1",
        5: "N1",
        6: "01009",
        7: "kWh",
        8: "30300",
        9: "20231129",
        10: "0.461",
        11: "0.810",
      }); // Mocked parsed row
      stream.push(null); // End of stream
      return stream;
    });

    // Initialize FileReader and read the stream
    const fileReader = new FileReader(filePath);
    const stream = fileReader.stream();

    const data = [];
    stream.on("data", (chunk) => {
      console.log("Data received:", chunk);
      data.push(chunk);
    });

    stream.on("end", () => {
      console.log("Stream ended");
      try {
        expect(data).toEqual([
          {
            0: "200",
            1: "NEM1201009",
            2: "E1E2",
            3: "1",
            4: "E1",
            5: "N1",
            6: "01009",
            7: "kWh",
            8: "30300",
            9: "20231129",
            10: "0.461",
            11: "0.810",
          },
        ]);
        done(); // Indicate success
      } catch (error) {
        done(error); // Pass error to Jest
      }
    });

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      done(err); // Indicate error
    });
  });
});
