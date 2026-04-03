import type { Pagination } from "../types";
import { adminRawRequest } from "./raw";

export interface AdminGroupItem {
  gr_id: string;
  gr_subject: string;
  gr_device: string;
  gr_use_access?: number;
  gr_order?: number;
  bo_count?: number;
}

export interface AdminGroupListParams {
  page?: number;
  rows?: number;
  sfl?: "gr_id" | "gr_subject";
  stx?: string;
  sst?: "gr_id" | "gr_subject" | "gr_order";
  sod?: "ASC" | "DESC";
}

export interface AdminGroupListData {
  items: AdminGroupItem[];
  pagination: Pagination & {
    limit: number;
  };
}

export interface AdminGroupSavePayload {
  gr_id: string;
  gr_subject?: string;
  gr_device?: string;
  gr_use_access?: number;
  gr_order?: number;
}

interface GroupListResponse {
  ok: true;
  data: AdminGroupItem[];
  pagination: {
    total: number;
    current_page: number;
    total_pages: number;
  };
}

export async function getAdminGroupList(
  params: AdminGroupListParams = {}
): Promise<AdminGroupListData> {
  const response = await adminRawRequest<GroupListResponse>("/admin/groups.php", {
    query: {
      page: params.page ?? 1,
      rows: params.rows ?? 50,
      sfl: params.sfl,
      stx: params.stx,
      sst: params.sst,
      sod: params.sod,
    },
  });

  return {
    items: response.data,
    pagination: {
      total_count: response.pagination.total,
      total_pages: response.pagination.total_pages,
      current_page: response.pagination.current_page,
      limit: params.rows ?? 50,
    },
  };
}

export async function getAdminGroupDetail(grId: string) {
  const response = await adminRawRequest<{ ok: true; data: AdminGroupItem }>(
    "/admin/groups.php",
    {
      query: { gr_id: grId },
    }
  );

  return response.data;
}

export async function createAdminGroup(payload: AdminGroupSavePayload) {
  return adminRawRequest<{ ok: true; message: string }>("/admin/groups.php", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminGroup(payload: AdminGroupSavePayload) {
  return adminRawRequest<{ ok: true; message: string }>("/admin/groups.php", {
    method: "PUT",
    body: payload,
  });
}

export async function deleteAdminGroup(grId: string) {
  return adminRawRequest<{ ok: true; message: string }>("/admin/groups.php", {
    method: "DELETE",
    query: { gr_id: grId },
  });
}
