// @ts-check
require('dotenv').config()
const fs = require("fs");
var path = require("path");
const express = require("express");
const app = express();
const utils = require("./utils");
const italianReceipt = "./receipts/italian_receipt.jpeg";


utils.detectText(italianReceipt).then((x) => {
  console.log({x})
  utils.writeToFile(x)
});


// Wait for the file operations to complete before rendering the template
setTimeout(() => {
  const outputData = JSON.parse(fs.readFileSync("output.json", "utf-8"));
  app.get("/", (req, res) => res.send(outputData));

  app.listen(5000, "127.0.0.1", () =>
    console.log("Server running on port 5000")
  );
}, 500);

