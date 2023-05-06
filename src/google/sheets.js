// @ts-check
const { google } = require('googleapis');
const { auth } = require('./auth');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID ?? '';

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
    // TODO: isso aqui nao da throw mesmo se a sheetName nao existir. Vamos precisar fazer o filter na mao....
    // ou olhar direto na doc do Google.
    const spreadsheetResponse = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const x = spreadsheetResponse.data.sheets

    console.log(`found sheets: ${JSON.stringify(x,null,2)}`)
    return x
  } catch (error) {
    console.error(error)
    return null
  }
}


async function createUserSheet(userId) {
  const sheetName = `${userId}`;
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client }); // if we don't want to copy-pasta
  // these calls all over, we need to implement a Singleton. Vai ser interessante passar as duas funcoes
  // pro gpt e pedir pra ele resolver isso pa nois.

  const request = {
    SPREADSHEET_ID,
    resource: {
      requests: [
        {
          addSheet: { properties: { title: sheetName } },
        },
      ],
    },
  };

  const response = await sheets.spreadsheets.batchUpdate(request);
  console.log(`sheet "${sheetName}" created`)
  return response
}

/**
 *
 * @param {number} userId telegram user id
 * @param {[string]} values data to be appended
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
    /** Pendente investigacao: em vez de precisar dar um "getSheet" antes de fazer o append, acho que seria
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
    // const range = `${userId}!A1:D1`; // <<<<< Mesmo que seja um unico valor,
    // talvez precisemos passar um range assim (isso funcionou quando eu tava testando coisa hard-coded)
    const range = `${userId}!A1`; // The range where you want to add the row

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
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
