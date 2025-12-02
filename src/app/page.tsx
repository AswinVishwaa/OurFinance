import { getAccounts } from "@/actions/accounts";
import { getTransactions } from "@/actions/transactions";
import { getAssets } from "@/actions/assets";
import { getSettings } from "@/actions/settings";
import { UserToggle } from "@/components/UserToggle";
import { DashboardView } from "@/components/DashboardView";
import { BottomNav } from "@/components/BottomNav";

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
    const accounts = await getAccounts();
    const assets = await getAssets();
    const transactions = await getTransactions();
    const settings = await getSettings();

    const userAName = settings.find((s) => s.key === "user_a_name")?.value || "User A";
    const userBName = settings.find((s) => s.key === "user_b_name")?.value || "User B";

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black pb-24 text-zinc-100 font-sans">
            <div className="p-6 space-y-6 max-w-6xl mx-auto">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                            OurFinance
                        </h1>
                        <p className="text-zinc-400 text-sm">Track your wealth together</p>
                    </div>
                    <UserToggle userAName={userAName} userBName={userBName} />
                </header>

                <DashboardView
                    accounts={accounts}
                    assets={assets}
                    transactions={transactions}
                />
            </div>

            <BottomNav />
        </div>
    );
}
