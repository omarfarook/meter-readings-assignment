const { FileReader } = require('./dataProcessing/FileReader');
const { CsvParser } = require('./dataProcessing/csvParser');
const { SqlGenerator } = require('./dataProcessing/SqlGenerator');
const { FileWriter } = require('./dataProcessing/FileWriter');
const { processCsv } = require('./dataProcessing/csvProcessor');

(async () => {
  try {
    const fileReader = new FileReader('data/example-data.csv');
    const csvParser = new CsvParser();
    const sqlGenerator = new SqlGenerator();
    const fileWriter = new FileWriter('data/output.sql');

    await processCsv(fileReader, csvParser, sqlGenerator, fileWriter);
  } catch (error) {
    console.error('Error processing CSV file:', error);
  }
})();
