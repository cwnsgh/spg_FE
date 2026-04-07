/**
 * 관리자 가맹점(글로벌 네트워크) CRUD입니다.
 * 백엔드: `admin/franchise.php` (수정은 POST + `_method=PUT` 오버라이드)
 */
import { apiRequest } from "../client";
import { FranchiseItem, Pagination } from "../types";

export interface AdminFranchiseListParams {
  gf_type: number;
  page?: number;
  limit?: number;
}

export interface AdminFranchiseListData {
  items: FranchiseItem[];
  pagination: Pagination & {
    limit: number;
  };
}

export interface AdminFranchiseSavePayload {
  gf_id?: number;
  gf_type: number;
  gf_subject: string;
  gf_continent?: string;
  gf_nation?: string;
  gf_area: string;
  gf_addr: string;
  gf_contact?: string;
  gf_tel?: string;
  gf_fax?: string;
  gf_email?: string;
  gf_url?: string;
  gf_map_url?: string;
  gf_certi?: File | null;
  gf_certi_del?: boolean;
}

/** `gf_certi` 파일, `gf_certi_del` 플래그를 백엔드 형식에 맞게 넣습니다. */
function toFranchiseFormData(payload: AdminFranchiseSavePayload) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (key === "gf_certi" && value instanceof File) {
      formData.append(key, value);
      return;
    }

    if (key === "gf_certi_del") {
      formData.append(key, value ? "1" : "0");
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}

export async function getAdminFranchiseList(params: AdminFranchiseListParams) {
  return apiRequest<AdminFranchiseListData>("/admin/franchise.php", {
    query: {
      gf_type: params.gf_type,
      page: params.page ?? 1,
      limit: params.limit ?? 15,
    },
    credentials: "include",
  });
}

export async function getAdminFranchiseDetail(gfId: number) {
  return apiRequest<FranchiseItem>("/admin/franchise.php", {
    query: { gf_id: gfId },
    credentials: "include",
  });
}

export async function createAdminFranchise(payload: AdminFranchiseSavePayload) {
  return apiRequest<{ ok: true; message: string; gf_id: number }>(
    "/admin/franchise.php",
    {
      method: "POST",
      body: toFranchiseFormData(payload),
      credentials: "include",
    }
  );
}

export async function updateAdminFranchise(payload: AdminFranchiseSavePayload) {
  const formData = toFranchiseFormData(payload);
  formData.append("_method", "PUT");

  return apiRequest<{ ok: true; message: string }>("/admin/franchise.php", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
}

export async function deleteAdminFranchise(gfId: number) {
  return apiRequest<{ ok: true; message: string }>("/admin/franchise.php", {
    method: "DELETE",
    body: { gf_id: gfId },
    credentials: "include",
  });
}
