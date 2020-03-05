const fs = require("fs");

const parse = require("csv-parse/lib/sync");

const name = "en.orig";

const file = fs.readFileSync(name + ".csv");

const array = parse(file, {
  columns: true,
  skip_empty_lines: true
});

fs.writeFileSync(name + ".json", JSON.stringify(array));
