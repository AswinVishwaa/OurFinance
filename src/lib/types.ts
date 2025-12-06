export type UserID = "A" | "B";
export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction {
    id: string;
    date: string;
    type: TransactionType;
    amount: number;
    category: string;
    account_id: string;
    to_account_id?: string;
    user_id: UserID;
    description: string;
    tax_amount?: number;
    is_debt?: boolean; // For tracking borrowed money
    debt_id?: string; // Links to the original debt transaction
}

export interface Account {
    id: string;
    name: string;
    type: string;
    current_balance: number;
    user_id: UserID | "Shared";
    is_active: boolean;
}

export interface Asset {
    id: string;
    date: string;
    metal_type: "Gold" | "Silver";
    grams: number;
    total_cash_paid: number;
    tax_deducted: number;
    invested_value: number;
    user_id: UserID;
}

export interface Setting {
    key: string;
    value: string;
}

// Debt tracking - calculated from transactions
export interface DebtSummary {
    id: string; // Original transaction ID
    date: string;
    description: string;
    original_amount: number;
    paid_amount: number;
    remaining_amount: number;
    user_id: UserID;
    is_cleared: boolean;
}
