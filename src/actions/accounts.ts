"use server";

import { readSheet, appendRow, updateRow, SHEET_IDS } from "@/lib/sheets";
import { Account, UserID } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export async function getAccounts() {
    const accounts = await readSheet<Account>(SHEET_IDS.ACCOUNTS);
    return accounts;
}

export async function createAccount(name: string, accountType: string, userId: UserID | "Shared", initialBalance: number) {
    const newAccount: Account = {
        id: uuidv4(),
        name,
        type: accountType,
        current_balance: initialBalance,
        user_id: userId,
        is_active: true,
    };

    // Order must match sheet columns: id, name, type, current_balance, user_id, is_active
    const row = [
        newAccount.id,
        newAccount.name,
        newAccount.type,
        newAccount.current_balance,
        newAccount.user_id,
        newAccount.is_active ? "TRUE" : "FALSE",
    ];

    await appendRow(SHEET_IDS.ACCOUNTS, row);
    revalidatePath("/profile");
    revalidatePath("/");
}

export async function toggleAccountStatus(accountId: string, isActive: boolean) {
    console.log('[toggleAccountStatus] Called with:', { accountId, isActive });
    const accounts = await getAccounts();
    console.log('[toggleAccountStatus] Found accounts:', accounts.length);
    const rowIndex = accounts.findIndex((a) => a.id === accountId);

    if (rowIndex === -1) {
        console.error('[toggleAccountStatus] Account not found:', accountId);
        throw new Error("Account not found");
    }

    const sheetRow = rowIndex + 2;
    const newValue = isActive ? "TRUE" : "FALSE";
    console.log('[toggleAccountStatus] Updating row:', { sheetRow, column: 'F', newValue });

    // is_active is the 6th column (F) in the actual sheet: id, name, type, current_balance, user_id, is_active
    await updateRow(SHEET_IDS.ACCOUNTS, `F${sheetRow}`, [newValue]);
    console.log('[toggleAccountStatus] Update complete');

    revalidatePath("/profile");
    revalidatePath("/");
}

export async function correctBalance(accountId: string, newBalance: number) {
    console.log('[correctBalance] Called with:', { accountId, newBalance });

    // 1. Get current balance
    const accounts = await getAccounts();
    const account = accounts.find((a) => a.id === accountId);
    if (!account) {
        console.error('[correctBalance] Account not found:', accountId);
        throw new Error("Account not found");
    }

    console.log('[correctBalance] Current account:', {
        id: account.id,
        name: account.name,
        currentBalance: account.current_balance
    });

    const difference = newBalance - account.current_balance;
    console.log('[correctBalance] Difference:', difference);

    if (difference === 0) {
        console.log('[correctBalance] No change needed');
        return;
    }

    // 2. Create Transaction
    const transactionId = uuidv4();

    // Determine user_id - if account is Shared, default to A
    let transactionUserId: UserID;
    if (account.user_id === "Shared") {
        transactionUserId = "A";
    } else {
        transactionUserId = account.user_id;
    }

    const transaction = {
        id: transactionId,
        date: new Date().toISOString(),
        type: difference > 0 ? "income" as const : "expense" as const,
        amount: Math.abs(difference),
        category: "Adjustment",
        account_id: accountId,
        to_account_id: "",
        user_id: transactionUserId,
        description: "Balance Correction",
    };

    console.log('[correctBalance] Creating transaction:', transaction);

    // Order: id, date, type, amount, category, account_id, to_account_id, user_id, description, tax_amount
    const transactionRow = [
        transaction.id,
        transaction.date,
        transaction.type,
        transaction.amount,
        transaction.category,
        transaction.account_id,
        transaction.to_account_id,
        transaction.user_id,
        transaction.description,
        "" // tax_amount - empty for adjustments
    ];

    await appendRow(SHEET_IDS.TRANSACTIONS, transactionRow);
    console.log('[correctBalance] Transaction created');

    // 3. Update Account Balance
    const rowIndex = accounts.findIndex((a) => a.id === accountId);
    const sheetRow = rowIndex + 2;
    console.log('[correctBalance] Updating account balance:', { sheetRow, column: 'D', newBalance });

    // current_balance is 4th column (D) in the actual sheet: id, name, type, current_balance, user_id, is_active
    await updateRow(SHEET_IDS.ACCOUNTS, `D${sheetRow}`, [newBalance]);
    console.log('[correctBalance] Balance updated successfully');

    revalidatePath("/profile");
    revalidatePath("/");
}
