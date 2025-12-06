"use client";

import { Account, Asset, Transaction } from "@/lib/types";
import { ViewMode } from "@/context/UserContext";
import { useMemo, useState } from "react";
import { Wallet, TrendingUp, Flame, PieChart, TrendingDown, Users } from "lucide-react";
import { CategoryDetailModal } from "./CategoryDetailModal";

interface DashboardCardsProps {
    accounts: Account[];
    assets: Asset[];
    allTransactions: Transaction[];
    filteredTransactions: Transaction[];
    viewMode: ViewMode;
    timePeriod: string;
    userAName: string;
    userBName: string;
}

export function DashboardCards({
    accounts,
    assets,
    allTransactions,
    filteredTransactions,
    viewMode,
    timePeriod,
    userAName,
    userBName
}: DashboardCardsProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const stats = useMemo(() => {
        const filteredAccounts = accounts.filter(
            (a) =>
                a.is_active &&
                (viewMode === "Combined" ||
                    a.user_id === viewMode ||
                    a.user_id === "Shared")
        );

        const filteredAssets = assets.filter(
            (a) => viewMode === "Combined" || a.user_id === viewMode
        );

        const totalCash = filteredAccounts.reduce((sum, a) => sum + a.current_balance, 0);
        const totalInvested = filteredAssets.reduce((sum, a) => sum + a.invested_value, 0);
        const netWorth = totalCash + totalInvested;

        const totalValue = totalCash + totalInvested || 1;
        const liquidPercent = Math.round((totalCash / totalValue) * 100);
        const investedPercent = 100 - liquidPercent;

        const totalIncome = filteredTransactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = filteredTransactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        const savings = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

        // Category breakdown with transactions
        const categoryData: Record<string, { amount: number; transactions: Transaction[] }> = {};
        filteredTransactions
            .filter((t) => t.type === "expense")
            .forEach((t) => {
                if (!categoryData[t.category]) {
                    categoryData[t.category] = { amount: 0, transactions: [] };
                }
                categoryData[t.category].amount += t.amount;
                categoryData[t.category].transactions.push(t);
            });

        const topCategories = Object.entries(categoryData)
            .sort(([, a], [, b]) => b.amount - a.amount)
            .slice(0, 5)
            .map(([category, data]) => ({
                category,
                amount: data.amount,
                transactions: data.transactions,
                percent: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
            }));

        // Per-user spending breakdown
        const userAExpense = filteredTransactions
            .filter((t) => t.type === "expense" && t.user_id === "A")
            .reduce((sum, t) => sum + t.amount, 0);

        const userBExpense = filteredTransactions
            .filter((t) => t.type === "expense" && t.user_id === "B")
            .reduce((sum, t) => sum + t.amount, 0);

        const userAPercent = totalExpense > 0 ? Math.round((userAExpense / totalExpense) * 100) : 0;
        const userBPercent = totalExpense > 0 ? Math.round((userBExpense / totalExpense) * 100) : 0;

        return {
            netWorth,
            totalCash,
            totalInvested,
            liquidPercent,
            investedPercent,
            totalIncome,
            totalExpense,
            savings,
            savingsRate,
            topCategories,
            userAExpense,
            userBExpense,
            userAPercent,
            userBPercent,
        };
    }, [accounts, assets, filteredTransactions, viewMode]);

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, string> = {
            Food: "🥣",
            Essentials: "🛒",
            Transport: "⛽",
            Utilities: "📱",
            Shopping: "🛍️",
            Fun: "🎬",
            Transfer: "💸",
        };
        return icons[category] || "📄";
    };

    const getCategoryColor = (index: number) => {
        const colors = [
            "from-red-500 to-pink-500",
            "from-orange-500 to-amber-500",
            "from-yellow-500 to-lime-500",
            "from-green-500 to-emerald-500",
            "from-blue-500 to-cyan-500",
        ];
        return colors[index] || colors[0];
    };

    const getCategoryColorStyle = (index: number) => {
        const colors = [
            "linear-gradient(to right, #ef4444, #ec4899)",
            "linear-gradient(to right, #f97316, #f59e0b)",
            "linear-gradient(to right, #eab308, #84cc16)",
            "linear-gradient(to right, #22c55e, #10b981)",
            "linear-gradient(to right, #3b82f6, #06b6d4)",
        ];
        return colors[index] || colors[0];
    };

    // Get selected category data
    const selectedCategoryData = selectedCategory
        ? stats.topCategories.find((c) => c.category === selectedCategory)
        : null;

    return (
        <div className="space-y-6">
            {/* Category Detail Modal */}
            <CategoryDetailModal
                isOpen={!!selectedCategory}
                onClose={() => setSelectedCategory(null)}
                category={selectedCategory || ""}
                transactions={selectedCategoryData?.transactions || []}
                totalAmount={selectedCategoryData?.amount || 0}
            />

            {/* Hero Section - Net Worth & Summary */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Net Worth - Hero Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 rounded-2xl p-6 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
                    <div className="relative">
                        <div className="flex items-center gap-2 text-zinc-400 mb-3">
                            <Wallet className="w-5 h-5" />
                            <span className="text-sm font-medium">Net Worth</span>
                        </div>
                        <div className="text-5xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent mb-2">
                            ₹{stats.netWorth.toLocaleString()}
                        </div>
                        <div className="text-sm text-zinc-500">Total wealth across all accounts & assets</div>
                    </div>
                </div>

                {/* Period Summary - Hero Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 rounded-2xl p-6 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
                    <div className="relative">
                        <div className="flex items-center gap-2 text-zinc-400 mb-3">
                            {stats.savings >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                            <span className="text-sm font-medium">
                                {timePeriod === "all" ? "All Time" : timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Summary
                            </span>
                        </div>
                        <div className={`text-5xl font-bold mb-2 ${stats.savings >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {stats.savings >= 0 ? "+" : ""}₹{stats.savings.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-green-400">↑ ₹{stats.totalIncome.toLocaleString()}</span>
                            <span className="text-red-400">↓ ₹{stats.totalExpense.toLocaleString()}</span>
                            <span className="text-zinc-500">• {stats.savingsRate}% saved</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Spending Cards - Burn Rate */}
            {viewMode === "Combined" && (
                <div className="grid grid-cols-2 gap-4">
                    {/* User A Spending */}
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
                            <div className="text-2xl font-bold text-white mb-1">
                                ₹{stats.userAExpense.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ 
                                            width: `${stats.userAPercent}%`,
                                            background: "linear-gradient(to right, #ef4444, #ec4899)"
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-zinc-400">{stats.userAPercent}%</span>
                            </div>
                        </div>
                    </div>

                    {/* User B Spending */}
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
                            <div className="text-2xl font-bold text-white mb-1">
                                ₹{stats.userBExpense.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ 
                                            width: `${stats.userBPercent}%`,
                                            background: "linear-gradient(to right, #a855f7, #6366f1)"
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-zinc-400">{stats.userBPercent}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Spending Categories - Clickable */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 text-zinc-300 mb-6">
                    <PieChart className="w-5 h-5" />
                    <span className="text-lg font-semibold">Top Spending Categories</span>
                    <span className="text-xs text-zinc-500 ml-auto">Tap for details</span>
                </div>

                {stats.topCategories.length > 0 ? (
                    <div className="space-y-4">
                        {stats.topCategories.map((cat, index) => (
                            <button
                                key={cat.category}
                                onClick={() => setSelectedCategory(cat.category)}
                                className="w-full group text-left"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-zinc-300 flex items-center gap-2 font-medium group-hover:text-white transition-colors">
                                        <span className="text-xl">{getCategoryIcon(cat.category)}</span>
                                        {cat.category}
                                        <span className="text-xs text-zinc-600 group-hover:text-zinc-400">→</span>
                                    </span>
                                    <div className="text-right">
                                        <div className="text-white font-bold">₹{cat.amount.toLocaleString()}</div>
                                        <div className="text-xs text-zinc-500">{cat.percent}%</div>
                                    </div>
                                </div>
                                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-500 group-hover:opacity-80"
                                        style={{ 
                                            width: `${cat.percent}%`,
                                            background: getCategoryColorStyle(index)
                                        }}
                                    />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-zinc-500 py-8">No expenses in this period</div>
                )}
            </div>

            {/* Portfolio Split */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-zinc-300">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-lg font-semibold">Portfolio Split</span>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-emerald-400 font-medium">💵 Liquid: ₹{stats.totalCash.toLocaleString()}</span>
                    <span className="text-amber-400 font-medium">📊 Invested: ₹{stats.totalInvested.toLocaleString()}</span>
                </div>

                <div className="h-4 bg-zinc-800 rounded-full overflow-hidden flex shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                        style={{ width: `${stats.liquidPercent}%` }}
                    />
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
                        style={{ width: `${stats.investedPercent}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-zinc-500 mt-2">
                    <span>{stats.liquidPercent}%</span>
                    <span>{stats.investedPercent}%</span>
                </div>
            </div>
        </div>
    );
}
