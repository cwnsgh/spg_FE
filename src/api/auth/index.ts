import { ApiError } from "../client";
import { toApiUrl } from "../config";
import {
  AuthErrorResponse,
  LoginPayload,
  LoginResponse,
  LogoutResponse,
  MeResponse,
} from "./types";

type AuthSuccessResponse = LoginResponse | LogoutResponse | MeResponse;
type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

async function authRequest<T extends AuthSuccessResponse>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(toApiUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });

  const json = (await response.json()) as AuthResponse;

  if (!response.ok || json.ok === false) {
    const message = "error" in json ? json.error : "인증 요청 중 오류가 발생했습니다.";
    throw new ApiError(message, response.status);
  }

  return json as T;
}

export async function login(payload: LoginPayload) {
  const response = await authRequest<LoginResponse>("/auth/login.php", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function getMe() {
  return authRequest<MeResponse>("/auth/me.php", {
    method: "GET",
  });
}

export async function logout() {
  return authRequest<LogoutResponse>("/auth/logout.php", {
    method: "POST",
  });
}

export type { AuthUser, LoginPayload, LoginResponse, LogoutResponse, MeResponse } from "./types";
