"use server";

import { readSheet, appendRow, updateRow, findRowIndex, SHEET_IDS } from "@/lib/sheets";
import { Asset, UserID } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { getAccounts } from "./accounts";

export async function getAssets() {
    const assets = await readSheet<Asset>(SHEET_IDS.ASSETS);
    return assets;
}

// Find existing asset card for user + metal type combination
async function findExistingAsset(
    user_id: UserID,
    metal_type: "Gold" | "Silver"
): Promise<{ asset: Asset; rowIndex: number } | null> {
    const assets = await getAssets();
    const existing = assets.find(
        (a) => a.user_id === user_id && a.metal_type === metal_type
    );

    if (!existing) return null;

    // Find the row index in the sheet
    const rowIndex = await findRowIndex(SHEET_IDS.ASSETS, (row) => {
        return row.user_id === user_id && row.metal_type === metal_type;
    });

    if (!rowIndex) return null;

    return { asset: existing, rowIndex };
}

export async function addAsset(data: {
    metal_type: "Gold" | "Silver";
    total_cash_paid: number;
    grams: number;
    user_id: UserID;
    paid_from_account_id?: string;
}) {
    // Tax Logic: 3% Tax
    const tax_deducted = data.total_cash_paid * 0.03;
    const invested_value = data.total_cash_paid - tax_deducted;

    // Check if user already has a card for this metal type
    const existing = await findExistingAsset(data.user_id, data.metal_type);

    if (existing) {
        // UPDATE existing card - add to existing values
        const updatedAsset: Asset = {
            ...existing.asset,
            date: new Date().toISOString(), // Update last modified date
            grams: existing.asset.grams + data.grams,
            total_cash_paid: existing.asset.total_cash_paid + data.total_cash_paid,
            tax_deducted: existing.asset.tax_deducted + tax_deducted,
            invested_value: existing.asset.invested_value + invested_value,
        };

        const row = [
            updatedAsset.id,
            updatedAsset.date,
            updatedAsset.metal_type,
            updatedAsset.grams,
            updatedAsset.total_cash_paid,
            updatedAsset.tax_deducted,
            updatedAsset.invested_value,
            updatedAsset.user_id,
        ];

        await updateRow(SHEET_IDS.ASSETS, `A${existing.rowIndex}:H${existing.rowIndex}`, row);
    } else {
        // CREATE new card
        const asset: Asset = {
            id: uuidv4(),
            date: new Date().toISOString(),
            metal_type: data.metal_type,
            grams: data.grams,
            total_cash_paid: data.total_cash_paid,
            tax_deducted,
            invested_value,
            user_id: data.user_id,
        };

        const row = [
            asset.id,
            asset.date,
            asset.metal_type,
            asset.grams,
            asset.total_cash_paid,
            asset.tax_deducted,
            asset.invested_value,
            asset.user_id,
        ];

        await appendRow(SHEET_IDS.ASSETS, row);
    }

    // Deduct the cash paid from the specified account (if provided) or the user's first available account
    try {
        const accounts = await getAccounts();
        let acctIndex = -1;
        if (data.paid_from_account_id) {
            acctIndex = accounts.findIndex(a => a.id === data.paid_from_account_id);
        }
        if (acctIndex === -1) {
            acctIndex = accounts.findIndex(a => a.is_active && (a.user_id === data.user_id || a.user_id === "Shared"));
        }
        if (acctIndex !== -1) {
            const acct = accounts[acctIndex];
            const newBalance = acct.current_balance - data.total_cash_paid;
            const sheetRow = acctIndex + 2;
            await updateRow(SHEET_IDS.ACCOUNTS, `D${sheetRow}`, [newBalance]);
            revalidatePath("/profile");
            revalidatePath("/");
        }
    } catch (err) {
        console.error('[addAsset] Failed to deduct from account', err);
    }

    revalidatePath("/");
    revalidatePath("/assets");
}

export async function addExistingAsset(data: {
    metal_type: "Gold" | "Silver";
    invested_value: number;
    grams: number;
    user_id: UserID;
    paid_from_account_id?: string;
}) {
    // Check if user already has a card for this metal type
    const existing = await findExistingAsset(data.user_id, data.metal_type);

    if (existing) {
        // UPDATE existing card - add to existing values (NO TAX for existing assets)
        const updatedAsset: Asset = {
            ...existing.asset,
            date: new Date().toISOString(), // Update last modified date
            grams: existing.asset.grams + data.grams,
            total_cash_paid: existing.asset.total_cash_paid + data.invested_value,
            // tax_deducted stays the same - no new tax for existing assets
            invested_value: existing.asset.invested_value + data.invested_value,
        };

        const row = [
            updatedAsset.id,
            updatedAsset.date,
            updatedAsset.metal_type,
            updatedAsset.grams,
            updatedAsset.total_cash_paid,
            updatedAsset.tax_deducted,
            updatedAsset.invested_value,
            updatedAsset.user_id,
        ];

        await updateRow(SHEET_IDS.ASSETS, `A${existing.rowIndex}:H${existing.rowIndex}`, row);
    } else {
        // CREATE new card (no tax for existing assets)
        const asset: Asset = {
            id: uuidv4(),
            date: new Date().toISOString(),
            metal_type: data.metal_type,
            grams: data.grams,
            total_cash_paid: data.invested_value,
            tax_deducted: 0, // No tax for existing assets
            invested_value: data.invested_value,
            user_id: data.user_id,
        };

        const row = [
            asset.id,
            asset.date,
            asset.metal_type,
            asset.grams,
            asset.total_cash_paid,
            asset.tax_deducted,
            asset.invested_value,
            asset.user_id,
        ];

        await appendRow(SHEET_IDS.ASSETS, row);
    }

    // Deduct the invested value from the specified account (if provided) or the user's first available account
    try {
        const accounts = await getAccounts();
        let acctIndex = -1;
        if (data.paid_from_account_id) {
            acctIndex = accounts.findIndex(a => a.id === data.paid_from_account_id);
        }
        if (acctIndex === -1) {
            acctIndex = accounts.findIndex(a => a.is_active && (a.user_id === data.user_id || a.user_id === "Shared"));
        }
        if (acctIndex !== -1) {
            const acct = accounts[acctIndex];
            const newBalance = acct.current_balance - data.invested_value;
            const sheetRow = acctIndex + 2;
            await updateRow(SHEET_IDS.ACCOUNTS, `D${sheetRow}`, [newBalance]);
            revalidatePath("/profile");
            revalidatePath("/");
        }
    } catch (err) {
        console.error('[addExistingAsset] Failed to deduct from account', err);
    }

    revalidatePath("/");
    revalidatePath("/assets");
}
