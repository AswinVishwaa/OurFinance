"use server";

import { readSheet, appendRow, updateRow, SHEET_IDS } from "@/lib/sheets";
import { Transaction, TransactionType, UserID } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { getAccounts } from "./accounts";

export async function getTransactions() {
    const transactions = await readSheet<Transaction>(SHEET_IDS.TRANSACTIONS);

    // Sanitize data - fix legacy transactions with missing/invalid user_id
    const sanitized = transactions.map(t => ({
        ...t,
        user_id: (t.user_id === "A" || t.user_id === "B") ? t.user_id : "A" as UserID, // Default to A if invalid
        tax_amount: t.tax_amount || 0, // Default tax_amount to 0 if missing
    }));

    // Sort by date desc
    return sanitized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addTransaction(data: {
    type: TransactionType;
    amount: number;
    category: string;
    account_id: string;
    user_id: UserID;
    description: string;
    date?: string;
}) {
    const transaction: Transaction = {
        id: uuidv4(),
        date: data.date || new Date().toISOString(),
        type: data.type,
        amount: data.amount,
        category: data.category,
        account_id: data.account_id,
        user_id: data.user_id,
        description: data.description,
        tax_amount: 0,
    };

    // 1. Add Transaction Row - order: id, date, type, amount, category, account_id, to_account_id, user_id, description, tax_amount
    const row = [
        transaction.id,
        transaction.date,
        transaction.type,
        transaction.amount,
        transaction.category,
        transaction.account_id,
        transaction.to_account_id || "",
        transaction.user_id,
        transaction.description,
        transaction.tax_amount || "",
    ];
    await appendRow(SHEET_IDS.TRANSACTIONS, row);

    // 2. Update Account Balance
    const accounts = await getAccounts();
    const accountIndex = accounts.findIndex((a) => a.id === data.account_id);

    if (accountIndex !== -1) {
        const account = accounts[accountIndex];
        let newBalance = account.current_balance;

        if (data.type === "income") {
            newBalance += data.amount;
        } else {
            newBalance -= data.amount;
        }

        const sheetRow = accountIndex + 2;
        await updateRow(SHEET_IDS.ACCOUNTS, `D${sheetRow}`, [newBalance]);
    }

    revalidatePath("/");
    revalidatePath("/profile");
}

export async function transferFunds(data: {
    from_account_id: string;
    to_account_id: string;
    amount: number;
    user_id: UserID;
    description: string;
}) {
    const transaction: Transaction = {
        id: uuidv4(),
        date: new Date().toISOString(),
        type: "transfer",
        amount: data.amount,
        category: "Transfer",
        account_id: data.from_account_id,
        to_account_id: data.to_account_id,
        user_id: data.user_id,
        description: data.description,
        tax_amount: 0,
    };

    // 1. Add Transaction Row
    const row = [
        transaction.id,
        transaction.date,
        transaction.type,
        transaction.amount,
        transaction.category,
        transaction.account_id,
        transaction.to_account_id,
        transaction.user_id,
        transaction.description,
        transaction.tax_amount || "",
    ];
    await appendRow(SHEET_IDS.TRANSACTIONS, row);

    // 2. Update From Account (Subtract)
    const accounts = await getAccounts();
    const fromIndex = accounts.findIndex((a) => a.id === data.from_account_id);
    if (fromIndex !== -1) {
        const fromAccount = accounts[fromIndex];
        const newFromBalance = fromAccount.current_balance - data.amount;
        const fromRow = fromIndex + 2;
        await updateRow(SHEET_IDS.ACCOUNTS, `D${fromRow}`, [newFromBalance]);
    }

    // 3. Update To Account (Add)
    const toIndex = accounts.findIndex((a) => a.id === data.to_account_id);
    if (toIndex !== -1) {
        const toAccount = accounts[toIndex];
        const newToBalance = toAccount.current_balance + data.amount;
        const toRow = toIndex + 2;
        await updateRow(SHEET_IDS.ACCOUNTS, `D${toRow}`, [newToBalance]);
    }

    revalidatePath("/");
    revalidatePath("/profile");
}
