"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface User {
    id: string;
    email: string;
    subscription?: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    refreshAuth: () => Promise<void>;
    logout: () => void; // Phase F doesn't explicitly need logout, but good to have
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    refreshAuth: async () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshAuth = async () => {
        try {
            const data = await apiClient('/me');
            setUser(data);
        } catch (e) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Handle Session Token Handoff
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const token = params.get('session_token');
            if (token) {
                console.log("Detected session_token, setting cookie...");
                const isProd = window.location.hostname !== 'localhost';
                const domain = isProd ? `domain=.signalengines.com;` : '';
                const secure = isProd ? 'secure;' : '';

                document.cookie = `signal_session=${token}; path=/; ${domain} ${secure} max-age=2592000; samesite=${isProd ? 'none' : 'lax'}`;

                // Clean URL
                window.history.replaceState({}, '', window.location.pathname);

                // Reload to ensure cookie is picked up
                window.location.reload();
                return;
            }
        }
        refreshAuth();
    }, []);

    const logout = () => {
        // Clear cookie call? implementation pending
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, refreshAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
