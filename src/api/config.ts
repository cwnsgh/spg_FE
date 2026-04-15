/**
 * API 베이스 URL과 백엔드 정적 자산(origin) 설정입니다.
 * - `NEXT_PUBLIC_API_BASE_URL`이 있으면 최우선.
 * - 개발(`NODE_ENV === "development"`): 기본 `/api/proxy` + next.config rewrites.
 * - 프로덕션 빌드(정적 export): 기본 백엔드 절대 URL.
 *
 * Vercel 등 **프론트와 백엔드 도메인이 다를 때** PDF·파일 `fetch`/iframe에서 CORS가 나면
 * `NEXT_PUBLIC_BACKEND_ASSET_PROXY_PREFIX=/__backend_asset` 를 설정하고,
 * 배포에 `vercel.json`의 `/__backend_asset` → 백엔드 origin 리라이트를 둡니다.
 * 그러면 자산 URL이 동일 출처가 되어 CORS를 피합니다.
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

/** 예: `/__backend_asset` — 설정 시 `toBackendAssetUrl`이 백엔드 대신 이 경로(동일 출처)로 만듦 */
export const BACKEND_ASSET_PROXY_PREFIX = (
  process.env.NEXT_PUBLIC_BACKEND_ASSET_PROXY_PREFIX ?? ""
).replace(/\/+$/, "");

/** 상대 path를 `API_BASE_URL`과 이어 전체 요청 URL을 만듭니다. */
export function toApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * `/data/...` 같은 백엔드 기준 경로를 브라우저용 URL로 만듭니다.
 * `NEXT_PUBLIC_BACKEND_ASSET_PROXY_PREFIX`가 있으면 그 접두로 **같은 사이트** 주소를 쓰고,
 * Vercel 리라이트로 실제 파일은 카페24에서 받습니다(CORS 회피).
 */
export function toBackendAssetUrl(path: string): string {
  if (!path) return "#";

  if (/^https?:\/\//.test(path)) {
    if (BACKEND_ASSET_PROXY_PREFIX) {
      try {
        const u = new URL(path);
        if (u.origin === BACKEND_ORIGIN) {
          return `${BACKEND_ASSET_PROXY_PREFIX}${u.pathname}${u.search}`;
        }
      } catch {
        /* ignore */
      }
    }
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (BACKEND_ASSET_PROXY_PREFIX) {
    return `${BACKEND_ASSET_PROXY_PREFIX}${normalizedPath}`;
  }
  return `${BACKEND_ORIGIN}${normalizedPath}`;
}
