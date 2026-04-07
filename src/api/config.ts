/**
 * API 베이스 URL과 백엔드 정적 자산(origin) 설정입니다.
 * - `NEXT_PUBLIC_API_BASE_URL`이 있으면 최우선.
 * - 개발(`NODE_ENV === "development"`): 기본 `/api/proxy` + next.config rewrites.
 * - 프로덕션 빌드(정적 export): 기본 백엔드 절대 URL.
 */
const DEFAULT_API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "/api/proxy"
    : "https://dustinsub.mycafe24.com/api";
const DEFAULT_BACKEND_ORIGIN = "https://dustinsub.mycafe24.com";

// 마지막 슬래시는 제거해서 아래에서 path를 붙일 때 //가 생기지 않게 합니다.
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

export const BACKEND_ORIGIN = (() => {
  if (/^https?:\/\//.test(API_BASE_URL)) {
    try {
      return new URL(API_BASE_URL).origin;
    } catch {
      return DEFAULT_BACKEND_ORIGIN;
    }
  }

  return (process.env.NEXT_PUBLIC_BACKEND_ORIGIN || DEFAULT_BACKEND_ORIGIN).replace(
    /\/+$/,
    ""
  );
})();

/** 상대 path를 `API_BASE_URL`과 이어 전체 요청 URL을 만듭니다. */
export function toApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

/** `/data/...` 같은 백엔드 호스트 기준 경로를 절대 URL로 만듭니다. */
export function toBackendAssetUrl(path: string): string {
  if (!path) return "#";
  if (/^https?:\/\//.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_ORIGIN}${normalizedPath}`;
}
