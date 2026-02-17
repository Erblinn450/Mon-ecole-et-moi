"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { User, LoginRequest, Role } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === Role.ADMIN;

  // Charger l'utilisateur depuis le localStorage et vérifier le token
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.getProfile();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialisation
  useEffect(() => {
    // D'abord essayer de charger depuis le localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Ignorer les erreurs de parsing
      }
    }
    // Puis vérifier avec le serveur
    refreshUser();
  }, [refreshUser]);

  // Login
  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      localStorage.setItem("auth_token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);

      // Redirection selon le rôle
      if (response.user.role === Role.ADMIN) {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Logout
  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("admin_token");
    sessionStorage.clear();
    router.push("/connexion");
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    refreshUser,
  };
}

export { AuthContext };

