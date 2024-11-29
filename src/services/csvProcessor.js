const fs = require("fs");
const csv = require("csv-parser");
const { calculateTimestamp } = require("./timestampHelper");
const { generateInsertStatement } = require("./sqlGenerator");

/**
 * Processes a CSV file and generates SQL insert statements.
 * @param {string} inputFile - Path to the input CSV file.
 * @param {string} outputFile - Path to the output SQL file.
 */
async function processCsv(inputFile, outputFile) {
  let currentNmi = null;
  let intervalLength = null;
  const sqlStatements = [];

  const stream = fs.createReadStream(inputFile).pipe(csv({ headers: false }));

  for await (const row of stream) {
    const fields = Object.values(row);

    if (fields[0] === "200") {
      currentNmi = fields[1];
      intervalLength = parseInt(fields[8], 10);
    } else if (fields[0] === "300" && currentNmi) {
      const intervalDate = fields[1];
      const intervalsPerDay = Math.floor(1440 / intervalLength);
      const consumptions = fields.slice(2, 2 + intervalsPerDay);

      consumptions.forEach((value, index) => {
        if (value && !isNaN(value)) {
          const timestamp = calculateTimestamp(
            intervalDate,
            intervalLength,
            index
          );
          if (timestamp) {
            const sql = generateInsertStatement(currentNmi, timestamp, value);
            sqlStatements.push(sql);
          } else {
            console.warn(`Invalid date encountered: ${intervalDate}`);
          }
        }
      });
    }
  }

  // Write all SQL statements to the output file
  fs.writeFileSync(outputFile, sqlStatements.join("\n"));
  console.log(`SQL statements written to ${outputFile}`);
}

module.exports = { processCsv };
