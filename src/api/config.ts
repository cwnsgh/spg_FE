// 개발 중에는 Next rewrite proxy를 기본값으로 사용합니다.
// 나중에 PHP 서버를 직접 호출할 때는 NEXT_PUBLIC_API_BASE_URL만 바꾸면 됩니다.
const DEFAULT_API_BASE_URL = "/api/proxy";

// 마지막 슬래시는 제거해서 아래에서 path를 붙일 때 //가 생기지 않게 합니다.
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

// 모든 API 파일이 공통으로 쓰는 URL 조합 함수입니다.
export function toApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
