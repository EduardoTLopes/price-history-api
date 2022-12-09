// @ts-check
const fs = require('fs');
var path = require('path');
const express = require('express');
const app = express();
const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient({
    keyFilename: "./APIKey.json"
});

// Performs label detection on the image file

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


client
    .textDetection('./example-receipt.jpeg')
    .then(results => {
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

    })
    .catch(err => {
        console.error('ERROR:', err);
    }
    );

app.listen(5000, '127.0.0.1', () => console.log('Server running on port 5000'));
