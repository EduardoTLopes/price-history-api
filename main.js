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

function sortByXY(arr) {
  arr.sort((a, b) => {
    const x1 = a["boundingPoly"]["vertices"][0]["x"];
    const y1 = a["boundingPoly"]["vertices"][0]["y"];
    const x2 = b["boundingPoly"]["vertices"][0]["x"];
    const y2 = b["boundingPoly"]["vertices"][0]["y"];
    if (x1 === x2) {
      return y1 - y2;
    } else {
      return x1 - x2;
    }
  });
  return arr;
}

function getDescriptionsByY(arr) {
  const descriptionsByY = new Map();

  for (const obj of arr) {
    const y = obj["boundingPoly"]["vertices"][0]["y"];

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
