# Meter Readings Assignment

This project processes NEM12 meter readings and generates SQL insert statements for bulk insertion into a database. It is designed for scalability and handles large datasets efficiently using streams.

## Requirements

- **Node.js**: Version `20.x` or higher (tested with Node.js `20.18.1`)
- **pnpm**: Version `8.x` or higher (tested with pnpm `9.0.6`)

## Setup Instructions

Follow the steps below to set up and run the application.

### 1. Clone the Repository

```bash
git clone git@github.com:omarfarook/meter-readings-assignment.git
cd meter-readings-assignment
```

### 2. Install Dependencies
To install the required dependencies, run.

```bash
 pnpm install
 ```

 ### 3. Start the Application
 To process the input file and generate SQL statements, run:

```bash
 pnpm start
```
The application will read the input file located at ./input/example-data.csv and output the generated SQL statements to ./output/output.sql. You can configure these paths in the code or by using environment variables.

### 4. Run Tests
To ensure that the application is working as expected, run the test cases:
```bash
pnpm test
```

### File Structure
The project follows a modular structure:
```bash
meter-readings-assignment/
├── input/                  # Input directory for CSV files
│   └── example-data.csv    # Example input file
├── output/                 # Output directory for generated SQL files
│   └── output.sql          # Example output file
├── src/                    # Source code directory
│   ├── dataProcessing/     # Core data processing logic
│   │   ├── FileReader.js   # Handles reading input CSV files
│   │   ├── CsvParser.js    # Parses NEM12 data from CSV rows
│   │   ├── SqlGenerator.js # Generates SQL insert statements
│   │   ├── FileWriter.js   # Handles writing SQL statements to output file
│   │   └── processCsv.js   # Main workflow orchestrator
│   └── constants/          # Constants used across the application
│       └── index.js        # Record types, column indices, etc.
├── test/                   # Unit test cases
│   ├── fileReader.test.js  # Tests for FileReader
│   ├── fileWriter.test.js  # Tests for FileWriter
│   ├── csvParser.test.js   # Tests for CsvParser
│   └── processCsv.test.js  # Tests for processCsv workflow
├── package.json            # Project metadata and dependencies
├── README.md               # Project documentation
└── .gitignore              # Ignored files and directories

```

### Key Features
Scalability: Processes large datasets using streams to minimize memory usage.
Modular Design: Clean separation of concerns between file handling, parsing, SQL generation, and orchestration.
Error Handling: Logs invalid rows and reports issues during parsing.
Batch Processing: Writes SQL statements incrementally for better performance.


