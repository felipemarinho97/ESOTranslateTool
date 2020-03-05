const fs = require("fs");

const br = JSON.parse(fs.readFileSync("translatedFiltered.json")).map(elm => {
  return { ...elm, i: `${elm.ID}-${elm.Unknown}-${elm.Index}` };
});
const en = JSON.parse(fs.readFileSync("en.orig.json")).map(elm => {
  return { ...elm, i: `${elm.ID}-${elm.Unknown}-${elm.Index}` };
});

const toTranslateMap = {};

en.forEach(element => {
  toTranslateMap[element.i] = element;
});

br.forEach(element => {
  toTranslateMap[element.i] = element;
});

const final = Object.values(toTranslateMap);

// fs.writeFileSync("merged.json", JSON.stringify(final, null, 4));
const translatedCleaned = final.map(obj => {
  return `"${obj.ID}","${obj.Unknown}","${obj.Index}","${obj.Offset}","${obj.Text}"`.replace(
    /\n/g,
    "\\n"
  );
});

fs.writeFileSync("merged.csv", translatedCleaned.join("\n"));
