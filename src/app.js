const { processFile } = require('./fileProcessor');

// Example usage
const inputFile = 'data/example-data.txt'; // Input file path
const outputFile = 'data/output.sql'; // Output file path

processFile(inputFile, outputFile).catch((error) => {
  console.error('Error processing file:', error);
});
