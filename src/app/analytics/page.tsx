import { getAccounts } from "@/actions/accounts";
import { getTransactions } from "@/actions/transactions";
import { getSettings } from "@/actions/settings";
import { BottomNav } from "@/components/BottomNav";
import { UserToggle } from "@/components/UserToggle";
import { AnalyticsView } from "./_components/AnalyticsView";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AnalyticsPage() {
    const accounts = await getAccounts();
    const transactions = await getTransactions();
    const settings = await getSettings();

    const userAName = settings.find((s) => s.key === "user_a_name")?.value || "User A";
    const userBName = settings.find((s) => s.key === "user_b_name")?.value || "User B";

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black pb-24 text-zinc-100 font-sans">
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                            Analytics
                        </h1>
                        <p className="text-zinc-400">Deep insights into your finances</p>
                    </div>
                    <UserToggle userAName={userAName} userBName={userBName} />
                </header>

                <AnalyticsView 
                    accounts={accounts}
                    transactions={transactions}
                    userAName={userAName}
                    userBName={userBName}
                />
            </div>

            <BottomNav />
        </div>
    );
}
