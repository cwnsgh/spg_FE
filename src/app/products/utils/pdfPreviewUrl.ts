import { BACKEND_ORIGIN } from "@/api/config";

/**
 * 카페24 등에서 PDF에 `X-Frame-Options: sameorigin`이 있으면
 * 다른 도메인 페이지의 iframe에 직접 넣을 수 없습니다.
 *
 * 개발 모드에서는 `next.config`의 `/__backend_asset/*` 리라이트로
 * iframe `src`를 프런트와 동일 출처로 두면 미리보기가 됩니다.
 */
export function devBackendAssetIframePath(absoluteUrl: string): string | null {
  if (process.env.NODE_ENV !== "development") return null;
  try {
    const u = new URL(absoluteUrl);
    if (u.origin === BACKEND_ORIGIN) {
      return `/__backend_asset${u.pathname}${u.search}`;
    }
  } catch {
    /* ignore */
  }
  return null;
}
