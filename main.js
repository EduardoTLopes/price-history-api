// @ts-check
const fs = require("fs");
var path = require("path");
const express = require("express");
const app = express();
const vision = require("@google-cloud/vision");
const handlebars = require("handlebars");
const utils = require("./utils");

const client = new vision.ImageAnnotatorClient({
  keyFilename: "./APIKey.json",
});

// Convert the textDetection method to be asynchronous
async function detectText() {
  // Use the await keyword to wait for the method to complete
  const results = await client.textDetection("./adidas-receipt.jpg");

  const sortedoutput = utils.sortByXY(results[0].textAnnotations);
  const outputSortedByY = utils.getDescriptionsByY(sortedoutput);

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

detectText();

// Wait for the file operations to complete before rendering the template
setTimeout(() => {
  const outputData = JSON.parse(fs.readFileSync("output.json", "utf-8"));
  app.get("/", (req, res) => res.send(outputData));

  app.listen(5000, "127.0.0.1", () =>
    console.log("Server running on port 5000")
  );
}, 1000);

