const { CsvParser } = require("../src/dataProcessing/CsvParser");
const { COLUMN_INDICES, RECORD_TYPES } = require("../src/constants");

describe("CsvParser", () => {
  let csvParser;

  beforeEach(() => {
    csvParser = new CsvParser();
  });

  it("should parse a valid 200 record", () => {
    const row = {
      [COLUMN_INDICES.RECORD_TYPE]: RECORD_TYPES.TYPE_200,
      [COLUMN_INDICES.NMI]: "NEM1201009",
      [COLUMN_INDICES.INTERVAL_LENGTH]: 30, // Interval length as string (mock CSV data)
    };

    const result = csvParser.parseRow(row);

    expect(result).toBeNull(); // 200 records don't return parsed data
    expect(csvParser.currentNmi).toBe("NEM1201009");
    expect(csvParser.intervalLength).toBe(30); // Parsed as a number
  });

  it("should parse a valid 300 record and return consumption data", () => {
    csvParser.currentNmi = "NEM1201009";
    csvParser.intervalLength = 30;

    const row = {
      [COLUMN_INDICES.RECORD_TYPE]: RECORD_TYPES.TYPE_300,
      [COLUMN_INDICES.INTERVAL_DATE]: "20231129",
      [COLUMN_INDICES.CONSUMPTION_START]: "0.461",
      [COLUMN_INDICES.CONSUMPTION_START + 1]: "0.810",
    };

    const result = csvParser.parseRow(row);
    expect(result).toEqual([
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
    ]);
  });

  it("should add invalid rows to problematicRows for unrecognized record types", () => {
    const row = { [COLUMN_INDICES.RECORD_TYPE]: "400" };

    const result = csvParser.parseRow(row);
    expect(result).toBeNull();
    expect(csvParser.problematicRows).toEqual([
      { row, reason: "Unrecognized record type: 400" },
    ]);
  });

  it("should add invalid rows to problematicRows for invalid timestamps", () => {
    csvParser.currentNmi = "NEM1201009";
    csvParser.intervalLength = 30;

    const row = {
      [COLUMN_INDICES.RECORD_TYPE]: RECORD_TYPES.TYPE_300,
      [COLUMN_INDICES.INTERVAL_DATE]: "INVALID_DATE",
    };

    const result = csvParser.parseRow(row);
    expect(result).toBeNull();
    expect(csvParser.problematicRows).toEqual([
      { row, reason: "Invalid interval date: INVALID_DATE" },
    ]);
  });

  it("should log problematic rows in reportIssues", () => {
    const problematicRow = { [COLUMN_INDICES.RECORD_TYPE]: "400" };
    csvParser.problematicRows.push({
      row: problematicRow,
      reason: "Unrecognized record type: 400",
    });

    console.warn = jest.fn();
    csvParser.reportIssues();
    expect(console.warn).toHaveBeenCalledWith(
      "The following rows were problematic:"
    );
    expect(console.warn).toHaveBeenCalledWith(
      `Row: ${JSON.stringify(
        problematicRow
      )} - Reason: Unrecognized record type: 400`
    );
  });

  it("should log no issues when there are no problematic rows in reportIssues", () => {
    console.log = jest.fn();
    csvParser.reportIssues();
    expect(console.log).toHaveBeenCalledWith(
      "No issues detected during parsing."
    );
  });
});
