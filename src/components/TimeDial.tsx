"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TimeDialProps {
    hour: string; // 01-12
    minute: string; // 00-59
    ampm: string; // AM|PM
    onChange: (hour: string, minute: string, ampm: string) => void;
}

function polarToHourMinute(cx: number, cy: number, x: number, y: number, mode: "hour" | "minute") {
    const dx = x - cx;
    const dy = y - cy;
    const angle = Math.atan2(dy, dx); // -PI to PI
    // Convert to degrees 0..360 with 0 at top (12 o'clock)
    let deg = (angle * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;

    if (mode === "hour") {
        // 12 sectors
        const sector = Math.round(deg / 30) % 12; // 0..11
        const hour = sector === 0 ? 12 : sector; // map 0->12,1->1..11
        return { h: String(hour).padStart(2, "0"), m: undefined } as any;
    } else {
        // minute: 60 sectors
        const sector = Math.round(deg / 6) % 60; // 0..59
        return { h: undefined, m: String(sector).padStart(2, "0") } as any;
    }
}

export default function TimeDial({ hour, minute, ampm, onChange }: TimeDialProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [mode, setMode] = useState<"hour" | "minute">("hour");
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        function onMove(e: MouseEvent | TouchEvent) {
            if (!dragging || !ref.current) return;
            e.preventDefault();
            const rect = ref.current.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            let clientX = 0;
            let clientY = 0;
            if (e instanceof TouchEvent) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            const res = polarToHourMinute(cx, cy, clientX, clientY, mode);
            if (mode === "hour" && res.h) {
                onChange(res.h, minute, ampm);
            } else if (mode === "minute" && res.m) {
                onChange(hour, res.m, ampm);
            }
        }

        function onUp() {
            setDragging(false);
        }

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        document.addEventListener("touchmove", onMove, { passive: false });
        document.addEventListener("touchend", onUp);
        return () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            document.removeEventListener("touchmove", onMove);
            document.removeEventListener("touchend", onUp);
        };
    }, [dragging, mode, hour, minute, ampm, onChange]);

    const handlePointerDown = (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        setMode("hour");
    };

    // When user taps clock, toggle between hour/minute selection
    const handleClick = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const clientX = e.clientX;
        const clientY = e.clientY;
        const res = polarToHourMinute(cx, cy, clientX, clientY, mode);
        if (mode === "hour" && res.h) {
            onChange(res.h, minute, ampm);
            setMode("minute");
        } else if (mode === "minute" && res.m) {
            onChange(hour, res.m, ampm);
            setMode("hour");
        }
    };

    const hourValue = Number(hour);
    const minuteValue = Number(minute);

    // Compute needle angles
    const hourAngle = ((hourValue % 12) / 12) * 360 + (minuteValue / 60) * 30; // hour hand moves with minutes
    const minuteAngle = (minuteValue / 60) * 360;

    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-zinc-400">Time</div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => onChange(hour, minute, ampm === "AM" ? "PM" : "AM")}
                        className="px-3 py-1 rounded-xl bg-zinc-800 text-xs"
                    >
                        {ampm}
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode(mode === "hour" ? "minute" : "hour")}
                        className="px-3 py-1 rounded-xl bg-zinc-800 text-xs"
                    >
                        {mode === "hour" ? "Hour" : "Minute"}
                    </button>
                </div>
            </div>

            <div
                ref={ref}
                onPointerDown={handlePointerDown}
                onClick={handleClick}
                className="w-56 h-56 mx-auto rounded-full bg-zinc-900 border border-zinc-700 relative touch-none overflow-hidden"
            >
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="text-xl font-bold text-white">{`${hour}:${minute}`}</div>
                </div>

                {/* Hour and minute markers */}
                <div className="absolute inset-0">
                    {Array.from({ length: mode === "hour" ? 12 : 60 }).map((_, i) => {
                        const index = i + 1;
                        const angle = mode === "hour" ? (i * 30) : (i * 6);
                        const rad = (angle - 90) * (Math.PI / 180);
                        // w-56 = 224px, so radius is 112px
                        const radius = mode === "hour" ? 80 : 90; // position markers closer for hour, edge for minute
                        const x = 112 + radius * Math.cos(rad);
                        const y = 112 + radius * Math.sin(rad);
                        const label = mode === "hour" ? (index === 12 ? 12 : index) : (i % 5 === 0 ? String(i).padStart(2, "0") : "");
                        const isActive = mode === "hour" ? Number(hour) === (index === 12 ? 12 : index) : Number(minute) === i;
                        
                        // Only show every 5th minute marker to avoid clutter
                        if (mode === "minute" && i % 5 !== 0) return null;
                        
                        return (
                            <div
                                key={i}
                                style={{ left: `${x}px`, top: `${y}px`, position: "absolute", transform: "translate(-50%, -50%)" }}
                                className={cn(
                                    "text-xs w-7 h-7 rounded-full flex items-center justify-center font-medium",
                                    isActive ? "bg-red-600 text-white" : "text-zinc-400"
                                )}
                            >
                                {label}
                            </div>
                        );
                    })}
                </div>

                {/* Hour hand */}
                <div className="absolute left-1/2 top-1/2 origin-center pointer-events-none" style={{ transform: `translate(-50%, -50%) rotate(${hourAngle}deg)` }}>
                    <div className="h-16 w-1 bg-zinc-300 rounded-full" style={{ marginTop: '-64px' }} />
                </div>

                {/* Minute hand */}
                <div className="absolute left-1/2 top-1/2 origin-center pointer-events-none" style={{ transform: `translate(-50%, -50%) rotate(${minuteAngle}deg)` }}>
                    <div className="h-20 w-0.5 bg-red-500 rounded-full" style={{ marginTop: '-80px' }} />
                </div>

                {/* Center dot */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full pointer-events-none z-20" />

            </div>
        </div>
    );
}
