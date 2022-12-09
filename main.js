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


utils.detectText();

// Wait for the file operations to complete before rendering the template
setTimeout(() => {
  const outputData = JSON.parse(fs.readFileSync("output.json", "utf-8"));
  app.get("/", (req, res) => res.send(outputData));

  app.listen(5000, "127.0.0.1", () =>
    console.log("Server running on port 5000")
  );
}, 1000);

