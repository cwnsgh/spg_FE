import { BACKEND_ASSET_PROXY_PREFIX, BACKEND_ORIGIN } from "@/api/config";

const DEFAULT_ASSET_PROXY = "/__backend_asset";

/**
 * 백엔드 정적 파일 URL을 동일 출처 프록시 경로로 바꿀 수 있으면 그 URL을, 아니면 `null`.
 * (개발 `next` 리라이트 / 배포 시 `NEXT_PUBLIC_BACKEND_ASSET_PROXY_PREFIX`·nginx·vercel 리라이트 전제)
 */
function resolveBackendAssetProxyUrl(assetUrl: string): string | null {
  const proxyBase = BACKEND_ASSET_PROXY_PREFIX || DEFAULT_ASSET_PROXY;

  if (
    BACKEND_ASSET_PROXY_PREFIX &&
    assetUrl.startsWith(BACKEND_ASSET_PROXY_PREFIX)
  ) {
    return assetUrl;
  }
  if (!BACKEND_ASSET_PROXY_PREFIX && assetUrl.startsWith(DEFAULT_ASSET_PROXY)) {
    return assetUrl;
  }

  if (process.env.NODE_ENV !== "development" && !BACKEND_ASSET_PROXY_PREFIX) {
    return null;
  }

  try {
    const u = new URL(assetUrl);
    if (u.origin === BACKEND_ORIGIN) {
      return `${proxyBase}${u.pathname}${u.search}`;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * 카페24 등에서 PDF에 `X-Frame-Options: sameorigin`이 있으면
 * 다른 도메인 페이지의 iframe에 직접 넣을 수 없습니다.
 *
 * - 개발: `next.config`의 `/__backend_asset/*` 리라이트
 * - Vercel 등: `NEXT_PUBLIC_BACKEND_ASSET_PROXY_PREFIX` + `vercel.json` 리라이트로 동일 출처
 */
export function devBackendAssetIframePath(pdfUrl: string): string | null {
  return resolveBackendAssetProxyUrl(pdfUrl);
}

/**
 * `fetch` → blob 저장 시 CORS 회피용. 프록시를 쓸 수 없으면 원본 URL 그대로(크로스 오리진 fetch는 실패할 수 있음).
 */
export function toSameOriginAssetUrlForFetch(assetUrl: string): string {
  return resolveBackendAssetProxyUrl(assetUrl) ?? assetUrl;
}
