import { getAssets } from "@/actions/assets";
import { getSettings } from "@/actions/settings";
import { BottomNav } from "@/components/BottomNav";
import { AddAssetForm } from "./_components/AddAssetForm";
import { AssetList } from "./_components/AssetList";

export default async function AssetsPage() {
    const assets = await getAssets();
    const settings = await getSettings();

    const userAName = settings.find((s) => s.key === "user_a_name")?.value || "User A";
    const userBName = settings.find((s) => s.key === "user_b_name")?.value || "User B";

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black pb-24 text-zinc-100 font-sans">
            <div className="p-6 space-y-8 max-w-4xl mx-auto">
                <header>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent mb-1">
                        Precious Metals
                    </h1>
                    <p className="text-zinc-400">Track your Gold & Silver investments</p>
                </header>

                <section className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <h2 className="text-xl font-semibold text-white">Your Portfolio</h2>
                    </div>

                    <AssetList assets={assets} />
                    <AddAssetForm userAName={userAName} userBName={userBName} />
                </section>
            </div>

            <BottomNav />
        </div>
    );
}
