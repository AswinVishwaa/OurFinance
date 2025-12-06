"use client";

import { addTransaction, transferFunds } from "@/actions/transactions";
import { Account, TransactionType, UserID } from "@/lib/types";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import { Loader2, Plus, ArrowRightLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const EXPENSE_CATEGORIES = [
    { id: "Food", label: "🥣 Food" },
    { id: "Essentials", label: "🛒 Essentials" },
    { id: "Transport", label: "⛽ Transport" },
    { id: "Utilities", label: "📱 Utilities" },
    { id: "Shopping", label: "🛍️ Shopping" },
    { id: "Fun", label: "🎬 Fun" },
    { id: "Transfer", label: "💸 Transfers" },
    { id: "Other", label: "📝 Other" },
];

const INCOME_CATEGORIES = [
    { id: "Salary", label: "💰 Salary" },
    { id: "Allowance", label: "🎁 Allowance" },
    { id: "Pocket Money", label: "👛 Pocket Money" },
    { id: "Freelance", label: "💼 Freelance" },
    { id: "Investment", label: "📈 Investment" },
    { id: "Refund", label: "↩️ Refund" },
    { id: "Borrowed", label: "🤝 Borrowed (Debt)" },
    { id: "Other", label: "📝 Other" },
];

export function TransactionForm({ accounts }: { accounts: Account[] }) {
    const { viewMode } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<TransactionType>("expense");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [customCategory, setCustomCategory] = useState("");
    const [accountId, setAccountId] = useState("");
    const [toAccountId, setToAccountId] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    // Filter accounts based on viewMode
    const availableAccounts = accounts.filter(
        (a) =>
            a.is_active &&
            (viewMode === "Combined" ||
                a.user_id === viewMode ||
                a.user_id === "Shared")
    );

    // Get categories based on transaction type
    const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const isDebt = category === "Borrowed";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const userId = viewMode === "Combined" ? "A" : viewMode;
            const finalCategory = category === "Other" ? customCategory : category;

            if (category === "Transfer") {
                await transferFunds({
                    from_account_id: accountId,
                    to_account_id: toAccountId,
                    amount: Number(amount),
                    user_id: userId,
                    description: description || "Transfer",
                });
            } else {
                await addTransaction({
                    type,
                    amount: Number(amount),
                    category: finalCategory,
                    account_id: accountId,
                    user_id: userId,
                    description,
                    is_debt: isDebt,
                });
            }
            setIsOpen(false);
            resetForm();
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setAmount("");
        setCategory("");
        setCustomCategory("");
        setAccountId("");
        setToAccountId("");
        setDescription("");
        setType("expense");
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-4 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors z-50"
            >
                <Plus className="w-6 h-6" />
            </button>
        );
    }

    const isTransfer = category === "Transfer";
    const themeColor = isTransfer
        ? "text-blue-500"
        : type === "income"
            ? "text-green-500"
            : "text-red-500";
    const bgColor = isTransfer
        ? "bg-blue-600"
        : type === "income"
            ? "bg-green-600"
            : "bg-red-600";

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-zinc-900 w-full max-w-md rounded-2xl p-6 space-y-6 animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">New Transaction</h2>
                    <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
                        Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type Switcher */}
                    <div className="flex bg-zinc-800 p-1 rounded-lg">
                        {(["expense", "income"] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => {
                                    setType(t);
                                    setCategory(""); // Reset category when switching types
                                }}
                                className={cn(
                                    "flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize",
                                    type === t && category !== "Transfer"
                                        ? t === "income"
                                            ? "bg-green-600 text-white"
                                            : "bg-red-600 text-white"
                                        : "text-zinc-400 hover:text-zinc-200"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Amount */}
                    <div>
                        <label className={cn("block text-xs font-medium mb-1 uppercase", themeColor)}>
                            Amount
                        </label>
                        <input
                            required
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-transparent text-4xl font-bold text-white placeholder-zinc-700 focus:outline-none"
                            placeholder="0"
                            autoFocus
                        />
                    </div>

                    {/* Categories (Pills) */}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-2 uppercase">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategory(cat.id)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                                        category === cat.id
                                            ? cat.id === "Transfer"
                                                ? "bg-blue-600 border-blue-600 text-white"
                                                : cat.id === "Borrowed"
                                                    ? "bg-amber-600 border-amber-600 text-white"
                                                    : type === "income"
                                                        ? "bg-green-600 border-green-600 text-white"
                                                        : "bg-red-600 border-red-600 text-white"
                                            : "bg-zinc-800 border-zinc-800 text-zinc-300 hover:border-zinc-600"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Debt Warning */}
                        {isDebt && (
                            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-200">
                                    <p className="font-medium">This will be tracked as debt</p>
                                    <p className="text-amber-300/70 text-xs mt-1">
                                        You can repay this later from the Analytics page
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Custom Category Input */}
                        {category === "Other" && (
                            <input
                                required
                                type="text"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                className={cn(
                                    "w-full mt-3 bg-zinc-800 text-white p-3 rounded-xl focus:outline-none focus:ring-2",
                                    type === "income" ? "focus:ring-green-500" : "focus:ring-red-500"
                                )}
                                placeholder="Enter custom category"
                            />
                        )}
                    </div>

                    {/* Accounts */}
                    {isTransfer ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1">From</label>
                                <select
                                    required
                                    value={accountId}
                                    onChange={(e) => setAccountId(e.target.value)}
                                    className="w-full bg-zinc-800 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select</option>
                                    {availableAccounts.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-500 mb-1">To</label>
                                <select
                                    required
                                    value={toAccountId}
                                    onChange={(e) => setToAccountId(e.target.value)}
                                    className="w-full bg-zinc-800 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select</option>
                                    {availableAccounts
                                        .filter((a) => a.id !== accountId)
                                        .map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Account</label>
                            <select
                                required
                                value={accountId}
                                onChange={(e) => setAccountId(e.target.value)}
                                className={cn(
                                    "w-full bg-zinc-800 text-white p-3 rounded-xl focus:outline-none focus:ring-2",
                                    type === "income" ? "focus:ring-green-500" : "focus:ring-red-500"
                                )}
                            >
                                <option value="">Select Account</option>
                                {availableAccounts.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-zinc-800 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-600"
                            placeholder="What was this for?"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2",
                            bgColor
                        )}
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Save Transaction"}
                    </button>
                </form>
            </div>
        </div>
    );
}
