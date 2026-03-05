import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api.js';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        authApi.session()
            .then(({ user }) => setUser(user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);
    const login = useCallback(async (login, password) => {
        const { user } = await authApi.login(login, password);
        setUser(user);
    }, []);
    const logout = useCallback(async () => {
        await authApi.logout();
        setUser(null);
    }, []);
    return _jsx(AuthContext.Provider, { value: { user, loading, login, logout }, children: children });
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
