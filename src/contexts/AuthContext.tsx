"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMe, isUserAdmin, login as loginRequest, logout as logoutRequest } from "@/api";
import { mergeAuthUserPreferStronger } from "@/api/auth/normalizeAuthUser";
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
        const loginUser = await loginRequest(payload);
        let nextUser = await refresh();
        /**
         * `login.php` 직후 첫 `me.php`가 쿠키를 못 읽으면 `is_logged_in: false`로 올 수 있음
         * (SameSite·도메인·프록시 타이밍 등). 그때 `user`만 비면 어드민 폼이 `logout()`을
         * 호출해 방금 만든 세션까지 지워 버리므로, 로그인 응답 본문이 있으면 그걸로 복구합니다.
         */
        if (nextUser == null && loginUser != null) {
          debugLog("login:me_empty_using_login_payload", loginUser);
          setUser(loginUser);
          nextUser = loginUser;
        } else if (nextUser != null && loginUser != null) {
          const merged = mergeAuthUserPreferStronger(nextUser, loginUser);
          debugLog("login:after_refresh_merge", { nextUser, loginUser, merged });
          setUser(merged);
          nextUser = merged;
        }
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
      isAdmin: isUserAdmin(user),
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
