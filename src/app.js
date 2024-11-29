const { processCsv } = require('./services/csvProcessor');

(async () => {
  try {
    const inputFile = 'data/example-data.csv'; // Input CSV file path
    const outputFile = 'data/output.sql';     // Output SQL file path
    await processCsv(inputFile, outputFile);
  } catch (error) {
    console.error('Error processing file:', error);
  }
})();
