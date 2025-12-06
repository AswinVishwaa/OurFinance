"use client";

import { Account, Transaction, DebtSummary } from "@/lib/types";
import { useUser } from "@/context/UserContext";
import { useMemo, useState } from "react";
import { 
    TrendingUp, 
    TrendingDown, 
    Calendar, 
    Flame, 
    ArrowUpRight, 
    ArrowDownRight,
    HandCoins,
    CheckCircle2,
    ChevronDown
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, differenceInDays, startOfDay } from "date-fns";
import { DebtRepayModal } from "./DebtRepayModal";

interface AnalyticsViewProps {
    accounts: Account[];
    transactions: Transaction[];
    userAName: string;
    userBName: string;
}

type TimePeriod = "month" | "quarter" | "year";

export function AnalyticsView({ accounts, transactions, userAName, userBName }: AnalyticsViewProps) {
    const { viewMode } = useUser();
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
    const [showPeriodMenu, setShowPeriodMenu] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState<DebtSummary | null>(null);

    // Filter transactions by user
    const userTransactions = useMemo(() => {
        return transactions.filter(t => 
            viewMode === "Combined" || t.user_id === viewMode
        );
    }, [transactions, viewMode]);

    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const currentMonthStart = startOfMonth(now);
        const currentMonthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        // Current month transactions
        const currentMonthTx = userTransactions.filter(t => {
            const date = new Date(t.date);
            return date >= currentMonthStart && date <= currentMonthEnd;
        });

        // Last month transactions
        const lastMonthTx = userTransactions.filter(t => {
            const date = new Date(t.date);
            return date >= lastMonthStart && date <= lastMonthEnd;
        });

        // Current month expenses
        const currentExpense = currentMonthTx
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        // Current month income
        const currentIncome = currentMonthTx
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);

        // Last month expenses
        const lastExpense = lastMonthTx
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        // Last month income
        const lastIncome = lastMonthTx
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);

        // Month over month change
        const expenseChange = lastExpense > 0 
            ? Math.round(((currentExpense - lastExpense) / lastExpense) * 100) 
            : 0;
        const incomeChange = lastIncome > 0 
            ? Math.round(((currentIncome - lastIncome) / lastIncome) * 100) 
            : 0;

        // Daily average (days elapsed in current month)
        const daysElapsed = differenceInDays(now, currentMonthStart) + 1;
        const dailyAvgExpense = Math.round(currentExpense / daysElapsed);
        const dailyAvgIncome = Math.round(currentIncome / daysElapsed);

        // Projected month end
        const daysInMonth = differenceInDays(currentMonthEnd, currentMonthStart) + 1;
        const projectedExpense = Math.round((currentExpense / daysElapsed) * daysInMonth);
        const projectedIncome = Math.round((currentIncome / daysElapsed) * daysInMonth);

        // Per-user burn rate (for Combined view)
        const userAExpense = currentMonthTx
            .filter(t => t.type === "expense" && t.user_id === "A")
            .reduce((sum, t) => sum + t.amount, 0);
        const userBExpense = currentMonthTx
            .filter(t => t.type === "expense" && t.user_id === "B")
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            currentExpense,
            currentIncome,
            lastExpense,
            lastIncome,
            expenseChange,
            incomeChange,
            dailyAvgExpense,
            dailyAvgIncome,
            projectedExpense,
            projectedIncome,
            daysElapsed,
            daysInMonth,
            userAExpense,
            userBExpense,
        };
    }, [userTransactions]);

    // Calculate debts
    const debts = useMemo((): DebtSummary[] => {
        // Find all "Borrowed" income transactions (debts)
        const debtTransactions = userTransactions.filter(t => 
            t.type === "income" && (t.category === "Borrowed" || t.is_debt)
        );

        // Find all debt repayments
        const repayments = userTransactions.filter(t => 
            t.category === "Debt Repayment" && t.debt_id
        );

        return debtTransactions.map(debt => {
            // Calculate total repaid for this debt
            const paidAmount = repayments
                .filter(r => r.debt_id === debt.id)
                .reduce((sum, r) => sum + r.amount, 0);

            return {
                id: debt.id,
                date: debt.date,
                description: debt.description || "Borrowed money",
                original_amount: debt.amount,
                paid_amount: paidAmount,
                remaining_amount: debt.amount - paidAmount,
                user_id: debt.user_id,
                is_cleared: paidAmount >= debt.amount,
            };
        }).filter(d => !d.is_cleared); // Only show uncleard debts
    }, [userTransactions]);

    const totalDebt = debts.reduce((sum, d) => sum + d.remaining_amount, 0);

    return (
        <div className="space-y-6">
            {/* Debt Repay Modal */}
            {selectedDebt && (
                <DebtRepayModal
                    debt={selectedDebt}
                    accounts={accounts.filter(a => 
                        a.is_active && (viewMode === "Combined" || a.user_id === viewMode || a.user_id === "Shared")
                    )}
                    onClose={() => setSelectedDebt(null)}
                />
            )}

            {/* Month Summary Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Calendar className="w-5 h-5" />
                            <span className="text-sm font-medium">{format(new Date(), "MMMM yyyy")} Summary</span>
                        </div>
                        <div className="text-xs text-zinc-500">
                            Day {stats.daysElapsed} of {stats.daysInMonth}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Income */}
                        <div className="bg-black/20 rounded-xl p-4">
                            <div className="text-xs text-zinc-500 mb-1">Income</div>
                            <div className="text-2xl font-bold text-green-400">
                                ₹{stats.currentIncome.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                                {stats.incomeChange >= 0 ? (
                                    <ArrowUpRight className="w-3 h-3 text-green-400" />
                                ) : (
                                    <ArrowDownRight className="w-3 h-3 text-red-400" />
                                )}
                                <span className={`text-xs ${stats.incomeChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                                    {stats.incomeChange >= 0 ? "+" : ""}{stats.incomeChange}% vs last month
                                </span>
                            </div>
                        </div>

                        {/* Expenses */}
                        <div className="bg-black/20 rounded-xl p-4">
                            <div className="text-xs text-zinc-500 mb-1">Expenses</div>
                            <div className="text-2xl font-bold text-red-400">
                                ₹{stats.currentExpense.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                                {stats.expenseChange <= 0 ? (
                                    <ArrowDownRight className="w-3 h-3 text-green-400" />
                                ) : (
                                    <ArrowUpRight className="w-3 h-3 text-red-400" />
                                )}
                                <span className={`text-xs ${stats.expenseChange <= 0 ? "text-green-400" : "text-red-400"}`}>
                                    {stats.expenseChange >= 0 ? "+" : ""}{stats.expenseChange}% vs last month
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Average & Projection */}
            <div className="grid grid-cols-2 gap-4">
                {/* Daily Average */}
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-zinc-400 font-medium">Daily Avg Spend</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        ₹{stats.dailyAvgExpense.toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-500">
                        per day this month
                    </div>
                </div>

                {/* Month Projection */}
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-zinc-400 font-medium">Projected Total</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                        ₹{stats.projectedExpense.toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-500">
                        by month end
                    </div>
                </div>
            </div>

            {/* User Burn Rate (Combined view only) */}
            {viewMode === "Combined" && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-4 shadow-xl">
                        <div 
                            className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-30"
                            style={{ background: "linear-gradient(to bottom right, #ef4444, #ec4899)" }}
                        ></div>
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <Flame className="w-4 h-4 text-red-400" />
                                <span className="text-xs text-zinc-400 font-medium">{userAName}&apos;s Burn</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                ₹{stats.userAExpense.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-4 shadow-xl">
                        <div 
                            className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-30"
                            style={{ background: "linear-gradient(to bottom right, #a855f7, #6366f1)" }}
                        ></div>
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <Flame className="w-4 h-4 text-purple-400" />
                                <span className="text-xs text-zinc-400 font-medium">{userBName}&apos;s Burn</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                ₹{stats.userBExpense.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Month over Month Comparison */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 text-zinc-300 mb-4">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-lg font-semibold">Month Comparison</span>
                </div>

                <div className="space-y-4">
                    {/* Expense Comparison Bar */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-zinc-400">Expenses</span>
                            <div className="flex gap-4">
                                <span className="text-zinc-500">Last: ₹{stats.lastExpense.toLocaleString()}</span>
                                <span className="text-white font-medium">This: ₹{stats.currentExpense.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 h-4">
                            <div className="flex-1 bg-zinc-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-zinc-500 transition-all duration-500"
                                    style={{ width: `${Math.min(100, (stats.lastExpense / Math.max(stats.lastExpense, stats.currentExpense)) * 100)}%` }}
                                />
                            </div>
                            <div className="flex-1 bg-zinc-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full transition-all duration-500"
                                    style={{ 
                                        width: `${Math.min(100, (stats.currentExpense / Math.max(stats.lastExpense, stats.currentExpense)) * 100)}%`,
                                        background: "linear-gradient(to right, #ef4444, #ec4899)"
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Income Comparison Bar */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-zinc-400">Income</span>
                            <div className="flex gap-4">
                                <span className="text-zinc-500">Last: ₹{stats.lastIncome.toLocaleString()}</span>
                                <span className="text-white font-medium">This: ₹{stats.currentIncome.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 h-4">
                            <div className="flex-1 bg-zinc-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-zinc-500 transition-all duration-500"
                                    style={{ width: `${Math.min(100, (stats.lastIncome / Math.max(stats.lastIncome, stats.currentIncome)) * 100)}%` }}
                                />
                            </div>
                            <div className="flex-1 bg-zinc-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full transition-all duration-500"
                                    style={{ 
                                        width: `${Math.min(100, (stats.currentIncome / Math.max(stats.lastIncome, stats.currentIncome)) * 100)}%`,
                                        background: "linear-gradient(to right, #22c55e, #10b981)"
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Debt Tracker */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-zinc-300">
                        <HandCoins className="w-5 h-5 text-amber-400" />
                        <span className="text-lg font-semibold">Debts to Repay</span>
                    </div>
                    {totalDebt > 0 && (
                        <div className="text-amber-400 font-bold">
                            ₹{totalDebt.toLocaleString()}
                        </div>
                    )}
                </div>

                {debts.length > 0 ? (
                    <div className="space-y-3">
                        {debts.map((debt) => (
                            <button
                                key={debt.id}
                                onClick={() => setSelectedDebt(debt)}
                                className="w-full bg-black/20 border border-zinc-700/50 rounded-xl p-4 hover:border-amber-500/30 transition-colors text-left"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="font-medium text-white">{debt.description}</div>
                                        <div className="text-xs text-zinc-500">
                                            {format(new Date(debt.date), "MMM d, yyyy")}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-amber-400 font-bold">
                                            ₹{debt.remaining_amount.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-zinc-500">remaining</div>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full transition-all duration-500"
                                        style={{ 
                                            width: `${(debt.paid_amount / debt.original_amount) * 100}%`,
                                            background: "linear-gradient(to right, #22c55e, #10b981)"
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                                    <span>Paid: ₹{debt.paid_amount.toLocaleString()}</span>
                                    <span>of ₹{debt.original_amount.toLocaleString()}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-zinc-500 flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
                        <span>No pending debts! 🎉</span>
                    </div>
                )}
            </div>
        </div>
    );
}
