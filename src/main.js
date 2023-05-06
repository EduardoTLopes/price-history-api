// @ts-check
require('dotenv').config();
const express = require("express");
const app = express();
const { startupBot } = require("./telegram/index");

async function startup() {
  startupBot();

  app.get("/", (req, res) => {
    return res.send("Hello world")
  });

  app.listen(5000, "127.0.0.1", () =>
    console.log("Server running on port 5000")
  );
}

startup();
