"use server";

import { readSheet, appendRow, SHEET_IDS } from "@/lib/sheets";
import { Asset, UserID } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export async function getAssets() {
    const assets = await readSheet<Asset>(SHEET_IDS.ASSETS);
    return assets;
}

export async function addAsset(data: {
    metal_type: "Gold" | "Silver";
    total_cash_paid: number;
    grams: number;
    user_id: UserID;
}) {
    // Tax Logic: 3% Tax
    const tax_deducted = data.total_cash_paid * 0.03;
    const invested_value = data.total_cash_paid - tax_deducted;

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

    // Order: id, date, metal_type, grams, total_cash_paid, tax_deducted, invested_value, user_id
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
    revalidatePath("/");
    revalidatePath("/assets");
}

export async function addExistingAsset(data: {
    metal_type: "Gold" | "Silver";
    invested_value: number;
    grams: number;
    user_id: UserID;
}) {
    // For existing assets - no tax calculation, use invested value directly
    const asset: Asset = {
        id: uuidv4(),
        date: new Date().toISOString(),
        metal_type: data.metal_type,
        grams: data.grams,
        total_cash_paid: data.invested_value, // Store invested value as total_cash_paid
        tax_deducted: 0, // No tax for existing assets
        invested_value: data.invested_value,
        user_id: data.user_id,
    };

    // Order: id, date, metal_type, grams, total_cash_paid, tax_deducted, invested_value, user_id
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
    revalidatePath("/");
    revalidatePath("/assets");
}
