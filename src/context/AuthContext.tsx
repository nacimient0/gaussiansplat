// @ts-nocheck

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
    token: string | null;
    userId: number | null;
    userName: string | null;
    setToken: (token: string, userId: number, userName: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    userId: null,
    userName: null,
    setToken: () => { },
    logout: () => { },
});

interface Props {
    children: ReactNode;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setTokenState] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // ← nouvel état

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUserId = localStorage.getItem("userId");
        const storedUserName = localStorage.getItem("userName");

        if (storedToken && storedUserId && storedUserName) {
            setTokenState(storedToken);
            setUserId(Number(storedUserId));
            setUserName(storedUserName);
        }
        setLoading(false); // ← on a fini de récupérer le token
    }, []);

    const setToken = (token: string, userId: number, userName: string) => {
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId.toString());
        localStorage.setItem("userName", userName);
        setTokenState(token);
        setUserId(userId);
        setUserName(userName);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        setTokenState(null);
        setUserId(null);
        setUserName(null);
    };

    if (loading) return null; 

    return (
        <AuthContext.Provider value={{ token, userId, userName, setToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);
