const { google } = require('googleapis');
const { authorize } = require('./auth');

async function addRow() {
  const auth = await authorize()
  const sheets = google.sheets({version: 'v4', auth});
  const spreadsheetId = '1Zl_9Lh71yGLmFAua53gYXcAFjf7gMTkH6i84XMjW-wU';
  const range = 'Sheet1!A1:D1'; // The range where you want to add the row
  const valueInputOption = 'USER_ENTERED'; // How the input data should be interpreted
  const insertDataOption = 'INSERT_ROWS'; // How the new row should be added

  const resource = {
    values: [
      ['New Value 1', 'New Value 2', 'New Value 3', 'New Value 4'], // The values to add in the row
    ],
  };

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption,
      insertDataOption,
      resource,
    });
    console.log(`${response.data.updates.updatedCells} cells appended.`);
  } catch (error) {
    console.error(error);
  }
}

module.exports = {addRow}
