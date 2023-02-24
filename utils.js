//@ts-check
const fs = require("fs");
var path = require("path");

const vision = require("@google-cloud/vision");

const client = new vision.ImageAnnotatorClient({
  keyFilename: "./APIKey.json",
});


/**
 * @typedef { Awaited<ReturnType<typeof client.textDetection>>[number]["textAnnotations"] } TextAnnotations
 */


/**
 * @param {TextAnnotations} array
 */
function sortByXY(array) {
  if (array) {
    array.sort((a, b) => {
      const x = a["boundingPoly"]

      const verticesA = a["boundingPoly"]?.vertices?.[0];
      const verticesB = b["boundingPoly"]?.vertices?.[0];
      const x1 = verticesA?.x ?? 0;
      const y1 = verticesA?.y ?? 0;
      const x2 = verticesB?.x ?? 0;
      const y2 = verticesB?.y ?? 0;

      if (x1 === x2) {
        return y1 - y2;
      } else {
        return x1 - x2;
      }
    });

    return array;
  } else {
    return []
  }

}

/**
 * @param {Array<Record<string, any>>} array
 */
function getDescriptionsByY(array) {
  const descriptionsByY = new Map();

  for (const obj of array) {
    const vertices = obj["boundingPoly"]["vertices"][0];
    const y = vertices["y"];
    const description = obj["description"];

    if (descriptionsByY.has(y)) {
      descriptionsByY.get(y).push(description);
    } else {
      descriptionsByY.set(y, [description]);
    }
  }

  return Object.fromEntries(descriptionsByY);
}


// Convert the textDetection method to be asynchronous
async function detectText() {
  // Use the await keyword to wait for the method to complete
  const results = await client.textDetection("./adidas-receipt.jpg");
  const sortedoutput = sortByXY(results[0].textAnnotations);
  const outputSortedByY = getDescriptionsByY(sortedoutput);
  const firstKey = Object.keys(outputSortedByY)[0];
  delete outputSortedByY[firstKey];
  const groupByKeys = groupDataByKeys(outputSortedByY, 20);

  return joinValues(groupByKeys);
}

/**
 * @param {unknown} content - content that should be written in file
 */
function writeToFile(content) {
  fs.writeFile(
    path.join(__dirname, "output.json"),
    JSON.stringify(content, null, 2),
    (err) => {
      if (err) {
        console.error("file error:", err);
      }
      console.log("parsed content written to output.json");
    }
  );
}

function joinValues(obj) {
  const result = {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (Array.isArray(value)) {
      result[key] = value.join(" ");
    } else {
      result[key] = value;
    }
  }

  return result;
}

function groupDataByKeys(input, range) {
  // Convert the input object to an array of keys and values
  const keys = Object.keys(input);
  const values = Object.values(input);

  // Initialize the result object
  const result = {};

  // Loop through the keys and values
  for (let i = 0; i < keys.length; i++) {
    // Convert the key to a number
    const key = Number(keys[i]);
    const value = values[i];

    // If the key is within the range of the next key, concatenate the value
    // of the next key to the current value and continue looping.
    if (i < keys.length - 1 && key + range >= Number(keys[i + 1])) {
      values[i + 1] = value.concat(values[i + 1]);
      continue;
    }

    // If the key is not within the range of the next key, add it to the result
    result[key] = value;
  }

  return result;
}

module.exports = {
  detectText,
  writeToFile
};
