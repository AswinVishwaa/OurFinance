"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { getMonthlyReport } from "@/actions/reports";

export function ExportReportButton() {
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    async function handleExport() {
        setLoading(true);
        try {
            const data = await getMonthlyReport(month, year);

            // Create workbook
            const wb = XLSX.utils.book_new();

            // User A Sheet
            const userAData = [
                ["Transaction Report - " + data.userA.name],
                ["Period: " + data.month],
                [],
                ["Summary"],
                ["Income", data.userA.income],
                ["Expenses", data.userA.expense],
                ["Savings", data.userA.savings],
                [],
                ["Transactions"],
                ["Date", "Type", "Category", "Amount", "Description"],
                ...data.userA.transactions.map((t) => [
                    new Date(t.date).toLocaleDateString(),
                    t.type,
                    t.category,
                    t.amount,
                    t.description,
                ]),
            ];
            const wsA = XLSX.utils.aoa_to_sheet(userAData);
            XLSX.utils.book_append_sheet(wb, wsA, data.userA.name);

            // User B Sheet
            const userBData = [
                ["Transaction Report - " + data.userB.name],
                ["Period: " + data.month],
                [],
                ["Summary"],
                ["Income", data.userB.income],
                ["Expenses", data.userB.expense],
                ["Savings", data.userB.savings],
                [],
                ["Transactions"],
                ["Date", "Type", "Category", "Amount", "Description"],
                ...data.userB.transactions.map((t) => [
                    new Date(t.date).toLocaleDateString(),
                    t.type,
                    t.category,
                    t.amount,
                    t.description,
                ]),
            ];
            const wsB = XLSX.utils.aoa_to_sheet(userBData);
            XLSX.utils.book_append_sheet(wb, wsB, data.userB.name);

            // Combined Sheet
            const combinedData = [
                ["Transaction Report - Combined"],
                ["Period: " + data.month],
                [],
                ["Summary"],
                ["Income", data.combined.income],
                ["Expenses", data.combined.expense],
                ["Savings", data.combined.savings],
                [],
                ["Transactions"],
                ["Date", "Type", "Category", "Amount", "User", "Description"],
                ...data.combined.transactions.map((t) => [
                    new Date(t.date).toLocaleDateString(),
                    t.type,
                    t.category,
                    t.amount,
                    t.user_id === "A" ? data.userA.name : data.userB.name,
                    t.description,
                ]),
            ];
            const wsCombined = XLSX.utils.aoa_to_sheet(combinedData);
            XLSX.utils.book_append_sheet(wb, wsCombined, "Combined");

            // Download
            const fileName = `Finance_Report_${data.month.replace(" ", "_")}.xlsx`;
            XLSX.writeFile(wb, fileName);
        } finally {
            setLoading(false);
        }
    }

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-800/30 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-indigo-300">
                <Download className="w-5 h-5" />
                <h3 className="font-semibold">Export Monthly Report</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-zinc-400 mb-1">Month</label>
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="w-full bg-zinc-800/50 border border-zinc-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {months.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-zinc-400 mb-1">Year</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full bg-zinc-800/50 border border-zinc-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={handleExport}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Download className="w-4 h-4" />
                        Download Excel Report
                    </>
                )}
            </button>
        </div>
    );
}
