"use client";

import { createAccount } from "@/actions/accounts";
import { UserID } from "@/lib/types";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

export function CreateAccountForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [accountType, setAccountType] = useState("Bank");
    const [balance, setBalance] = useState("");
    const [owner, setOwner] = useState<UserID | "Shared">("A");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await createAccount(name, accountType, owner, Number(balance));
            setIsOpen(false);
            setName("");
            setAccountType("Bank");
            setBalance("");
            setOwner("A");
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full py-3 bg-zinc-800 rounded-xl flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
                <Plus className="w-5 h-5" />
                <span>Add New Account</span>
            </button>
        );
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-white">New Account</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Account Name</label>
                    <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="e.g. HDFC Bank"
                    />
                </div>

                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Account Type</label>
                    <input
                        required
                        type="text"
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="e.g. Bank, Wallet, Cash"
                    />
                </div>

                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Initial Balance</label>
                    <input
                        required
                        type="number"
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Owner</label>
                    <div className="flex gap-2">
                        {(["A", "B", "Shared"] as const).map((o) => (
                            <button
                                key={o}
                                type="button"
                                onClick={() => setOwner(o)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${owner === o
                                    ? "bg-red-600 text-white"
                                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                    }`}
                            >
                                {o}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 py-2 bg-zinc-800 text-white rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Create"}
                    </button>
                </div>
            </form>
        </div>
    );
}
