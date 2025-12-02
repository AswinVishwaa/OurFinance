"use client";

import { useUser } from "@/context/UserContext";
import { Sparkles } from "lucide-react";
import { useState } from "react";

interface UserToggleProps {
    userAName: string;
    userBName: string;
}

export function UserToggle({ userAName, userBName }: UserToggleProps) {
    const { viewMode, setViewMode } = useUser();
    const [isAnimating, setIsAnimating] = useState(false);

    const cycleViewMode = () => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);

        if (viewMode === "A") {
            setViewMode("B");
        } else if (viewMode === "B") {
            setViewMode("Combined");
        } else {
            setViewMode("A");
        }
    };

    const getDisplayInfo = () => {
        if (viewMode === "A") {
            return {
                label: userAName,
                gradient: "from-red-500 to-pink-500",
                shadow: "shadow-red-500/30",
                icon: "👤",
            };
        } else if (viewMode === "B") {
            return {
                label: userBName,
                gradient: "from-purple-500 to-indigo-500",
                shadow: "shadow-purple-500/30",
                icon: "👤",
            };
        } else {
            return {
                label: "Both",
                gradient: "from-emerald-500 to-teal-500",
                shadow: "shadow-emerald-500/30",
                icon: "👥",
            };
        }
    };

    const info = getDisplayInfo();

    return (
        <button
            onClick={cycleViewMode}
            className={`relative overflow-hidden bg-gradient-to-r ${info.gradient} rounded-full px-5 py-2.5 shadow-lg ${info.shadow} transition-all duration-300 hover:scale-105 active:scale-95 group`}
        >
            {/* Sparkle animation */}
            {isAnimating && (
                <>
                    <Sparkles className="absolute top-1 left-2 w-4 h-4 text-white animate-ping" />
                    <Sparkles className="absolute bottom-1 right-2 w-3 h-3 text-white animate-ping" style={{ animationDelay: '150ms' }} />
                    <Sparkles className="absolute top-2 right-4 w-3 h-3 text-white animate-ping" style={{ animationDelay: '300ms' }} />
                </>
            )}

            {/* Content */}
            <div className="relative flex items-center gap-2">
                <span className="text-lg">{info.icon}</span>
                <span className="text-white font-semibold text-sm">{info.label}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse"></div>
            </div>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        </button>
    );
}
