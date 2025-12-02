import { getSettings } from "@/actions/settings";
import { getAccounts } from "@/actions/accounts";
import { EditNameForm } from "./_components/EditNameForm";
import { AccountList } from "./_components/AccountList";
import { CreateAccountForm } from "./_components/CreateAccountForm";
import { ExportReportButton } from "./_components/ExportReportButton";
import { BottomNav } from "@/components/BottomNav";

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;


export default async function ProfilePage() {
    const settings = await getSettings();
    const accounts = await getAccounts();

    const userAName = settings.find((s) => s.key === "user_a_name")?.value || "User A";
    const userBName = settings.find((s) => s.key === "user_b_name")?.value || "User B";

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black pb-24 text-zinc-100 font-sans">
            <div className="p-6 space-y-8 max-w-4xl mx-auto">
                <header>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Profile & Settings
                    </h1>
                    <p className="text-zinc-400">Manage your account preferences and export reports</p>
                </header>

                {/* User Names Section */}
                <section className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">👤</span>
                        </div>
                        <h2 className="text-xl font-semibold text-white">User Names</h2>
                    </div>
                    <div className="space-y-4">
                        <EditNameForm label="User A Display Name" settingKey="user_a_name" initialValue={userAName} />
                        <EditNameForm label="User B Display Name" settingKey="user_b_name" initialValue={userBName} />
                    </div>
                </section>

                {/* Accounts Section */}
                <section className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">💳</span>
                        </div>
                        <h2 className="text-xl font-semibold text-white">Accounts</h2>
                    </div>

                    <AccountList accounts={accounts} />
                    <CreateAccountForm />
                </section>

                {/* Reports Section */}
                <section className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">📊</span>
                        </div>
                        <h2 className="text-xl font-semibold text-white">Export Reports</h2>
                    </div>
                    <ExportReportButton />
                </section>
            </div>

            <BottomNav />
        </div>
    );
}
