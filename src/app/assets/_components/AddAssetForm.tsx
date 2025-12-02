"use client";

import { addAsset, addExistingAsset } from "@/actions/assets";
import { UserID } from "@/lib/types";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

export function AddAssetForm({ userAName, userBName }: { userAName: string; userBName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExisting, setIsExisting] = useState(false);
    const [metalType, setMetalType] = useState<"Gold" | "Silver">("Gold");
    const [cashPaid, setCashPaid] = useState("");
    const [investedValue, setInvestedValue] = useState("");
    const [grams, setGrams] = useState("");
    const [owner, setOwner] = useState<UserID>("A");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            if (isExisting) {
                // Add existing asset - no tax calculation
                await addExistingAsset({
                    metal_type: metalType,
                    invested_value: Number(investedValue),
                    grams: Number(grams),
                    user_id: owner,
                });
            } else {
                // Add new asset - with tax calculation
                await addAsset({
                    metal_type: metalType,
                    total_cash_paid: Number(cashPaid),
                    grams: Number(grams),
                    user_id: owner,
                });
            }
            setIsOpen(false);
            setCashPaid("");
            setInvestedValue("");
            setGrams("");
            setOwner("A");
            setIsExisting(false);
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
                <span>Add Asset</span>
            </button>
        );
    }

    // Calculate tax preview for new assets
    const tax = Number(cashPaid) * 0.03;
    const invested = Number(cashPaid) - tax;

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-white">Add Asset</h3>

            {/* Toggle between New and Existing */}
            <div className="flex gap-2 p-1 bg-zinc-800 rounded-lg">
                <button
                    type="button"
                    onClick={() => setIsExisting(false)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${!isExisting
                            ? "bg-amber-500 text-black"
                            : "text-zinc-400 hover:text-white"
                        }`}
                >
                    New Purchase
                </button>
                <button
                    type="button"
                    onClick={() => setIsExisting(true)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${isExisting
                            ? "bg-amber-500 text-black"
                            : "text-zinc-400 hover:text-white"
                        }`}
                >
                    Existing Asset
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Metal Type</label>
                    <div className="flex gap-2">
                        {(["Gold", "Silver"] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setMetalType(t)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${metalType === t
                                        ? "bg-amber-500 text-black"
                                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {isExisting ? (
                    // Existing Asset - Direct invested value input
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1">
                            Invested Value (after tax)
                        </label>
                        <input
                            required
                            type="number"
                            value={investedValue}
                            onChange={(e) => setInvestedValue(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Enter current invested value"
                        />
                        <p className="text-xs text-zinc-500 mt-1">
                            💡 Enter the value you see in your statement (tax already deducted)
                        </p>
                    </div>
                ) : (
                    // New Purchase - Calculate tax
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1">Total Cash Paid</label>
                        <input
                            required
                            type="number"
                            value={cashPaid}
                            onChange={(e) => setCashPaid(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="0.00"
                        />
                        {cashPaid && (
                            <div className="text-xs text-zinc-500 mt-1 flex justify-between">
                                <span>Tax (3%): ₹{tax.toFixed(0)}</span>
                                <span>Invested: ₹{invested.toFixed(0)}</span>
                            </div>
                        )}
                    </div>
                )}

                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Grams</label>
                    <input
                        required
                        type="number"
                        step="0.01"
                        value={grams}
                        onChange={(e) => setGrams(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="0.00g"
                    />
                </div>

                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Owner</label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setOwner("A")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${owner === "A"
                                    ? "bg-red-600 text-white"
                                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                }`}
                        >
                            {userAName}
                        </button>
                        <button
                            type="button"
                            onClick={() => setOwner("B")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${owner === "B"
                                    ? "bg-red-600 text-white"
                                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                }`}
                        >
                            {userBName}
                        </button>
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
                        className="flex-1 py-2 bg-amber-500 text-black font-medium rounded-lg flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Add Asset"}
                    </button>
                </div>
            </form>
        </div>
    );
}
