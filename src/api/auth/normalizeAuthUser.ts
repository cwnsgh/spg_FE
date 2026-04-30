/**
 * 로그인·me 응답의 사용자 객체 정규화(레벨·관리자 플래그). 사용처: `api/auth/index.ts`, `AuthContext.tsx`.
 */
import type { AuthUser } from "./types";

function parseLevel(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** PHP JSON 에서 `1`/`"1"`/`true` 등으로 올 수 있는 관리자 플래그 */
function parseIsAdmin(raw: unknown): boolean | undefined {
  if (raw === true || raw === 1 || raw === "1") return true;
  if (raw === false || raw === 0 || raw === "0") return false;
  return undefined;
}

/**
 * `login.php` / `me.php` 응답을 프론트 `AuthUser` 형태로 맞춥니다.
 * (숫자·문자 혼용, `is_admin` 이 boolean 이 아닌 경우 등)
 */
export function normalizeAuthUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const mb_id = r.mb_id;
  if (typeof mb_id !== "string" || !mb_id.trim()) return null;

  const mb_name = typeof r.mb_name === "string" ? r.mb_name : "";
  const mb_level = parseLevel(r.mb_level);
  const is_admin = parseIsAdmin(r.is_admin);

  const out: AuthUser = {
    mb_id: mb_id.trim(),
    mb_name,
    mb_level,
  };
  if (is_admin !== undefined) {
    out.is_admin = is_admin;
  }
  return out;
}

/**
 * 로그인 직후 `me.php`가 레벨·관리자 플래그를 덜 주는 경우(프록시/세션 타이밍 등) 보완합니다.
 */
export function mergeAuthUserPreferStronger(fromMe: AuthUser, fromLogin: AuthUser): AuthUser {
  const levelMe = fromMe.mb_level;
  const levelLogin = fromLogin.mb_level;
  const meHasLevel = levelMe > 0;
  const meHasAdminFlag =
    fromMe.is_admin === true ||
    fromMe.is_admin === 1 ||
    fromMe.is_admin === "1";

  return {
    ...fromMe,
    mb_name: fromMe.mb_name?.trim() ? fromMe.mb_name : fromLogin.mb_name,
    mb_level: meHasLevel ? levelMe : levelLogin,
    is_admin: meHasAdminFlag ? fromMe.is_admin : fromLogin.is_admin,
  };
}
