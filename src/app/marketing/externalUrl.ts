/**
 * 가맹점 등 외부 링크 문자열에 프로토콜 보강(https:, mailto: 등 유지).
 * 사용처: `DomesticFacilities.tsx`, `OverseasFacilities.tsx`.
 */
export function normalizeExternalUrl(url?: string | null) {
  const trimmedUrl = url?.trim() ?? "";

  if (!trimmedUrl) {
    return "";
  }

  if (/^(https?:)?\/\//i.test(trimmedUrl) || /^(mailto|tel):/i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
}
