const { processCsv } = require("../src/dataProcessing/csvProcessor");

describe("processCsv", () => {
  let fileReaderMock;
  let csvParserMock;
  let sqlGeneratorMock;
  let fileWriterMock;

  beforeEach(() => {
    fileReaderMock = {
      stream: jest.fn().mockImplementation(() => {
        const { Readable } = require("stream");
        const stream = new Readable({ objectMode: true });
        stream.push({ 0: "200", 1: "NEM1201009", 8: "30" }); // Valid 200 record
        stream.push({ 0: "300", 1: "20231129", 2: "0.461", 3: "0.810" }); // Valid 300 record
        stream.push({ 0: "300", 1: "INVALID_DATE", 2: "0.123" }); // Invalid 300 record
        stream.push(null); // End of stream
        return stream;
      }),
    };

    csvParserMock = {
      parseRow: jest.fn().mockImplementation((row) => {
        if (row[0] === "200") return null;
        if (row[0] === "300" && row[1] === "20231129") {
          return [
            {
              nmi: "NEM1201009",
              timestamp: "2023-11-29T00:00:00.000Z",
              consumption: 0.461,
            },
            {
              nmi: "NEM1201009",
              timestamp: "2023-11-29T00:30:00.000Z",
              consumption: 0.81,
            },
          ];
        }
        throw new Error(`Invalid interval date: ${row[1]}`);
      }),
      reportIssues: jest.fn(),
    };

    sqlGeneratorMock = {
      generateInsertStatement: jest.fn((nmi, timestamp, consumption) => {
        return `INSERT INTO meter_readings (nmi, "timestamp", consumption) VALUES ('${nmi}', '${timestamp}', ${consumption});`;
      }),
    };

    fileWriterMock = {
      write: jest.fn(),
      close: jest.fn(() => Promise.resolve()), // Added close method to mock
    };
  });

  it("should process valid rows and log issues for problematic rows", async () => {
    await processCsv(
      fileReaderMock,
      csvParserMock,
      sqlGeneratorMock,
      fileWriterMock
    );

    // Valid rows processed
    expect(csvParserMock.parseRow).toHaveBeenCalledTimes(3); // 2 valid rows and 1 problematic row
    expect(sqlGeneratorMock.generateInsertStatement).toHaveBeenCalledTimes(2);
    expect(fileWriterMock.write).toHaveBeenCalledWith([
      "INSERT INTO meter_readings (nmi, \"timestamp\", consumption) VALUES ('NEM1201009', '2023-11-29T00:00:00.000Z', 0.461);",
      "INSERT INTO meter_readings (nmi, \"timestamp\", consumption) VALUES ('NEM1201009', '2023-11-29T00:30:00.000Z', 0.81);",
    ]);

    // Problematic rows logged
    expect(csvParserMock.reportIssues).toHaveBeenCalled();
    expect(fileWriterMock.close).toHaveBeenCalled(); // Ensure close is called
  });

  it("should handle an empty file gracefully", async () => {
    fileReaderMock.stream = jest.fn().mockImplementation(() => {
      const { Readable } = require("stream");
      const stream = new Readable({ objectMode: true });
      stream.push(null); // End of stream
      return stream;
    });
  
    await processCsv(fileReaderMock, csvParserMock, sqlGeneratorMock, fileWriterMock);
  
    expect(csvParserMock.parseRow).not.toHaveBeenCalled(); // No rows to parse
    expect(sqlGeneratorMock.generateInsertStatement).not.toHaveBeenCalled(); // No SQL to generate
    expect(fileWriterMock.write).toHaveBeenCalledWith([]); // Ensure empty array is written
    expect(csvParserMock.reportIssues).toHaveBeenCalled(); // Issues reported
    expect(fileWriterMock.close).toHaveBeenCalled(); // Stream closed
  });
  

  it("should throw an error if FileReader fails", async () => {
    fileReaderMock.stream = jest.fn(() => {
      throw new Error("FileReader error");
    });
  
    await expect(
      processCsv(fileReaderMock, csvParserMock, sqlGeneratorMock, fileWriterMock)
    ).rejects.toThrow("FileReader error");
  
    expect(fileWriterMock.close).toHaveBeenCalled(); // Ensure close is still called
  });
  
});
