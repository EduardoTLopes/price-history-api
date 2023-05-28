import { google } from "googleapis";
import * as fs from "fs";

export const keyFilePath = "./secrets/GoogleApiKeySecrets.json";
const credentials = JSON.parse(fs.readFileSync(keyFilePath, "utf8"));

export const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
