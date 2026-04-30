/**
 * PHP JSON 문자열 필드를 배열로 통일. 사용처: `RecruitApplyPreview.tsx` 등 지원서 UI.
 */
export function coerceRecruitJsonArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v.trim()) {
    try {
      const p = JSON.parse(v) as unknown;
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * PHP에서 객체·배열을 JSON 문자열로 한 번 더 감싸 내려보낼 때 풀어 줍니다.
 * `{` `[` 로 시작하지 않는 문자열은 그대로 둡니다(일반 텍스트 오인 파싱 방지).
 */
export function unwrapRecruitJsonString(v: unknown): unknown {
  if (typeof v !== "string") return v;
  const s = v.trim();
  if (!s || (s[0] !== "{" && s[0] !== "[")) return v;
  try {
    return JSON.parse(s) as unknown;
  } catch {
    return v;
  }
}
