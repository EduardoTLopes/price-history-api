// @ts-check
require('dotenv').config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const utils = require("./utils");
const italianReceipt = "./receipts/italian_receipt.jpeg";
const brazilianReceipt = "./receipts/brazilian-adidas-receipt.jpg";

async function processReceipt() {
  try {
    const extractedText = await utils.detectText(brazilianReceipt);
    console.log({ extractedText });
    await utils.writeToFile(extractedText);
    return extractedText;
  } catch (error) {
    console.error("Error processing receipt:", error);
    return null;
  }
}

async function startServer() {
  const outputData = await processReceipt();
  if (outputData) {
    app.get("/", (req, res) => res.send(outputData));

    app.listen(5000, "127.0.0.1", () =>
      console.log("Server running on port 5000")
    );
  } else {
    console.error("Unable to start server: Error processing receipt");
  }
}

startServer();