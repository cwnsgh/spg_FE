export interface AuthUser {
  mb_id: string;
  mb_name: string;
  mb_level: number;
  is_admin?: boolean;
}

export interface LoginPayload {
  mb_id: string;
  mb_password: string;
}

export interface MeResponse {
  ok: true;
  is_logged_in: boolean;
  data: AuthUser | null;
}

export interface LoginResponse {
  ok: true;
  data: AuthUser;
}

export interface LogoutResponse {
  ok: true;
  message: string;
}

export interface AuthErrorResponse {
  ok: false;
  error: string;
}
