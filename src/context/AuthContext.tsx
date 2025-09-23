import { createContext, useContext, useState } from "react";

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

export const AuthProvider = ({ children }: any) => {
    const [token, setTokenState] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [userName, setUserName] = useState<string | null>(null);

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

    return (
        <AuthContext.Provider value={{ token, userId, userName, setToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
