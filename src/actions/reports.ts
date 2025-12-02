"use server";

import { getTransactions } from "./transactions";
import { getAccounts } from "./accounts";
import { getSettings } from "./settings";
import { startOfMonth, endOfMonth, format } from "date-fns";

export async function getMonthlyReport(month: number, year: number) {
    const transactions = await getTransactions();
    const accounts = await getAccounts();
    const settings = await getSettings();

    const userAName = settings.find((s) => s.key === "user_a_name")?.value || "User A";
    const userBName = settings.find((s) => s.key === "user_b_name")?.value || "User B";

    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const monthlyTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate >= startDate && tDate <= endDate;
    });

    // Separate by user
    const userATransactions = monthlyTransactions.filter((t) => t.user_id === "A");
    const userBTransactions = monthlyTransactions.filter((t) => t.user_id === "B");

    const calculateSummary = (txns: typeof transactions) => {
        const income = txns.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
        const expense = txns.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
        return { income, expense, savings: income - expense, transactions: txns };
    };

    return {
        month: format(startDate, "MMMM yyyy"),
        userA: {
            name: userAName,
            ...calculateSummary(userATransactions),
        },
        userB: {
            name: userBName,
            ...calculateSummary(userBTransactions),
        },
        combined: calculateSummary(monthlyTransactions),
    };
}
