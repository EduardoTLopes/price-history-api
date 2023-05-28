import path from "path";
import { google } from "googleapis";
import { authenticate } from "@google-cloud/local-auth";
import type { sheets_v4 } from "googleapis";
import { GaxiosError } from "googleapis-common";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID ?? "";

function buildErrorMessage(message: string, error: unknown) {
  if (error instanceof GaxiosError) {
    if (error.response?.data.error) {
      return `${message}${JSON.stringify(error.response?.data.error, null, 2)}`;
    } else if (error.response != null) {
      return `${message}statusCode: ${error.response.status} ${error.response.statusText}`;
    }
  }

  return `${message}${error}`;
}

/**
 *
 * @param {number} userId telegram user id
 * @returns {Promise<string|null>} `sheetName` if found, `null` if sheet is not found
 */
async function getUserSheet(userId: number): Promise<string | null> {
  const auth = await authenticate({
    keyfilePath: path.join(__dirname, "./secrets/GoogleApiKeySecrets.json"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  google.options({ auth });
  const sheets = google.sheets("v4"); // if we don't want to copy-pasta
  // these calls all over, we need to implement a Singleton. Vai ser interessante passar as duas funcoes
  // pro gpt e pedir pra ele resolver isso pa nois.

  const sheetName = `${userId}`;
  const request = {
    spreadsheetId: SPREADSHEET_ID,
    ranges: [sheetName],
  };
  try {
    await sheets.spreadsheets.get(request);

    return sheetName;
  } catch (error) {
    console.error(buildErrorMessage("Failed to get user sheet: ", error));
    return null;
  }
}

async function createUserSheet(userId: number): Promise<string> {
  const sheetName = `${userId}`;
  await googleAuthenticate();
  const sheets = google.sheets("v4"); // if we don't want to copy-pasta
  // these calls all over, we need to implement a Singleton. Vai ser interessante passar as duas funcoes
  // pro gpt e pedir pra ele resolver isso pa nois.

  /**
   * @type {sheets_v4.Params$Resource$Spreadsheets$Batchupdate}
   */
  const request: sheets_v4.Params$Resource$Spreadsheets$Batchupdate = {
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
  console.log(`sheet "${sheetName}" created`);
  return sheetName;
}

type CurrentDate = string;
type OrderTotal = string;
/**
 * @param userId telegram user id
 * @param values data to be appended
 * @returns whether the operation was successful
 */
export async function addRow(
  userId: number,
  values: [CurrentDate, OrderTotal]
): Promise<boolean> {
  await googleAuthenticate();
  const sheets = google.sheets("v4");
  const valueInputOption = "USER_ENTERED"; // How the input data should be interpreted
  const insertDataOption = "INSERT_ROWS"; // How the new row should be added

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
    const userSheet =
      (await getUserSheet(userId)) ?? (await createUserSheet(userId));
    const range = `${userSheet}!A1`; // Add data in the first column and the first available row
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption,
      insertDataOption,
      requestBody: resource,
    });

    return true;
  } catch (error) {
    console.error(buildErrorMessage("Failed to add row: ", error));
    return false;
  }
}
async function googleAuthenticate() {
  const auth = await authenticate({
    keyfilePath: path.join(__dirname, "./secrets/GoogleApiKeySecrets.json"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  google.options({ auth });
}
