//@ts-check
const fs = require("fs");
var path = require("path");
const axios = require('axios');

const brazilianReceipt = "./receipts/brazilian-adidas-receipt.jpg";

const vision = require("@google-cloud/vision");
const { getData } = require("./openai");

// TODO: mover pra pasta Google
const client = new vision.ImageAnnotatorClient({
  keyFilename: "./src/google/secrets/GoogleApiKeySecrets.json",
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
/**
 * @param {string} filePath
 */

async function detectText(filePath) {
  try {
    const results = await client.textDetection(filePath);
    const sortedOutput = sortByXY(results[0].textAnnotations);
    const outputSortedByY = getDescriptionsByY(sortedOutput);
    const firstKey = Object.keys(outputSortedByY)[0];
    delete outputSortedByY[firstKey];
    const groupByKeys = groupDataByKeys(outputSortedByY, 20);
    const joinedValues = joinValues(groupByKeys);
    return getTotal(joinedValues);
  } catch (error) {
    console.error("Error in detectText:", error);
    return null;
  }
}

/**
 * @param {unknown} content - content that should be written in file
 */
function writeToFile(content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      path.join(__dirname, "output.json"),
      JSON.stringify(content, null, 2),
      (err) => {
        if (err) {
          console.error("file error:", err);
          reject(err);
        } else {
          console.log("parsed content written to output.json");
          resolve(true);
        }
      }
    );
  });
}

/**
 * @param {Record<string, string>} obj
 * @return {Record<string, string> | {}}
 */
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

/**
 * @param {Record<string, string>} parsedReceipt
 */
async function getTotal(parsedReceipt) {
  try {
    const AIData = await getData(parsedReceipt);
    const textResponse = AIData.data.choices[0].text;
    return textResponse?.replace(/\n/g, '');
  } catch (error) {
    console.error("Error in getTotal:", error);
    return null;
  }
}

async function processReceipt(img) {
  try {
    const extractedText = await detectText(img || brazilianReceipt);
    await writeToFile(extractedText);
    return extractedText;
  } catch (error) {
    console.error("Error processing receipt:", error);
    return null;
  }
}

async function downloadImage(url, localPath) {
  try {
  const path2 = path.resolve(localPath)
  const writer = fs.createWriteStream(path2)

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(writer)

  console.log(`Image saved to ${localPath}`);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

module.exports = {
  detectText,
  writeToFile,
  getTotal,
  processReceipt,
  downloadImage
};
