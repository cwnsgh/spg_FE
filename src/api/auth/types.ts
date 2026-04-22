/** 인증 API에서 내려오는 최소 회원 필드입니다. */
export interface AuthUser {
  mb_id: string;
  mb_name: string;
  mb_level: number;
  /** PHP에서 `true` 또는 `1` 로 올 수 있음 */
  is_admin?: boolean | number | string;
}

/** 로그인 요청 body */
export interface LoginPayload {
  mb_id: string;
  mb_password: string;
}

/** `/auth/me.php` 성공 응답 */
export interface MeResponse {
  ok: true;
  is_logged_in: boolean;
  data: AuthUser | null;
}

/** `/auth/login.php` 성공 응답 */
export interface LoginResponse {
  ok: true;
  data: AuthUser;
}

/** `/auth/logout.php` 성공 응답 */
export interface LogoutResponse {
  ok: true;
  message: string;
}

/** 인증 API 실패 시 공통 형태 */
export interface AuthErrorResponse {
  ok: false;
  error: string;
}
