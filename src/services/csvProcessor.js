const { FileReader } = require('./FileReader');
const { CsvParser } = require('./csvParser');
const { SqlGenerator } = require('./SqlGenerator');
const { FileWriter } = require('./FileWriter');

/**
 * Processes a CSV file to generate SQL statements.
 * @param {string} inputFile - Path to the input file.
 * @param {string} outputFile - Path to the output file.
 */
async function processCsv(inputFile, outputFile) {
  const reader = new FileReader(inputFile);
  const parser = new CsvParser();
  const sqlGenerator = new SqlGenerator();
  const writer = new FileWriter(outputFile);

  const sqlStatements = [];

  for await (const row of reader.stream()) {
    const parsedData = parser.parseRow(row);

    if (parsedData) {
      parsedData.forEach(({ nmi, timestamp, consumption }) => {
        const sql = sqlGenerator.generateInsertStatement(nmi, timestamp, consumption);
        sqlStatements.push(sql);
      });
    }
  }

  writer.write(sqlStatements);
  console.log(`SQL statements written to ${outputFile}`);
}

module.exports = { processCsv };
