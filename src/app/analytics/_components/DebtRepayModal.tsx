"use client";

import { Account, DebtSummary } from "@/lib/types";
import { repayDebt } from "@/actions/transactions";
import { useState } from "react";
import { X, Loader2, HandCoins } from "lucide-react";

interface DebtRepayModalProps {
    debt: DebtSummary;
    accounts: Account[];
    onClose: () => void;
}

export function DebtRepayModal({ debt, accounts, onClose }: DebtRepayModalProps) {
    const [amount, setAmount] = useState(debt.remaining_amount.toString());
    const [accountId, setAccountId] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            await repayDebt({
                original_debt_id: debt.id,
                amount: Number(amount),
                account_id: accountId,
                user_id: debt.user_id,
                description: `Repaying: ${debt.description}`,
            });
            onClose();
        } finally {
            setLoading(false);
        }
    }

    const repayAmount = Number(amount) || 0;
    const isFullRepayment = repayAmount >= debt.remaining_amount;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full sm:w-[400px] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="bg-zinc-900/95 border-b border-zinc-700/50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <HandCoins className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Repay Debt</h3>
                            <p className="text-xs text-zinc-400">{debt.description}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-zinc-700/50 transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Debt Info */}
                    <div className="bg-black/20 rounded-xl p-4 border border-zinc-700/30">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-zinc-400">Original Amount</span>
                            <span className="text-white">₹{debt.original_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-zinc-400">Already Paid</span>
                            <span className="text-green-400">₹{debt.paid_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t border-zinc-700/50 pt-2 mt-2">
                            <span className="text-zinc-300">Remaining</span>
                            <span className="text-amber-400">₹{debt.remaining_amount.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-2 uppercase">
                            Repayment Amount
                        </label>
                        <input
                            required
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            max={debt.remaining_amount}
                            className="w-full bg-zinc-800 text-white text-2xl font-bold p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="0"
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => setAmount((debt.remaining_amount / 2).toString())}
                                className="flex-1 py-2 bg-zinc-800 text-zinc-300 text-sm rounded-lg hover:bg-zinc-700"
                            >
                                50%
                            </button>
                            <button
                                type="button"
                                onClick={() => setAmount(debt.remaining_amount.toString())}
                                className="flex-1 py-2 bg-zinc-800 text-zinc-300 text-sm rounded-lg hover:bg-zinc-700"
                            >
                                Full
                            </button>
                        </div>
                    </div>

                    {/* Account Selection */}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-2 uppercase">
                            Pay From Account
                        </label>
                        <select
                            required
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            className="w-full bg-zinc-800 text-white p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Select Account</option>
                            {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name} (₹{a.current_balance.toLocaleString()})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || repayAmount <= 0}
                        className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-5 h-5" />
                        ) : isFullRepayment ? (
                            "Clear Debt ✓"
                        ) : (
                            `Pay ₹${repayAmount.toLocaleString()}`
                        )}
                    </button>
                </form>

                {/* Pull indicator for mobile */}
                <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-zinc-600 rounded-full" />
            </div>
        </div>
    );
}
