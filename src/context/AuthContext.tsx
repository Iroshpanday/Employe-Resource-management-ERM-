// context/AuthContext.tsx - Update the logout function
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
  loading: boolean;
  login: (email: string, token: string, userData: { id: number; role: string; employeeId?: number }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const saved = localStorage.getItem("auth");
        if (saved) {
          const parsed = JSON.parse(saved);
          setUser(parsed);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        localStorage.removeItem("auth");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
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
    // Clear all auth-related data
    localStorage.removeItem("auth");
    
    // Clear any other related storage if needed
    sessionStorage.removeItem("auth");
    
    // Reset state
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}