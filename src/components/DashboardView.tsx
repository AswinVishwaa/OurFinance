"use client";

import { Account, Asset, Transaction } from "@/lib/types";
import { useUser } from "@/context/UserContext";
import { DashboardCards } from "./DashboardCards";
import { TransactionForm } from "./TransactionForm";
import { format, startOfDay, startOfWeek, startOfMonth, startOfQuarter, startOfYear } from "date-fns";
import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

interface DashboardViewProps {
    accounts: Account[];
    assets: Asset[];
    transactions: Transaction[];
    userAName: string;
    userBName: string;
}

type TimePeriod = "today" | "week" | "month" | "quarter" | "year" | "all";

const TIME_PERIODS: { id: TimePeriod; label: string; short: string }[] = [
    { id: "today", label: "Today", short: "1D" },
    { id: "week", label: "This Week", short: "1W" },
    { id: "month", label: "This Month", short: "1M" },
    { id: "quarter", label: "This Quarter", short: "3M" },
    { id: "year", label: "This Year", short: "1Y" },
    { id: "all", label: "All Time", short: "All" },
];

export function DashboardView({ accounts, assets, transactions, userAName, userBName }: DashboardViewProps) {
    const { viewMode } = useUser();
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
    const [showPeriodMenu, setShowPeriodMenu] = useState(false);

    const getStartDate = () => {
        const now = new Date();
        switch (timePeriod) {
            case "today":
                return startOfDay(now);
            case "week":
                return startOfWeek(now, { weekStartsOn: 1 });
            case "month":
                return startOfMonth(now);
            case "quarter":
                return startOfQuarter(now);
            case "year":
                return startOfYear(now);
            case "all":
                return new Date(0);
        }
    };

    const startDate = getStartDate();

    const filteredTransactions = transactions.filter((t) => {
        const matchesUser = viewMode === "Combined" || t.user_id === viewMode;
        const matchesDate = timePeriod === "all" || new Date(t.date) >= startDate;
        return matchesUser && matchesDate;
    });

    const currentPeriod = TIME_PERIODS.find(p => p.id === timePeriod);

    return (
        <div className="space-y-6 relative">
            {/* Period Selector - Stays at top right */}
            <div className="absolute top-0 right-0 z-40">
                <div className="relative">
                    <button
                        onClick={() => setShowPeriodMenu(!showPeriodMenu)}
                        className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 group"
                    >
                        <Calendar className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                        <span className="text-sm font-medium text-white">{currentPeriod?.short}</span>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${showPeriodMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showPeriodMenu && (
                        <div className="absolute top-full right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden min-w-[160px]">
                            {TIME_PERIODS.map((period) => (
                                <button
                                    key={period.id}
                                    onClick={() => {
                                        setTimePeriod(period.id);
                                        setShowPeriodMenu(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left text-sm transition-all ${timePeriod === period.id
                                            ? "bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium"
                                            : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                        }`}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <DashboardCards
                accounts={accounts}
                assets={assets}
                allTransactions={transactions}
                filteredTransactions={filteredTransactions}
                viewMode={viewMode}
                timePeriod={timePeriod}
                userAName={userAName}
                userBName={userBName}
            />

            <div className="space-y-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                    Recent Activity
                </h2>
                <div className="space-y-3">
                    {filteredTransactions.slice(0, 10).map((t) => (
                        <div
                            key={t.id}
                            className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 p-4 rounded-xl flex items-center justify-between hover:border-zinc-600 transition-all duration-300 group"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${t.type === "income"
                                            ? "bg-green-500/10 text-green-400 group-hover:bg-green-500/20"
                                            : t.type === "transfer"
                                                ? "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20"
                                                : "bg-red-500/10 text-red-400 group-hover:bg-red-500/20"
                                        } transition-colors`}
                                >
                                    {t.category === "Food" && "🥣"}
                                    {t.category === "Essentials" && "🛒"}
                                    {t.category === "Transport" && "⛽"}
                                    {t.category === "Utilities" && "📱"}
                                    {t.category === "Shopping" && "🛍️"}
                                    {t.category === "Fun" && "🎬"}
                                    {t.category === "Transfer" && "💸"}
                                    {!["Food", "Essentials", "Transport", "Utilities", "Shopping", "Fun", "Transfer"].includes(t.category) && "📄"}
                                </div>
                                <div>
                                    <div className="font-medium text-white">{t.category}</div>
                                    <div className="text-xs text-zinc-500">
                                        {t.description} • {format(new Date(t.date), "MMM d, h:mm a")}
                                    </div>
                                </div>
                            </div>
                            <div
                                className={`font-bold ${t.type === "income"
                                        ? "text-green-400"
                                        : t.type === "transfer"
                                            ? "text-zinc-100"
                                            : "text-white"
                                    }`}
                            >
                                {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
                            </div>
                        </div>
                    ))}
                    {filteredTransactions.length === 0 && (
                        <div className="text-center text-zinc-500 py-8">No transactions found</div>
                    )}
                </div>
            </div>

            <TransactionForm accounts={accounts} />
        </div>
    );
}
