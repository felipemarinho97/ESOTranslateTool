const translate = require("@vitalets/google-translate-api");
// const translate = require("@k3rn31p4nic/google-translate-api");
const { of } = require("rxjs");
const { mergeMap, finalize } = require("rxjs/operators");

function extractTokens(originalText) {
  const tokens = originalText.match(/<<[^>>]*>>/g) || [];

  let text = originalText;
  let dict = {};

  if (tokens)
    tokens.forEach((token, i) => {
      text = text.replace(token, `<<${i}>>`);
      dict[`<<${i}>>`] = token;
    });

  return { text, dict };
}

function normalizeTokens(text, dict) {
  let normalizedText = text;

  for (let key of Object.keys(dict)) {
    normalizedText = normalizedText.replace(key, dict[key]);
  }
  return normalizedText;
}

function translateString({ i, string }) {
  const { text: detokenizedString0, dict } = extractTokens(string);
  let detokenizedString = detokenizedString0;

  return new Promise(resolve => {
    if (detokenizedString.includes("|")) {
      resolve({ i, string: detokenizedString });
    }
    let factors =[];
    if (detokenizedString.includes("^")) {
      factors = detokenizedString.split('^');
      detokenizedString = factors[0];
    }
    translate(
      detokenizedString,
      { from: "en", to: "pt", raw: true }
      // { proxy: { host: "119.82.249.4", port: 58774 } }
    )
      .then(res => {
        if (detokenizedString0.includes("^")) {
          resolve({ i, string: normalizeTokens(res.text, dict) + '^' + factors[1] });
          
        } else {
          resolve({ i, string: normalizeTokens(res.text, dict) });
        }
      })
      .catch(err => {
        console.error(err);
        resolve({ i, string, Success: false, code: err.statusCode });
      });
  });
}

function translateStrings(arrayOfStrings) {
  return new Promise((resolve, reject) => {
    const observableArrayOfStrings = of(...arrayOfStrings);

    const translatedArrayOfStrings = [];

    const resultStream = observableArrayOfStrings.pipe(
      mergeMap(translateString, 1),
      finalize(() => {
        resolve(
          translatedArrayOfStrings
            .sort((a, b) => a.i - b.i)
            .map(obj => obj.string)
        );
      })
    );

    resultStream.subscribe(translatedString => {
      if (translatedString.Success == false) reject(translatedString.code);
      translatedArrayOfStrings.push(translatedString);
    });
  });
}

module.exports = {
  translateStrings
};
