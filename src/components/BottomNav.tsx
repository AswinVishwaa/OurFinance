"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, User, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home", icon: Home },
        { href: "/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/assets", label: "Assets", icon: Wallet },
        { href: "/profile", label: "Profile", icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-800 pb-safe">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                isActive ? "text-red-500" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
