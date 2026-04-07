/**
 * 관리자 제품/카테고리 트리 API입니다.
 * 백엔드: `admin/category.php` (생성·수정은 FormData)
 */
import { apiRequest } from "../client";
import type { Pagination } from "../types";

export interface AdminCategoryItem {
  gc_id: string;
  gc_name: string;
  gc_order: number;
  gc_thum_url: string | null;
  depth: number;
  parent_id: string | null;
}

export interface AdminCategoryListData {
  items: AdminCategoryItem[];
  pagination: Pagination & {
    limit: number;
  };
}

export interface AdminCategoryListParams {
  filter_id?: string;
  page?: number;
  limit?: number;
}

export interface AdminCategoryCreatePayload {
  parent_gc_id?: string;
  gc_name: string;
  gc_order?: number;
  gc_thum?: File | null;
}

export interface AdminCategoryUpdatePayload {
  gc_id: string;
  gc_name: string;
  gc_order?: number;
  gc_thum?: File | null;
}

/** 백엔드가 기대하는 필드명으로 FormData를 만듭니다. */
function toCategoryFormData(action: "create", payload: AdminCategoryCreatePayload): FormData;
function toCategoryFormData(action: "update", payload: AdminCategoryUpdatePayload): FormData;
function toCategoryFormData(
  action: "create" | "update",
  payload: AdminCategoryCreatePayload | AdminCategoryUpdatePayload
) {
  const formData = new FormData();

  formData.append("action", action);

  if (action === "create") {
    formData.append("gc_id", (payload as AdminCategoryCreatePayload).parent_gc_id ?? "");
  } else {
    formData.append("gc_id", (payload as AdminCategoryUpdatePayload).gc_id);
  }

  formData.append("gc_name", payload.gc_name);
  formData.append("gc_order", String(payload.gc_order ?? 0));

  if (payload.gc_thum instanceof File) {
    formData.append("gc_thum", payload.gc_thum);
  }

  return formData;
}

export async function getAdminCategoryList(params: AdminCategoryListParams = {}) {
  return apiRequest<AdminCategoryListData>("/admin/category.php", {
    query: {
      filter_id: params.filter_id,
      page: params.page ?? 1,
      limit: params.limit ?? 100,
    },
    credentials: "include",
  });
}

export async function createAdminCategory(payload: AdminCategoryCreatePayload) {
  return apiRequest<{ ok: true; message: string; gc_id: string }>("/admin/category.php", {
    method: "POST",
    body: toCategoryFormData("create", payload),
    credentials: "include",
  });
}

export async function updateAdminCategory(payload: AdminCategoryUpdatePayload) {
  return apiRequest<{ ok: true; message: string }>("/admin/category.php", {
    method: "POST",
    body: toCategoryFormData("update", payload),
    credentials: "include",
  });
}

export async function deleteAdminCategory(gcId: string) {
  return apiRequest<{ ok: true; message: string }>("/admin/category.php", {
    method: "DELETE",
    body: { gc_id: gcId },
    credentials: "include",
  });
}
