"use client";

import { Asset } from "@/lib/types";
import { format } from "date-fns";
import { Sparkles } from "lucide-react";

export function AssetList({ assets }: { assets: Asset[] }) {
    if (assets.length === 0) {
        return <div className="text-center text-zinc-500 py-8">No assets found</div>;
    }

    return (
        <div className="space-y-4">
            {assets.map((asset) => (
                <div
                    key={asset.id}
                    className={`relative overflow-hidden rounded-2xl p-6 border shadow-xl transition-all duration-300 hover:scale-[1.02] ${asset.metal_type === "Gold"
                            ? "bg-gradient-to-br from-amber-900/30 via-yellow-900/20 to-amber-800/30 border-amber-700/30 hover:border-amber-600/50"
                            : "bg-gradient-to-br from-zinc-800/50 via-slate-800/30 to-zinc-700/50 border-zinc-600/30 hover:border-zinc-500/50"
                        }`}
                >
                    {/* Metallic shine effect */}
                    <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 ${asset.metal_type === "Gold"
                            ? "bg-gradient-to-br from-amber-400 to-yellow-500"
                            : "bg-gradient-to-br from-slate-300 to-zinc-400"
                        }`}></div>

                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${asset.metal_type === "Gold"
                                        ? "bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/30"
                                        : "bg-gradient-to-br from-slate-400 to-zinc-500 shadow-lg shadow-zinc-500/30"
                                    }`}>
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className={`text-xl font-bold ${asset.metal_type === "Gold"
                                            ? "bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent"
                                            : "bg-gradient-to-r from-slate-200 to-zinc-300 bg-clip-text text-transparent"
                                        }`}>
                                        {asset.metal_type}
                                    </div>
                                    <div className="text-xs text-zinc-400">
                                        {format(new Date(asset.date), "MMM d, yyyy")}
                                    </div>
                                </div>
                            </div>
                            <div className={`px-4 py-2 rounded-full font-bold ${asset.metal_type === "Gold"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30"
                                }`}>
                                {asset.grams}g
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                                <div className="text-xs text-zinc-500 mb-1">Invested Value</div>
                                <div className="text-2xl font-bold text-white">₹{asset.invested_value.toLocaleString()}</div>
                            </div>
                            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                                <div className="text-xs text-zinc-500 mb-1">Tax Paid</div>
                                <div className="text-2xl font-bold text-red-400">₹{asset.tax_deducted.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
