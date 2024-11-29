const { processCsv } = require("../src/dataProcessing/csvProcessor");

describe("processCsv", () => {
  let fileReaderMock;
  let csvParserMock;
  let sqlGeneratorMock;
  let fileWriterMock;

  beforeEach(() => {
    // Mock FileReader
    fileReaderMock = {
      stream: jest.fn().mockImplementation(() => {
        const { Readable } = require("stream");
        const stream = new Readable({ objectMode: true });
        stream.push({ 0: "200", 1: "NEM1201009", 8: "30" }); // 200 record
        stream.push({ 0: "300", 1: "20231129", 2: "0.461", 3: "0.810" }); // 300 record
        stream.push(null); // End of stream
        return stream;
      }),
    };

    // Mock CsvParser
    csvParserMock = {
      parseRow: jest.fn().mockImplementation((row) => {
        if (row[0] === "200") {
          return null; // No data for 200 records
        }
        if (row[0] === "300") {
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
        return null;
      }),
    };

    // Mock SqlGenerator
    sqlGeneratorMock = {
      generateInsertStatement: jest
        .fn()
        .mockImplementation((nmi, timestamp, consumption) => {
          return `INSERT INTO meter_readings (nmi, "timestamp", consumption) VALUES ('${nmi}', '${timestamp}', ${consumption});`;
        }),
    };

    // Mock FileWriter
    fileWriterMock = {
      write: jest.fn(),
    };
  });

  it("should process CSV and write SQL statements to the output file", async () => {
    await processCsv(
      fileReaderMock,
      csvParserMock,
      sqlGeneratorMock,
      fileWriterMock
    );

    expect(fileReaderMock.stream).toHaveBeenCalledTimes(1);

    expect(csvParserMock.parseRow).toHaveBeenCalledTimes(2); // For 200 and 300 records

    expect(sqlGeneratorMock.generateInsertStatement).toHaveBeenCalledTimes(2); // Two parsed rows from 300 record

    expect(fileWriterMock.write).toHaveBeenCalledTimes(1);

    const expectedSql = [
      "INSERT INTO meter_readings (nmi, \"timestamp\", consumption) VALUES ('NEM1201009', '2023-11-29T00:00:00.000Z', 0.461);",
      "INSERT INTO meter_readings (nmi, \"timestamp\", consumption) VALUES ('NEM1201009', '2023-11-29T00:30:00.000Z', 0.810);",
    ];
    expect(fileWriterMock.write).toHaveBeenCalledWith(expectedSql);
  });

  it("should handle empty CSV gracefully", async () => {
    fileReaderMock.stream = jest.fn().mockImplementation(() => {
      const { Readable } = require("stream");
      const stream = new Readable({ objectMode: true });
      stream.push(null); // End of stream
      return stream;
    });

    await processCsv(
      fileReaderMock,
      csvParserMock,
      sqlGeneratorMock,
      fileWriterMock
    );

    expect(fileReaderMock.stream).toHaveBeenCalledTimes(1);

    expect(csvParserMock.parseRow).not.toHaveBeenCalled();

    expect(sqlGeneratorMock.generateInsertStatement).not.toHaveBeenCalled();
    expect(fileWriterMock.write).toHaveBeenCalledWith([]);
  });

  it("should handle invalid CSV rows gracefully", async () => {
    csvParserMock.parseRow = jest.fn().mockImplementation(() => null); // All rows are invalid

    await processCsv(
      fileReaderMock,
      csvParserMock,
      sqlGeneratorMock,
      fileWriterMock
    );

    expect(fileReaderMock.stream).toHaveBeenCalledTimes(1);

    expect(csvParserMock.parseRow).toHaveBeenCalledTimes(2); // For 200 and 300 records

    expect(sqlGeneratorMock.generateInsertStatement).not.toHaveBeenCalled();

    expect(fileWriterMock.write).toHaveBeenCalledWith([]);
  });

  it("should throw an error if FileReader fails", async () => {
    fileReaderMock.stream = jest.fn(() => {
      throw new Error("FileReader error");
    });

    await expect(
      processCsv(
        fileReaderMock,
        csvParserMock,
        sqlGeneratorMock,
        fileWriterMock
      )
    ).rejects.toThrow("FileReader error");
  });
});
