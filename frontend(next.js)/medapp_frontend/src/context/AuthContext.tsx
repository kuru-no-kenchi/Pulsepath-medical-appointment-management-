"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

interface AuthState {
  token: string | null;
  role: string | null;
}

interface AuthContextType {
  auth: AuthState;
  login: (token: string, role: string) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    role: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (token && role) {
          setAuth({
            token,
            role,
          });
        } else {
          setAuth({
            token: null,
            role: null,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (token: string, role: string) => {
    queryClient.clear();
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setAuth({
      token,
      role,
    });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      queryClient.clear();
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setAuth({
        token: null,
        role: null,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        loading,
        isAuthenticated: !!auth.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
