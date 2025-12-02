import { NextResponse } from 'next/server';
import { getAccounts } from '@/actions/accounts';
import { getTransactions } from '@/actions/transactions';

export async function GET() {
    try {
        console.log('[TEST] Fetching accounts...');
        const accounts = await getAccounts();
        console.log('[TEST] Accounts fetched:', accounts.length);

        console.log('[TEST] Fetching transactions...');
        const transactions = await getTransactions();
        console.log('[TEST] Transactions fetched:', transactions.length);

        return NextResponse.json({
            success: true,
            data: {
                accounts: accounts.map(a => ({
                    id: a.id,
                    name: a.name,
                    balance: a.current_balance,
                    owner: a.user_id,
                    active: a.is_active
                })),
                transactions: transactions.slice(0, 5).map(t => ({
                    id: t.id,
                    type: t.type,
                    amount: t.amount,
                    category: t.category
                }))
            }
        });
    } catch (error) {
        console.error('[TEST] Error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
