/**
 * Orchestrates the CSV file processing workflow.
 * This function:
 *  - Reads the CSV file using the provided FileReader instance.
 *  - Parses each row using the CsvParser instance.
 *  - Generates SQL insert statements using the SqlGenerator instance.
 *  - Writes the generated SQL statements directly to the output file stream using the FileWriter instance.
 * 
 * This implementation ensures scalability by streaming SQL statements directly to the output file
 * as they are generated, without storing them in memory.
 *
 * @async
 * @function processCsv
 * @param {Object} fileReader - The file reader instance responsible for reading input files.
 * @param {Function} fileReader.stream - A method that returns a readable stream of the file's content.
 * @param {Object} csvParser - The CSV parser instance responsible for parsing rows from the input file.
 * @param {Function} csvParser.parseRow - A method that parses a single CSV row and returns structured data.
 * @param {Function} csvParser.reportIssues - A method that logs issues encountered during parsing.
 * @param {Object} sqlGenerator - The SQL generator instance for creating SQL insert statements.
 * @param {Function} sqlGenerator.generateInsertStatement - A method that generates an SQL insert statement for a single record.
 * @param {Object} fileWriter - The file writer instance responsible for streaming SQL statements to an output file.
 * @param {Function} fileWriter.write - A method that writes a single SQL statement to the output file.
 * @param {Function} fileWriter.close - A method that closes the output file stream.
 * @throws {Error} - Throws an error if any of the processing steps fail, such as file read errors or invalid data.
 * @returns {Promise<void>} - A promise that resolves when the entire processing workflow is successfully completed.
 */
async function processCsv(fileReader, csvParser, sqlGenerator, fileWriter) {
  let successfulRows = 0;
  let totalRows = 0;
  let invalidRows = 0;

  try {
    // Stream input rows from FileReader
    for await (const row of fileReader.stream()) {
      totalRows++;
      try {
        const parsedData = csvParser.parseRow(row);

        // If the row is successfully parsed, process its data
        if (parsedData) {
          for (const { nmi, timestamp, consumption } of parsedData) {
            const sql = sqlGenerator.generateInsertStatement(
              nmi,
              timestamp,
              consumption
            );

            // Write each SQL statement directly to the output stream
            await fileWriter.write(sql);

            successfulRows++;
          }
        }
      } catch (error) {
        // Increment invalid rows count and log the error
        invalidRows++;
        console.error(
          `Error processing row: ${JSON.stringify(row)} - ${error.message}`
        );
      }
    }

    // Explicitly handle case where no rows are processed
    if (successfulRows === 0) {
      await fileWriter.write([]); // Write an empty array to signify no data
    }
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    throw error;
  } finally {
    await fileWriter.close();
  }

  csvParser.reportIssues();

  console.log(
    `Total rows processed: ${successfulRows}. SQL statements successfully written to the output file.`
  );
}

module.exports = { processCsv };