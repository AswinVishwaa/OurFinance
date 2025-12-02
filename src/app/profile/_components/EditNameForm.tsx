"use client";

import { updateUserName } from "@/actions/settings";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function EditNameForm({
    label,
    settingKey,
    initialValue,
}: {
    label: string;
    settingKey: "user_a_name" | "user_b_name";
    initialValue: string;
}) {
    const [name, setName] = useState(initialValue);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserName(settingKey, name);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400">{label}</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white flex-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Save"}
                </button>
            </div>
        </form>
    );
}
