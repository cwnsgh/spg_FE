/**
 * 관리자 게시판 설정 CRUD입니다.
 * 백엔드: `admin/boards.php` (목록 응답은 `adminRawRequest`로 원본 파싱 후 매핑)
 */
import type { Pagination } from "../types";
import { adminRawRequest } from "./raw";

export interface AdminBoardItem {
  bo_table: string;
  gr_id: string;
  bo_subject: string;
  bo_device: string;
  bo_skin: string;
  bo_mobile_skin: string;
  bo_order: number;
  bo_use_search: number;
  bo_use_sns: number;
  bo_list_level: number;
  bo_read_level: number;
  bo_write_level: number;
  bo_reply_level: number;
  bo_comment_level: number;
  bo_upload_level: number;
  bo_download_level: number;
  bo_html_level: number;
  bo_link_level: number;
}

export interface AdminBoardListParams {
  page?: number;
  rows?: number;
  sfl?: "bo_table" | "bo_subject" | "gr_id";
  stx?: string;
  sst?: "bo_table" | "bo_subject" | "gr_id" | "bo_order";
  sod?: "ASC" | "DESC";
}

export interface AdminBoardListData {
  items: AdminBoardItem[];
  pagination: Pagination & {
    limit: number;
  };
}

export interface AdminBoardSavePayload {
  bo_table: string;
  gr_id?: string;
  bo_subject?: string;
  bo_device?: string;
  bo_skin?: string;
  bo_mobile_skin?: string;
  bo_list_level?: number;
  bo_read_level?: number;
  bo_write_level?: number;
  bo_reply_level?: number;
  bo_comment_level?: number;
  bo_upload_level?: number;
  bo_download_level?: number;
  bo_html_level?: number;
  bo_link_level?: number;
  bo_use_search?: number;
  bo_order?: number;
  bo_use_sns?: number;
}

interface BoardListResponse {
  ok: true;
  data: AdminBoardItem[];
  pagination: {
    total: number;
    current_page: number;
    total_pages: number;
  };
}

export async function getAdminBoardList(
  params: AdminBoardListParams
): Promise<AdminBoardListData> {
  const response = await adminRawRequest<BoardListResponse>("/admin/boards.php", {
    query: {
      page: params.page ?? 1,
      rows: params.rows ?? 15,
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
      limit: params.rows ?? 15,
    },
  };
}

export async function getAdminBoardDetail(boTable: string) {
  const response = await adminRawRequest<{ ok: true; data: AdminBoardItem }>(
    "/admin/boards.php",
    {
      query: { bo_table: boTable },
    }
  );

  return response.data;
}

export async function createAdminBoard(payload: AdminBoardSavePayload) {
  return adminRawRequest<{ ok: true; message: string }>("/admin/boards.php", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminBoard(payload: AdminBoardSavePayload) {
  return adminRawRequest<{ ok: true; message: string }>("/admin/boards.php", {
    method: "PUT",
    body: payload,
  });
}

export async function deleteAdminBoard(boTable: string) {
  return adminRawRequest<{ ok: true; message: string }>("/admin/boards.php", {
    method: "DELETE",
    query: { bo_table: boTable },
  });
}
