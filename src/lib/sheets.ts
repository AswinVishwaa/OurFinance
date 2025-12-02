import { google } from "googleapis";
import { Transaction, Account, Asset, Setting } from "./types";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export const SHEET_IDS = {
    TRANSACTIONS: "Transactions",
    ACCOUNTS: "Accounts",
    ASSETS: "Assets",
    SETTINGS: "Settings",
};

function getAuth() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!email || !privateKey) {
        throw new Error("Missing Google Sheets credentials");
    }

    return new google.auth.JWT({
        email,
        key: privateKey,
        scopes: SCOPES,
    });
}

export async function getSheetsClient() {
    const auth = getAuth();
    return google.sheets({ version: "v4", auth });
}

export async function readSheet<T>(tabName: string): Promise<T[]> {
    console.log('[readSheet] Reading from tab:', tabName);
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: tabName,
    });

    const rows = response.data.values;
    console.log('[readSheet] Raw rows from Google Sheets:', rows?.length || 0, 'rows');

    if (!rows || rows.length === 0) {
        console.log('[readSheet] No data found');
        return [];
    }

    const headers = rows[0];
    console.log('[readSheet] Headers:', headers);

    const data = rows.slice(1).map((row, index) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obj: any = {};
        headers.forEach((header, colIndex) => {
            let value = row[colIndex];

            // Handle undefined/null values
            if (value === undefined || value === null) {
                obj[header] = value;
                return;
            }

            // Basic type conversion - order matters!
            // 1. Check for boolean strings first
            if (value === "TRUE") {
                obj[header] = true;
                return;
            }
            if (value === "FALSE") {
                obj[header] = false;
                return;
            }

            // 2. Check for empty string (don't convert to number)
            if (value === "") {
                obj[header] = "";
                return;
            }

            // 3. Try to convert to number if it's a valid number string
            const numValue = Number(value);
            if (!isNaN(numValue)) {
                obj[header] = numValue;
                return;
            }

            // 4. Keep as string
            obj[header] = value;
        });

        if (index < 3) {
            console.log(`[readSheet] Sample row ${index + 1}:`, obj);
        }

        return obj as T;
    });

    console.log('[readSheet] Parsed', data.length, 'records');
    return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function appendRow(tabName: string, rowData: any[]) {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: tabName,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [rowData],
        },
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateRow(tabName: string, range: string, rowData: any[]) {
    console.log('[updateRow] Called with:', { tabName, range, rowData });
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    console.log('[updateRow] Sending to Google Sheets:', {
        spreadsheetId,
        fullRange: `${tabName}!${range}`,
        values: [rowData]
    });

    const result = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${tabName}!${range}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [rowData],
        },
    });

    console.log('[updateRow] Google Sheets response:', {
        updatedCells: result.data.updatedCells,
        updatedRows: result.data.updatedRows,
        updatedColumns: result.data.updatedColumns
    });
}
