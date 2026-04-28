/** 백엔드 `auth.php` / `apply.php` 와 동일: 6~12자 (문자 종류 제한 없음) */
export const RECRUIT_PASSWORD_MIN = 6;
export const RECRUIT_PASSWORD_MAX = 12;

export const RECRUIT_PASSWORD_HINT = `${RECRUIT_PASSWORD_MIN}~${RECRUIT_PASSWORD_MAX}자`;

export function isValidRecruitPassword(pwd: string): boolean {
  const len = pwd.length;
  return len >= RECRUIT_PASSWORD_MIN && len <= RECRUIT_PASSWORD_MAX;
}

/** DB/레거시 값을 `<input type="date">`용 `YYYY-MM-DD`로 정규화 */
export function toDateInputValue(raw: string): string {
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  const m = /^(\d{4})[./](\d{1,2})[./](\d{1,2})$/.exec(s);
  if (m) {
    const y = m[1];
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }
  return "";
}
