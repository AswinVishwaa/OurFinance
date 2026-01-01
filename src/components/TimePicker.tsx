"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
    hour: string; // 01-12
    minute: string; // 00-59
    ampm: string; // AM|PM
    onChange: (hour: string, minute: string, ampm: string) => void;
}

export default function TimePicker({ hour, minute, ampm, onChange }: TimePickerProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    const setHour = (h: string) => onChange(h, minute, ampm);
    const setMinute = (m: string) => onChange(hour, m, ampm);
    const setAmPm = (ap: string) => onChange(hour, minute, ap);

    // Minute options in 5-min steps for compact UI
    const minuteOptions = Array.from({ length: 12 }).map((_, i) => String(i * 5).padStart(2, "0"));

    return (
        <div className="relative inline-block" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                className={cn(
                    "w-full text-left bg-zinc-800 text-white p-3 rounded-xl focus:outline-none focus:ring-2",
                    "focus:ring-zinc-600"
                )}
            >
                <div className="flex items-center justify-between">
                    <div className="font-medium">{`${hour}:${minute} ${ampm}`}</div>
                    <div className="text-xs text-zinc-400">Set time</div>
                </div>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4 z-40">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="text-xs text-zinc-400">Hour</div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setAmPm("AM")}
                                className={cn(
                                    "px-3 py-1 rounded-xl text-xs",
                                    ampm === "AM" ? "bg-zinc-700 text-white" : "bg-zinc-800 text-zinc-300"
                                )}
                            >
                                AM
                            </button>
                            <button
                                type="button"
                                onClick={() => setAmPm("PM")}
                                className={cn(
                                    "px-3 py-1 rounded-xl text-xs",
                                    ampm === "PM" ? "bg-zinc-700 text-white" : "bg-zinc-800 text-zinc-300"
                                )}
                            >
                                PM
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-3">
                        {Array.from({ length: 12 }).map((_, i) => {
                            const v = String(i + 1).padStart(2, "0");
                            const selected = v === hour;
                            return (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setHour(v)}
                                    className={cn(
                                        "py-2 rounded-lg text-sm",
                                        selected ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                    )}
                                >
                                    {v}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mb-3">
                        <div className="text-xs text-zinc-400 mb-2">Minute</div>
                        <div className="grid grid-cols-6 gap-2">
                            {minuteOptions.map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setMinute(m)}
                                    className={cn(
                                        "py-2 rounded-lg text-sm",
                                        m === minute ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                    )}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="px-4 py-2 rounded-xl bg-zinc-800 text-sm text-zinc-200 hover:bg-zinc-700"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
