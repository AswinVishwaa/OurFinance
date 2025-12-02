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
