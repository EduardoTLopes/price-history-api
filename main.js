// @ts-check
require('dotenv').config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const utils = require("./utils");
const italianReceipt = "./receipts/italian_receipt.jpeg";
const brazilianReceipt = "./receipts/brazilian-adidas-receipt.jpg";
const bot = require("./src/telegram/index");

async function startServer() {
  
  if (true) {
    app.get("/", (req, res) => res.send("Hello world"));

    app.listen(5000, "127.0.0.1", () =>
      console.log("Server running on port 5000")
    );
  } else {
    console.error("Unable to start server: Error processing receipt");
  }
}

startServer();