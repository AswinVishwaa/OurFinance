"use client";

import { Transaction } from "@/lib/types";
import { format } from "date-fns";
import { X, Receipt } from "lucide-react";
import { useEffect } from "react";

interface CategoryDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: string;
    transactions: Transaction[];
    totalAmount: number;
}

export function CategoryDetailModal({
    isOpen,
    onClose,
    category,
    transactions,
    totalAmount,
}: CategoryDetailModalProps) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const getCategoryIcon = (cat: string) => {
        const icons: Record<string, string> = {
            Food: "🥣",
            Essentials: "🛒",
            Transport: "⛽",
            Utilities: "📱",
            Shopping: "🛍️",
            Fun: "🎬",
            Transfer: "💸",
        };
        return icons[cat] || "📄";
    };

    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full sm:w-[480px] max-h-[85vh] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-700/50 p-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
                            {getCategoryIcon(category)}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{category}</h3>
                            <p className="text-sm text-zinc-400">
                                {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-zinc-700/50 transition-colors"
                    >
                        <X className="w-6 h-6 text-zinc-400" />
                    </button>
                </div>

                {/* Total Amount */}
                <div className="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 border-b border-zinc-700/30">
                    <div className="text-sm text-zinc-400">Total Spent</div>
                    <div className="text-3xl font-bold text-red-400">
                        ₹{totalAmount.toLocaleString()}
                    </div>
                </div>

                {/* Transactions List */}
                <div className="overflow-y-auto max-h-[50vh] p-4 space-y-3">
                    {sortedTransactions.length > 0 ? (
                        sortedTransactions.map((t) => (
                            <div
                                key={t.id}
                                className="bg-zinc-800/50 border border-zinc-700/30 rounded-xl p-4 hover:border-zinc-600/50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-white truncate">
                                            {t.description || "No description"}
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2 flex-wrap">
                                            <span>{format(new Date(t.date), "MMM d, yyyy")}</span>
                                            <span>•</span>
                                            <span>{format(new Date(t.date), "h:mm a")}</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="font-bold text-white">
                                            ₹{t.amount.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-zinc-500">
                                            {((t.amount / totalAmount) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-zinc-500 py-8 flex flex-col items-center gap-2">
                            <Receipt className="w-8 h-8 opacity-50" />
                            <span>No transactions found</span>
                        </div>
                    )}
                </div>

                {/* Pull indicator for mobile */}
                <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-zinc-600 rounded-full" />
            </div>
        </div>
    );
}
