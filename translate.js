const { translateStrings } = require("./translateStrings");
const { of } = require("rxjs");
const { mergeMap, finalize } = require("rxjs/operators");
const fs = require("fs");
const makeEta = require("simple-eta");

// const parse = require("csv-parse/lib/sync");

// const file = fs.readFileSync("br.orig.csv");

// const array = parse(file, {
//   columns: true,
//   skip_empty_lines: true
// });

// fs.writeFileSync("br.orig.json", JSON.stringify(array));

const array = JSON.parse(fs.readFileSync("br.orig.json"));
const translated = JSON.parse(fs.readFileSync("translated.json"));

const translatedIndexes = translated
  .filter(elm => elm.Success == true)
  .map(elm => elm.i);
const toTranslate = array
  .map((elm, i) => {
    return { ...elm, i };
  })
  .filter(elm => !translatedIndexes.includes(elm.i));
// total = 761405

const MAX_CONCURRENCY = 32;
const referential = 0;
const amount = null || toTranslate.length;

const dialogs = toTranslate.slice(referential, referential + amount);

function translateDialog(dialog) {
  return new Promise(resolve => {
    // console.log(dialog.Text);
    const arrayOfStrings = dialog.Text.split(/\\n\\n|\\n/).map((string, i) => {
      return {
        i,
        string
      };
    });

    translateStrings(arrayOfStrings)
      .then(res => {
        resolve({
          ...dialog,
          Text: res.join("\n\n"),
          Success: true
        });
      })
      .catch(err => {
        resolve({ ...dialog, Success: false, code: err });
      });
  });
}

const translatedDialogs = of(...dialogs);

const result = translatedDialogs.pipe(
  mergeMap(dial => translateDialog(dial), MAX_CONCURRENCY),
  finalize(exitProgram)
);

let count = 0;
const eta = makeEta({ min: count, max: toTranslate.length });

eta.start();
result.subscribe(dialog => {
  if (dialog.Success) translated.push(dialog);
  if (dialog.code == 429) exitProgram();

  const percentage = ((translated.length / array.length) * 100).toFixed(2);
  eta.report(count + 1);

  process.stdout.write(
    `Atualmente em ${percentage}% (${translated.length}/${
      array.length
    }) do jogo traduzido - ${count++} de ${
      toTranslate.length
    } restantes - Aprox. ${(eta.estimate() / 60 / 60).toFixed(
      1
    )}hrs restantes.\r`
  );
});

function exitProgram() {
  fs.writeFileSync("translated.json", JSON.stringify(translated, null, 4));
  console.log("\nEscrevendo no disco.");
  process.exit();
}

process.on("SIGINT", function() {
  console.log("\nCaught interrupt signal");
  exitProgram();
});
