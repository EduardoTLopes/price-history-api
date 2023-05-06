const { google } = require('googleapis');

const keyPath = './secrets/GoogleApiKeySecrets.json';
const credentials = require(keyPath);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

module.exports = {auth}
