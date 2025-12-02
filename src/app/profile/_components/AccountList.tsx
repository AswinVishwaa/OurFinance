"use client";

import { toggleAccountStatus, correctBalance } from "@/actions/accounts";
import { Account } from "@/lib/types";
import { useState } from "react";
import { Eye, EyeOff, PenLine, Check, X, Loader2 } from "lucide-react";

export function AccountList({ accounts }: { accounts: Account[] }) {
    return (
        <div className="space-y-3">
            {accounts.map((account) => (
                <AccountItem key={account.id} account={account} />
            ))}
        </div>
    );
}

function AccountItem({ account }: { account: Account }) {
    const [isEditing, setIsEditing] = useState(false);
    const [newBalance, setNewBalance] = useState(account.current_balance.toString());
    const [loading, setLoading] = useState(false);

    async function handleToggleStatus() {
        setLoading(true);
        try {
            await toggleAccountStatus(account.id, !account.is_active);
        } finally {
            setLoading(false);
        }
    }

    async function handleBalanceCorrection() {
        setLoading(true);
        try {
            await correctBalance(account.id, Number(newBalance));
            setIsEditing(false);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={`p-4 rounded-xl border ${account.is_active ? "bg-zinc-900 border-zinc-800" : "bg-zinc-950 border-zinc-900 opacity-60"}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{account.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                        {account.user_id}
                    </span>
                </div>
                <button
                    onClick={handleToggleStatus}
                    disabled={loading}
                    className="text-zinc-500 hover:text-white transition-colors"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : account.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
            </div>

            <div className="flex items-center justify-between">
                {isEditing ? (
                    <div className="flex items-center gap-2 w-full">
                        <input
                            type="number"
                            value={newBalance}
                            onChange={(e) => setNewBalance(e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:ring-1 focus:ring-red-500"
                            autoFocus
                        />
                        <button onClick={handleBalanceCorrection} disabled={loading} className="text-green-500 p-1">
                            <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsEditing(false)} className="text-red-500 p-1">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <>
                        <span className="text-2xl font-bold text-white">₹{account.current_balance.toLocaleString()}</span>
                        {account.is_active && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                            >
                                <PenLine className="w-3 h-3" />
                                Correct
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
