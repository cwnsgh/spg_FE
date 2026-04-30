/**
 * 로컬 `next dev`에서 `/api/proxy/auth/*` 를 백엔드로 넘길 때 Set-Cookie 보정(Domain·Secure 등).
 * 사용처: `src/middleware.ts` — 인증 응답 헤더만 가공.
 * `next.config.ts` 의 rewrite 목적지(`backendApiOrigin`)와 동일 규칙을 유지해야 세션이 어긋나지 않음.
 */

function trimTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, "");
}

/** next.config `fallbackBackendOrigin` 과 동일 */
function fallbackBackendOriginFromEnv(): string {
  const isDev = process.env.NODE_ENV !== "production";
  return trimTrailingSlashes(
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.trim() ||
      (isDev ? process.env.NEXT_PUBLIC_DEV_BACKEND_ORIGIN?.trim() : "") ||
      "https://spg.co.kr"
  );
}

/** next.config `backendApiOrigin` 과 동일 */
export function resolveUpstreamBackendOrigin(): string {
  const apiBaseEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";
  if (/^https?:\/\//i.test(apiBaseEnv)) {
    return trimTrailingSlashes(apiBaseEnv.replace(/\/api\/?$/, ""));
  }
  return fallbackBackendOriginFromEnv();
}

export function isLocalDevRequestHost(hostHeader: string | null): boolean {
  if (!hostHeader) return false;
  const host = hostHeader.split(":")[0]?.toLowerCase() ?? "";
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    host.endsWith(".localhost")
  ) {
    return true;
  }
  if (/^192\.168\./.test(host)) return true;
  if (/^10\./.test(host)) return true;
  const m = /^172\.(\d+)\./.exec(host);
  if (m) {
    const n = Number(m[1]);
    if (n >= 16 && n <= 31) return true;
  }
  return false;
}

/** 브라우저가 localhost 에 저장할 수 있도록 Domain 제거, http 로컬에 맞게 Secure 정리 */
export function rewriteSetCookieForLocalhostDev(raw: string): string {
  let line = raw.replace(/;\s*Domain=[^;]*/gi, "");
  line = line.replace(/;\s*Secure\b/gi, "");
  if (/;\s*SameSite=None/i.test(line)) {
    line = line.replace(/;\s*SameSite=None/gi, "; SameSite=Lax");
  }
  return line.trim();
}

export function isHopByHopHeader(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n === "connection" ||
    n === "keep-alive" ||
    n === "proxy-authenticate" ||
    n === "proxy-authorization" ||
    n === "te" ||
    n === "trailers" ||
    n === "transfer-encoding" ||
    n === "upgrade" ||
    n === "host"
  );
}
