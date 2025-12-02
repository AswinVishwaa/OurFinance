"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type ViewMode = "A" | "B" | "Combined";

interface UserContextType {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [viewMode, setViewMode] = useState<ViewMode>("A");

    return (
        <UserContext.Provider value={{ viewMode, setViewMode }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
