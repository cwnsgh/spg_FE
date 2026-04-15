import { BACKEND_ASSET_PROXY_PREFIX, BACKEND_ORIGIN } from "@/api/config";

const DEFAULT_ASSET_PROXY = "/__backend_asset";

/**
 * 카페24 등에서 PDF에 `X-Frame-Options: sameorigin`이 있으면
 * 다른 도메인 페이지의 iframe에 직접 넣을 수 없습니다.
 *
 * - 개발: `next.config`의 `/__backend_asset/*` 리라이트
 * - Vercel 등: `NEXT_PUBLIC_BACKEND_ASSET_PROXY_PREFIX` + `vercel.json` 리라이트로 동일 출처
 */
export function devBackendAssetIframePath(pdfUrl: string): string | null {
  const proxyBase = BACKEND_ASSET_PROXY_PREFIX || DEFAULT_ASSET_PROXY;

  if (BACKEND_ASSET_PROXY_PREFIX && pdfUrl.startsWith(BACKEND_ASSET_PROXY_PREFIX)) {
    return pdfUrl;
  }
  if (!BACKEND_ASSET_PROXY_PREFIX && pdfUrl.startsWith(DEFAULT_ASSET_PROXY)) {
    return pdfUrl;
  }

  if (process.env.NODE_ENV !== "development" && !BACKEND_ASSET_PROXY_PREFIX) {
    return null;
  }

  try {
    const u = new URL(pdfUrl);
    if (u.origin === BACKEND_ORIGIN) {
      return `${proxyBase}${u.pathname}${u.search}`;
    }
  } catch {
    /* ignore */
  }
  return null;
}
