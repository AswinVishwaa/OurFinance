"use client";

import { Account, Transaction, DebtSummary, Asset } from "@/lib/types";
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
    ChevronDown,
    Sparkles
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, differenceInDays, startOfDay } from "date-fns";
import { DebtRepayModal } from "./DebtRepayModal";

interface AnalyticsViewProps {
    accounts: Account[];
    transactions: Transaction[];
    assets: Asset[];
    userAName: string;
    userBName: string;
}

type TimePeriod = "month" | "quarter" | "year";

export function AnalyticsView({ accounts, transactions, assets, userAName, userBName }: AnalyticsViewProps) {
    const { viewMode } = useUser();
    // State to toggle expanded card view
    const [assetExpanded, setAssetExpanded] = useState(false);
    const [isAssetAnimating, setIsAssetAnimating] = useState(false);
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
    const [showPeriodMenu, setShowPeriodMenu] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState<DebtSummary | null>(null);

    // Compute asset totals for the selected view
    const assetsForView = useMemo(() => {
        return assets.filter(a => viewMode === "Combined" || a.user_id === viewMode);
    }, [assets, viewMode]);

    const assetStats = useMemo(() => {
        const goldInvested = assetsForView
            .filter(a => a.metal_type === "Gold")
            .reduce((sum, a) => sum + (a.invested_value || 0), 0);

        const silverInvested = assetsForView
            .filter(a => a.metal_type === "Silver")
            .reduce((sum, a) => sum + (a.invested_value || 0), 0);

        const taxGold = assetsForView
            .filter(a => a.metal_type === "Gold")
            .reduce((sum, a) => sum + (a.tax_deducted || 0), 0);

        const taxSilver = assetsForView
            .filter(a => a.metal_type === "Silver")
            .reduce((sum, a) => sum + (a.tax_deducted || 0), 0);

        const totalInvested = goldInvested + silverInvested;
        const totalTax = taxGold + taxSilver;

        const goldRatio = totalInvested > 0 ? goldInvested / totalInvested : 0.5;

        return { goldInvested, silverInvested, taxGold, taxSilver, totalInvested, totalTax, goldRatio };
    }, [assetsForView]);

    // UI helpers for donut and theme accents
    const goldPct = Math.round((assetStats.goldRatio || 0.5) * 100);
    const goldColor = "#f59e0b";
    const silverColor = "#9ca3af";
    const goldAccentGradient = `linear-gradient(90deg, #fcd34d, #f59e0b, #d97706)`;
    const silverAccentGradient = `linear-gradient(90deg, #f3f4f6, #d1d5db, #9ca3af)`;
    const themeAccent = viewMode === "A" ? ["#ef4444", "#ec4899"] : viewMode === "B" ? ["#a855f7", "#6366f1"] : ["#10b981", "#14b8a6"];
    const cardShadow = (isAssetAnimating || assetExpanded) ? `0 10px 30px ${themeAccent[0]}22, 0 2px 6px ${themeAccent[1]}11` : undefined;

    // Filter transactions by user
    const userTransactions = useMemo(() => {
        return transactions.filter(t => 
            viewMode === "Combined" || t.user_id === viewMode
        );
    }, [transactions, viewMode]);

    // Precompute some SVG values for the donut visualization
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const goldLength = circumference * assetStats.goldRatio;
    const silverLength = Math.max(0, circumference - goldLength);

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
            {/* Assets Summary Card */}
            <div
                role="button"
                onClick={() => {
                    setIsAssetAnimating(true);
                    setTimeout(() => setIsAssetAnimating(false), 600);
                    setAssetExpanded(!assetExpanded);
                }}
                className="relative overflow-hidden bg-linear-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-4 shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
            >
                {/* Sparkle animation on toggle */}
                {isAssetAnimating && (
                    <>
                        <Sparkles className="absolute top-2 left-3 w-4 h-4 text-amber-400 animate-ping" />
                        <Sparkles className="absolute bottom-2 right-3 w-3 h-3 text-zinc-400 animate-ping" style={{ animationDelay: '150ms' }} />
                        <Sparkles className="absolute top-3 right-6 w-3 h-3 text-amber-300 animate-ping" style={{ animationDelay: '300ms' }} />
                    </>
                )}

                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                {/* When not expanded show donut + summary; when expanded show only sub-details */}
                {!assetExpanded ? (
                    <div className="flex flex-col md:flex-row items-center gap-4 relative">
                        <div className="flex items-center justify-center w-full md:w-40 transition-all duration-300">
                            <div
                                style={{
                                    width: 88,
                                    height: 88,
                                    padding: 8,
                                    borderRadius: 9999,
                                    background: `conic-gradient(${goldColor} 0% ${goldPct}%, ${silverColor} ${goldPct}% 100%)`,
                                    boxShadow: (isAssetAnimating || assetExpanded) ? `0 8px 28px ${themeAccent[0]}22` : undefined,
                                }}
                                className="rounded-full flex items-center justify-center drop-shadow-lg"
                            >
                                <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: 'rgba(10,10,10,0.8)' }}>
                                    <div className="text-sm font-semibold text-white">₹{assetStats.totalInvested.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-zinc-400 font-medium">Assets Invested</div>
                                <div className="text-xs text-zinc-500">{viewMode === 'Combined' ? 'Combined' : `${viewMode === 'A' ? userAName : userBName}`}</div>
                            </div>

                            <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(90deg,#f6c24a,#f59e0b)' }} />
                                        <span className="text-sm text-zinc-200">Gold</span>
                                    </div>
                                    <div className="text-sm font-bold">₹{assetStats.goldInvested.toLocaleString()}</div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(90deg,#e6edf3,#9ca3af)' }} />
                                        <span className="text-sm text-zinc-200">Silver</span>
                                    </div>
                                    <div className="text-sm font-bold">₹{assetStats.silverInvested.toLocaleString()}</div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                                    <div className="text-xs text-zinc-400">Tax</div>
                                    <div className="text-sm font-medium text-zinc-300">₹{assetStats.totalTax.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        <div className="text-sm text-zinc-400 font-medium">Assets Details</div>
                        <div className="mt-4 bg-zinc-900/30 p-3 rounded-lg transition-all duration-300">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="text-xs text-zinc-400">Gold Invested</div>
                                <div className="text-sm font-medium text-right">₹{assetStats.goldInvested.toLocaleString()}</div>

                                <div className="text-xs text-zinc-400">Gold Tax</div>
                                <div className="text-sm font-medium text-right">₹{assetStats.taxGold.toLocaleString()}</div>

                                <div className="text-xs text-zinc-400">Silver Invested</div>
                                <div className="text-sm font-medium text-right">₹{assetStats.silverInvested.toLocaleString()}</div>

                                <div className="text-xs text-zinc-400">Silver Tax</div>
                                <div className="text-sm font-medium text-right">₹{assetStats.taxSilver.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Month Summary Card */}
            <div className="relative overflow-hidden bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 rounded-2xl p-6 shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
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
                <div className="bg-linear-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-4 shadow-xl">
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
                <div className="bg-linear-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-4 shadow-xl">
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
                    <div className="relative overflow-hidden bg-linear-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-4 shadow-xl">
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

                    <div className="relative overflow-hidden bg-linear-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-4 shadow-xl">
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
            <div className="bg-linear-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-6 shadow-xl">
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
            <div className="bg-linear-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-6 shadow-xl">
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
