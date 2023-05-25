import { google } from 'googleapis';

const keyPath = './secrets/GoogleApiKeySecrets.json';
const credentials = require(keyPath);

export const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});


