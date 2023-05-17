// @ts-check
const { google, sheets_v4 } = require('googleapis');
const { GaxiosError } = require('googleapis-common');
const { auth } = require('./auth');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID ?? '';

function buildErrorMessage(message, error) {
  if (error instanceof GaxiosError) {
    if (error.response?.data.error) {
      return `${message}${JSON.stringify(error.response?.data.error, null, 2)}`
    } else if(error.response) {
      return `${message}statusCode: ${error.response.status} ${error.response.statusText}`
    }
  }

  return `${message}${error}`
}

/**
 *
 * @param {number} userId telegram user id
 * @returns {Promise<string|null>} `sheetName` if found, `null` if sheet is not found
 */
async function getUserSheet(userId) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client }); // if we don't want to copy-pasta
  // these calls all over, we need to implement a Singleton. Vai ser interessante passar as duas funcoes
  // pro gpt e pedir pra ele resolver isso pa nois.

  const sheetName = `${userId}`;
  const request = {
    spreadsheetId: SPREADSHEET_ID,
    ranges: [sheetName],
  };
  try {
    await sheets.spreadsheets.get(request);

    return sheetName
  } catch (error) {
    console.error(buildErrorMessage(`Failed to get user sheet: `, error))
    return null
  }
}

/**
 * @param {number} userId telegram user id
 * @returns {Promise<string>} `sheetName`
 */
async function createUserSheet(userId) {
  const sheetName = `${userId}`;
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client }); // if we don't want to copy-pasta
  // these calls all over, we need to implement a Singleton. Vai ser interessante passar as duas funcoes
  // pro gpt e pedir pra ele resolver isso pa nois.

  /**
   * @type {sheets_v4.Params$Resource$Spreadsheets$Batchupdate}
   */
  const request = {
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          addSheet: { properties: { title: sheetName } },
        },
      ],
    },
  };

  await sheets.spreadsheets.batchUpdate(request);
  console.log(`sheet "${sheetName}" created`)
  return sheetName
}

/**
 * @typedef {string} CurrentDate - values[0]
 * @typedef {string} OrderTotal - values[1]
 * @param {number} userId telegram user id
 * @param {[CurrentDate, OrderTotal]} values data to be appended
 * @returns {Promise<boolean>} whether the operation was successful
 */
async function addRow(userId, values) {
  const client = await auth.getClient();
  const sheets = google.sheets({version: 'v4', auth: client});
  const valueInputOption = 'USER_ENTERED'; // How the input data should be interpreted
  const insertDataOption = 'INSERT_ROWS'; // How the new row should be added

  const resource = {
    values: [values],
  };

  try {
    /** TODO: em vez de precisar dar um "getSheet" antes de fazer o append, acho que seria
    * melhor tentar fazer o append direto e dar um "catch" caso a sheet nao exista...
    * mas nao sei se a error message do google vem bonita, ou seja, nao sei se contém a mensagem
    * "operacao falhou pq o sheet nao existe".
    *
    * Follow-up: recebi a seguinte resposta:
    *
    ```
      code: 400,
      errors: [
        {
          message: 'Unable to parse range: 6116991352!A1',
          domain: 'global',
          reason: 'badRequest'
        }
      ]
    ```
    * entao acho que vai dar bom.
    */
    const userSheet = await getUserSheet(userId) ?? await createUserSheet(userId)
    const range = `${userSheet}!A1`; // Add data in the first column and the first available row


    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption,
      insertDataOption,
      resource,
    });

    return true
  } catch (error) {
    console.error(buildErrorMessage(`Failed to add row: `, error))
    return false
  }
}

module.exports = {addRow}
