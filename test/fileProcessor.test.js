const fs = require("fs");
const { processFile } = require("../src/fileProcessor");
jest.mock("fs");

describe("processFile", () => {
  const mockInput = `200,NEM1201009,E1E2,1,E1,N1,01009,kWh,30,20231129
300,20231129,0,0,0.461,0.810,0.568,1.234`;

  beforeEach(() => {
    jest.resetAllMocks();
    fs.createReadStream.mockImplementation(() => {
      const Readable = require("stream").Readable;
      const s = new Readable();
      s.push(mockInput);
      s.push(null);
      return s;
    });

    fs.writeFileSync.mockImplementation(() => {});
  });

  it("should process the file and generate SQL insert statements", async () => {
    const outputFile = "output.sql";
    await processFile("input.txt", outputFile);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      outputFile,
      expect.stringMatching(/INSERT INTO meter_readings/)
    );
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
  });

  it("should handle empty input gracefully", async () => {
    fs.createReadStream.mockImplementation(() => {
      const Readable = require("stream").Readable;
      const s = new Readable();
      s.push(null);
      return s;
    });

    const outputFile = "output.sql";
    await processFile("empty.txt", outputFile);

    expect(fs.writeFileSync).toHaveBeenCalledWith(outputFile, "");
  });
});
