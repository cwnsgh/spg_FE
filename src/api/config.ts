/**
 * API 베이스 URL과 백엔드 정적 자산(origin) 설정입니다.
 *
 * **개발(`next dev`) — 프록시**
 * - 브라우저는 기본으로 **`/api/proxy/...`** 만 호출합니다(같은 `localhost` 출처 → CORS 없음).
 * - **`/api/proxy/auth/*` 외의 모든 API**(관리자 `admin/*`, `front/*` 등)도 동일하게 `toApiUrl` → **Next `rewrites`**만 타며,
 *   미들웨어는 **인증 응답의 `Set-Cookie` 보정**만 합니다. 대시보드 데이터 요청을 rewrite 밖으로 빼지 않습니다.
 * - 실제 PHP 호스트는 `next.config` rewrites가 `NEXT_PUBLIC_BACKEND_ORIGIN` 등으로 붙입니다.
 * - 프록시를 쓰려면 **`NEXT_PUBLIC_API_BASE_URL`을 절대 URL로 바꾸지 마세요.** (바꾸면 브라우저가 백엔드로 직접 가서 CORS·쿠키 이슈가 날 수 있음)
 * - 전달 대상만 스테이징으로 바꿀 때: `.env.local`에 `NEXT_PUBLIC_DEV_BACKEND_ORIGIN`(개발 전용) 또는 `NEXT_PUBLIC_BACKEND_ORIGIN`
 * - 인증만 순수 rewrite 로 두고 싶을 때: `NEXT_PUBLIC_DISABLE_AUTH_COOKIE_MIDDLEWARE=1` (`src/middleware.ts` 참고)
 *
 * **프로덕션(정적 export)**
 * - 기본 `https://spg.co.kr/api` (rewrites 없음)
 *
 * Vercel 등 **프론트와 백엔드 도메인이 다를 때** PDF·파일 `fetch`/iframe에서 CORS가 나면
 * `NEXT_PUBLIC_BACKEND_ASSET_PROXY_PREFIX=/__backend_asset` 를 설정하고,
 * 배포에 `vercel.json`의 `/__backend_asset` → 백엔드 origin 리라이트를 둡니다.
 * 그러면 자산 URL이 동일 출처가 되어 CORS를 피합니다.
 */
function trimTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, "");
}

const DEFAULT_API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "/api/proxy"
    : "https://spg.co.kr/api";

const DEFAULT_BACKEND_ORIGIN =
  trimTrailingSlashes(process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.trim() || "") ||
  (process.env.NODE_ENV === "development"
    ? trimTrailingSlashes(process.env.NEXT_PUBLIC_DEV_BACKEND_ORIGIN?.trim() || "")
    : "") ||
  "https://spg.co.kr";

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

  return DEFAULT_BACKEND_ORIGIN;
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
