/**
 * Orchestrates the CSV file processing workflow.
 * It reads the CSV file using the provided FileReader, parses its content with CsvParser,
 * generates SQL insert statements with SqlGenerator, and writes the results using FileWriter.
 *
 * @async
 * @function processCsv
 * @param {Object} fileReader - The file reader instance for reading input files.
 * @param {Object} csvParser - The CSV parser instance for parsing CSV rows.
 * @param {Object} sqlGenerator - The SQL generator instance for creating SQL statements.
 * @param {Object} fileWriter - The file writer instance for writing output files.
 * @throws {Error} - Throws an error if any of the processing steps fail.
 * @returns {Promise<void>} - A promise that resolves when the entire process is completed.
 */
async function processCsv(fileReader, csvParser, sqlGenerator, fileWriter) {
  const sqlStatements = [];
  let successfulRows = 0;

  for await (const row of fileReader.stream()) {
    try {
      const parsedData = csvParser.parseRow(row);

      if (parsedData) {
        parsedData.forEach(({ nmi, timestamp, consumption }) => {
          const sql = sqlGenerator.generateInsertStatement(
            nmi,
            timestamp,
            consumption
          );
          sqlStatements.push(sql);
          successfulRows++;
        });
      }
    } catch (error) {
      console.error(`Error processing row: ${JSON.stringify(row)} - ${error.message}`);
    }
  }

  fileWriter.write(sqlStatements);

  // Log issues identified by CsvParser
  csvParser.reportIssues();

  // Display a summary of processing
  console.log(`Successfully processed rows: ${successfulRows}`);
}

module.exports = { processCsv };
