"use client";

import { Asset } from "@/lib/types";
import { format } from "date-fns";
import { Sparkles, User } from "lucide-react";

// Inline styles for mobile browser compatibility
const goldGradientBg = "linear-gradient(to bottom right, rgba(120, 53, 15, 0.3), rgba(113, 63, 18, 0.2), rgba(146, 64, 14, 0.3))";
const silverGradientBg = "linear-gradient(to bottom right, rgba(39, 39, 42, 0.5), rgba(30, 41, 59, 0.3), rgba(63, 63, 70, 0.5))";
const goldIconBg = "linear-gradient(to bottom right, #f59e0b, #ca8a04)";
const silverIconBg = "linear-gradient(to bottom right, #94a3b8, #71717a)";
const goldTextGradient = "linear-gradient(to right, #fcd34d, #facc15)";
const silverTextGradient = "linear-gradient(to right, #e2e8f0, #d4d4d8)";
const goldShineBg = "linear-gradient(to bottom right, #fbbf24, #eab308)";
const silverShineBg = "linear-gradient(to bottom right, #cbd5e1, #a1a1aa)";

interface AssetListProps {
    assets: Asset[];
    userAName: string;
    userBName: string;
}

export function AssetList({ assets, userAName, userBName }: AssetListProps) {
    if (assets.length === 0) {
        return <div className="text-center text-zinc-500 py-8">No assets found</div>;
    }

    const getOwnerName = (userId: string) => {
        return userId === "A" ? userAName : userBName;
    };

    return (
        <div className="space-y-4">
            {assets.map((asset) => (
                <div
                    key={asset.id}
                    style={{ background: asset.metal_type === "Gold" ? goldGradientBg : silverGradientBg }}
                    className={`relative overflow-hidden rounded-2xl p-6 border shadow-xl transition-all duration-300 hover:scale-[1.02] ${asset.metal_type === "Gold"
                            ? "border-amber-700/30 hover:border-amber-600/50"
                            : "border-zinc-600/30 hover:border-zinc-500/50"
                        }`}
                >
                    {/* Metallic shine effect */}
                    <div 
                        style={{ background: asset.metal_type === "Gold" ? goldShineBg : silverShineBg }}
                        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20"
                    ></div>

                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div 
                                    style={{ background: asset.metal_type === "Gold" ? goldIconBg : silverIconBg }}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${asset.metal_type === "Gold"
                                            ? "shadow-amber-500/30"
                                            : "shadow-zinc-500/30"
                                        }`}
                                >
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div 
                                        style={{ 
                                            background: asset.metal_type === "Gold" ? goldTextGradient : silverTextGradient,
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text"
                                        }}
                                        className="text-xl font-bold"
                                    >
                                        {asset.metal_type}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                        <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {getOwnerName(asset.user_id)}
                                        </span>
                                        <span>•</span>
                                        <span>Updated {format(new Date(asset.date), "MMM d, yyyy")}</span>
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
