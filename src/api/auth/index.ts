/**
 * 그누보드 세션 기반 인증 API입니다.
 * `credentials: "include"`로 쿠키를 포함하므로, 프록시와 동일 출처일 때만 세션이 유지됩니다.
 * 백엔드: `auth/login.php`, `auth/me.php`, `auth/logout.php`
 */
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

/** 인증 전용 fetch. 실패 시 `ApiError`, 성공 시 본문 JSON을 그대로 반환합니다. */
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

/** 로그인 성공 시 `data`에 회원 정보가 옵니다. */
export async function login(payload: LoginPayload) {
  const response = await authRequest<LoginResponse>("/auth/login.php", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

/** 현재 세션의 로그인 여부와 회원 정보를 조회합니다. */
export async function getMe() {
  return authRequest<MeResponse>("/auth/me.php", {
    method: "GET",
  });
}

/** 세션을 종료합니다. */
export async function logout() {
  return authRequest<LogoutResponse>("/auth/logout.php", {
    method: "POST",
  });
}

export type { AuthUser, LoginPayload, LoginResponse, LogoutResponse, MeResponse } from "./types";
