"use server";

import { readSheet, updateRow, SHEET_IDS } from "@/lib/sheets";
import { Setting } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getSettings() {
    const settings = await readSheet<Setting>(SHEET_IDS.SETTINGS);
    return settings;
}

export async function updateUserName(key: "user_a_name" | "user_b_name", newName: string) {
    const settings = await getSettings();
    const rowIndex = settings.findIndex((s) => s.key === key);

    if (rowIndex === -1) {
        throw new Error("Setting not found");
    }

    // Row index in sheet is 1-based, and header is row 1. So data starts at row 2.
    // Our array is 0-indexed.
    // So array index 0 -> Sheet Row 2.
    // Sheet Row = arrayIndex + 2.
    const sheetRow = rowIndex + 2;

    await updateRow(SHEET_IDS.SETTINGS, `B${sheetRow}`, [newName]);
    revalidatePath("/");
    revalidatePath("/profile");
}
