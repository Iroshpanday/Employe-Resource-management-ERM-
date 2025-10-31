"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
  id: number;
  email: string;
  role: string;
  employeeId?: number;
  token: string;
} | null;

type AuthContextType = {
  user: User;
  login: (email: string, token: string, userData: { id: number; role: string; employeeId?: number }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const saved = localStorage.getItem("auth");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed);
    }
  }, []);

  const login = (email: string, token: string, userData: { id: number; role: string; employeeId?: number }) => {
    const userObj = { 
      id: userData.id, 
      email, 
      role: userData.role,
      employeeId: userData.employeeId, 

      token 
    };
    localStorage.setItem("auth", JSON.stringify(userObj));
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}