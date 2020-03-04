const fs = require("fs");

const orig = JSON.parse(fs.readFileSync("br.orig.json"));
const translated = JSON.parse(fs.readFileSync("translated.json"));

const translatedIndexes = translated
  .filter(elm => elm.Success == true)
  .map(elm => elm.i);

const toTranslate = orig.map((elm, i) => {
  return { ...elm, i };
});

const toTranslateMap = {};

toTranslate.forEach(element => {
  toTranslateMap[element.i] = element;
});

translated
  .filter(elm => elm.Success == true)
  .forEach(element => {
    toTranslateMap[element.i] = element;
  });

const indices = Object.keys(toTranslateMap).sort(
  (a, b) => parseInt(a) - parseInt(b)
);

const finalResult = [];

for (const i of indices) {
  finalResult.push(toTranslateMap[i]);
}

const translatedCleaned = finalResult.map(obj => {
  return `"${obj.ID}","${obj.Unknown}","${obj.Index}","${obj.Offset}","${obj.Text}"`.replace(
    /\n/g,
    "\\n"
  );
  //   return {
  //     ID: obj.ID,
  //     Unknown: obj.Unknown,
  //     Index: obj.Index,
  //     Offset: obj.Offset,
  //     Text: obj.Text
  //   };
});

fs.writeFileSync("final.csv", translatedCleaned.join("\n"));
