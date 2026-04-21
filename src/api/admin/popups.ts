/**
 * 관리자 팝업 CRUD — 백엔드 `admin/popup.php` (`g5_new_win`).
 *
 * 배포 경로가 다르면 `.env`에 예:
 * `NEXT_PUBLIC_API_ADMIN_POPUP_PATH=/admin/popups.php` (앞 슬래시 포함)
 */
import { apiRequest } from "../client";
import { toApiUrl } from "../config";

export const ADMIN_POPUP_API_PATH =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_API_ADMIN_POPUP_PATH?.trim()) ||
  "/admin/popup.php";

/** 디버깅·안내용 전체 요청 URL (목록 GET 기준, 쿼리 없음) */
export function getAdminPopupApiUrl(): string {
  return toApiUrl(ADMIN_POPUP_API_PATH);
}

export interface AdminPopupRow {
  nw_id: number;
  nw_device: string;
  nw_begin_time: string;
  nw_end_time: string;
  nw_disable_hours: number;
  nw_left: number;
  nw_top: number;
  nw_width: number;
  nw_height: number;
  nw_subject: string;
  nw_content: string;
  nw_content_html: number;
}

export interface AdminPopupSavePayload {
  nw_subject: string;
  nw_device: "pc" | "mobile" | "both";
  nw_begin_time: string;
  nw_end_time: string;
  nw_disable_hours: number;
  nw_left: number;
  nw_top: number;
  nw_width: number;
  nw_height: number;
  nw_content: string;
  nw_content_html: number;
}

export async function getAdminPopupList() {
  return apiRequest<AdminPopupRow[]>(ADMIN_POPUP_API_PATH, {
    credentials: "include",
  });
}

export async function getAdminPopupDetail(nwId: number) {
  return apiRequest<AdminPopupRow>(ADMIN_POPUP_API_PATH, {
    query: { nw_id: nwId },
    credentials: "include",
  });
}

export async function createAdminPopup(payload: AdminPopupSavePayload) {
  return apiRequest<{ ok: boolean; message?: string }>(ADMIN_POPUP_API_PATH, {
    method: "POST",
    body: payload,
    credentials: "include",
  });
}

export async function updateAdminPopup(
  nwId: number,
  payload: AdminPopupSavePayload
) {
  return apiRequest<{ ok: boolean; message?: string }>(ADMIN_POPUP_API_PATH, {
    method: "PUT",
    query: { nw_id: nwId },
    body: payload,
    credentials: "include",
  });
}

export async function deleteAdminPopup(nwId: number) {
  return apiRequest<{ ok: boolean; message?: string }>(ADMIN_POPUP_API_PATH, {
    method: "DELETE",
    query: { nw_id: nwId },
    credentials: "include",
  });
}
