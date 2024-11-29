const fs = require('fs');
const readline = require('readline');
const { calculateTimestamp } = require('./utils');
const { generateInsertStatement } = require('./sqlGenerator');

/**
 * Parses the NEM12 file and generates SQL INSERT statements.
 * @param {string} inputFile - Path to the input NEM12 file.
 * @param {string} outputFile - Path to the output SQL file.
 */
async function processFile(inputFile, outputFile) {
  const rl = readline.createInterface({
    input: fs.createReadStream(inputFile),
    output: process.stdout,
    terminal: false,
  });

  const insertStatements = [];
  let currentNmi = null;
  let intervalLength = null;

  for await (const line of rl) {
    const fields = line.split(',');

    if (fields[0] === '200') {
      currentNmi = fields[1];
      intervalLength = parseInt(fields[8], 10);
    } else if (fields[0] === '300' && currentNmi) {
      const intervalDate = fields[1];
      const intervalsPerDay = Math.floor(1440 / intervalLength);
      const consumptions = fields.slice(2, 2 + intervalsPerDay);

      consumptions.forEach((value, index) => {
        if (value && !isNaN(value)) {
          const timestamp = calculateTimestamp(intervalDate, intervalLength, index);
          if (timestamp) {
            const sql = generateInsertStatement(currentNmi, timestamp, value);
            insertStatements.push(sql);
          } else {
            console.warn(`Invalid date encountered: ${intervalDate}`);
          }
        }
      });
    }
  }

  fs.writeFileSync(outputFile, insertStatements.join('\n'));
  console.log(`SQL insert statements written to ${outputFile}`);
}

module.exports = { processFile };
