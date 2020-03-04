const fs = require("fs");

const parse = require("csv-parse/lib/sync");

const file = fs.readFileSync("br.orig.csv");

const array = parse(file, {
  columns: true,
  skip_empty_lines: true
});

fs.writeFileSync("br.orig.json", JSON.stringify(array));
