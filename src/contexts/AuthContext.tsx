"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMe, login as loginRequest, logout as logoutRequest } from "@/api";
import { ApiError } from "@/api";
import type { ReactNode } from "react";
import type { AuthUser, LoginPayload } from "@/api";

interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const debugLog = (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[AuthContext]", ...args);
    }
  };

  const refresh = useCallback(async () => {
    try {
      debugLog("refresh:start");
      const response = await getMe();
      const nextUser = response.is_logged_in ? response.data : null;

      debugLog("refresh:response", response);
      debugLog("refresh:user", nextUser);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      debugLog("refresh:error", error);
      setUser(null);

      if (error instanceof ApiError && error.status === 401) {
        return null;
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsLoading(true);

      try {
        debugLog("login:start", { mb_id: payload.mb_id });
        await loginRequest(payload);
        const nextUser = await refresh();
        debugLog("login:success", nextUser);
        return nextUser;
      } finally {
        setIsLoading(false);
      }
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      debugLog("logout:start");
      await logoutRequest();
      setUser(null);
      debugLog("logout:success");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      isAdmin: Boolean(user?.is_admin),
      isLoading,
      login,
      logout,
      refresh,
    }),
    [isLoading, login, logout, refresh, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
