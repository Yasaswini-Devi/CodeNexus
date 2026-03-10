import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const API = 'http://localhost:5001/api/auth';

export function AuthProvider({ children }) {
    // Token lives in memory only — clears on every page load/refresh
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const loading = false; // No async startup needed — always start logged out

    const register = useCallback(async (username, email, password) => {
        const res = await fetch(`${API}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
