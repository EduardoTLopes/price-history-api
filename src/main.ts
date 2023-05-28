import "dotenv/config";
import express from "express";
import { startupBot } from "./telegram/index";
const app = express();

async function startup() {
  startupBot();

  app.get("/", (req, res) => res.send("Hello world"));

  app.listen(5000, "127.0.0.1", () => {
    console.log("Server running on port 5000");
  });
}

startup();
