const fs = require("fs");
var path = require("path");

const vision = require("@google-cloud/vision");

const client = new vision.ImageAnnotatorClient({
  keyFilename: "./APIKey.json",
});

function sortByXY(array) {
  array.sort((a, b) => {
    const verticesA = a["boundingPoly"]["vertices"][0];
    const verticesB = b["boundingPoly"]["vertices"][0];
    const x1 = verticesA["x"];
    const y1 = verticesA["y"];
    const x2 = verticesB["x"];
    const y2 = verticesB["y"];

    if (x1 === x2) {
      return y1 - y2;
    } else {
      return x1 - x2;
    }
  });

  return array;
}

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

  fs.writeFile(
    path.join(__dirname, "output.json"),
    JSON.stringify(outputSortedByY, null, 2),
    (err) => {
      if (err) {
        console.error("file error:", err);
      }
      console.log("parsed content written to output.json");
    }
  );
}

module.exports = {
  sortByXY,
  getDescriptionsByY,
  detectText,
};
