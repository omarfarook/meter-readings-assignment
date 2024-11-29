/**
 * Orchestrates the CSV file processing workflow.
 * This function:
 *  - Reads the CSV file using the provided FileReader instance.
 *  - Parses each row using the CsvParser instance.
 *  - Generates SQL insert statements using the SqlGenerator instance.
 *  - Writes the generated SQL statements to an output file using the FileWriter instance.
 * 
 * The function processes rows in batches to optimize performance and ensure scalability for large datasets.
 * It also handles errors gracefully, ensuring that resources such as file streams are properly released.
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
 * @param {Object} fileWriter - The file writer instance responsible for writing the generated SQL statements to an output file.
 * @param {Function} fileWriter.write - A method that writes an array of SQL statements to the output file.
 * @param {Function} fileWriter.close - A method that closes the output file stream.
 * @throws {Error} - Throws an error if any of the processing steps fail, such as file read errors or invalid data.
 * @returns {Promise<void>} - A promise that resolves when the entire processing workflow is successfully completed.
 */

async function processCsv(fileReader, csvParser, sqlGenerator, fileWriter) {
  const batchSize = 1000;
  let sqlStatements = [];
  let successfulRows = 0;
  let totalRows = 0;

  try {
    for await (const row of fileReader.stream()) {
      totalRows++;
      try {
        const parsedData = csvParser.parseRow(row);

        if (parsedData) {
          parsedData.forEach(async ({ nmi, timestamp, consumption }) => {
            const sql = sqlGenerator.generateInsertStatement(
              nmi,
              timestamp,
              consumption
            );
            sqlStatements.push(sql);
            successfulRows++;

            // Write batch to file asynchronously if it reaches the batch size
            if (sqlStatements.length >= batchSize) {
              await fileWriter.write(sqlStatements);
              sqlStatements = []; // Clear batch
            }
          });
        }
      } catch (error) {
        console.error(
          `Error processing row: ${JSON.stringify(row)} - ${error.message}`
        );
      }
    }

    // Write remaining SQL statements or an empty array for empty files
    if (sqlStatements.length > 0 || totalRows === 0) {
      await fileWriter.write(sqlStatements);
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