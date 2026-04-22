import type { AuthUser } from "./types";

const DEFAULT_ADMIN_MIN_LEVEL = 10;

/**
 * 관리자(어드민) UI 접근 여부입니다.
 * - `is_admin === true` 이면 통과 (백엔드가 명시한 경우).
 * - 아니면 `mb_level`이 최고관리자 레벨 이상이면 통과 (그누보드 관행: 10).
 *   `login.php` / `me.php`에 `is_admin` 필드가 빠져 있을 때 로컬에서 막히는 문제를 줄입니다.
 *
 * 레벨 기준만 바꾸려면 `.env.local`에 `NEXT_PUBLIC_ADMIN_MIN_LEVEL=10` 등을 둡니다.
 */
function isAdminFlagTruthy(isAdmin: AuthUser["is_admin"]): boolean {
  return isAdmin === true || isAdmin === 1 || isAdmin === "1";
}

export function isUserAdmin(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (isAdminFlagTruthy(user.is_admin)) return true;
  const raw = process.env.NEXT_PUBLIC_ADMIN_MIN_LEVEL;
  const minLevel = raw !== undefined && raw !== "" ? Number(raw) : DEFAULT_ADMIN_MIN_LEVEL;
  if (!Number.isFinite(minLevel)) return false;
  return Number(user.mb_level) >= minLevel;
}
