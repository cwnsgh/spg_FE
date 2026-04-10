/**
 * 관리자 채용공고 CRUD (`front/recurit/manage_*.php`, `ajax.manage_post_*.php`)
 */
import { adminRawRequest } from "./raw";

export interface RecruitManageFilterOption {
  value: string;
  label: string;
}

export interface RecruitManageStatusOption {
  value: number;
  label: string;
}

export interface RecruitManagePostsFilters {
  use_yn?: string;
  status_code?: number;
  keyword?: string;
  page: number;
  limit: number;
}

export interface RecruitManagePostListRow {
  wr_id: number;
  use_yn: string;
  subject: string;
  type: string;
  status_code: number;
  status_text: string;
  is_always: boolean;
  display_period: { start: string; end: string; text: string };
  recruit_period: { start: string; end: string; text: string };
  order_no: number;
  created_at: string;
  created_date_text: string;
  hit: number;
  positions_preview: string[];
  links: { detail_url: string; view_url: string };
}

export interface RecruitManagePostsResponse {
  ok: boolean;
  filters: RecruitManagePostsFilters;
  filter_options: {
    use_options: RecruitManageFilterOption[];
    status_options: RecruitManageStatusOption[];
  };
  list: RecruitManagePostListRow[];
  pagination: {
    total_count: number;
    total_pages: number;
    current_page: number;
    limit: number;
  };
}

export interface RecruitManagePostsQuery {
  use_yn?: string;
  status_code?: number;
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface AdminRecruitPositionRow {
  job: string;
  count: string;
  work_type: string;
  business: string;
  content: string;
  required: string;
  location: string;
}

/**
 * `manage_post.php` 응답의 `positions`는 보통 배열이나, PHP `json_encode` 특성상
 * 인덱스가 끊기면 JSON 객체로 직렬화됩니다. 그때 JS에서 `.length`가 없어
 * 편집기에 빈 행 1개만 보이는 문제가 생깁니다.
 */
export function normalizeAdminRecruitPositionRows(raw: unknown): AdminRecruitPositionRow[] {
  if (Array.isArray(raw)) {
    return raw.filter(
      (item): item is AdminRecruitPositionRow =>
        item !== null && typeof item === "object" && !Array.isArray(item)
    );
  }
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    const entries = Object.entries(obj).filter(
      ([, v]) => v !== null && typeof v === "object" && !Array.isArray(v)
    );
    entries.sort((a, b) => {
      const na = Number(a[0]);
      const nb = Number(b[0]);
      if (Number.isFinite(na) && Number.isFinite(nb) && a[0] === String(na) && b[0] === String(nb)) {
        return na - nb;
      }
      return String(a[0]).localeCompare(String(b[0]), undefined, { numeric: true });
    });
    return entries.map(([, v]) => v as AdminRecruitPositionRow);
  }
  return [];
}

export interface AdminRecruitPostDetail {
  wr_id: number;
  use_yn: string;
  subject: string;
  content: string;
  type: string;
  is_always: boolean;
  status_code: number;
  status_text: string;
  display_period: { start: string; end: string; text: string };
  recruit_period: { start: string; end: string; text: string };
  notice: string;
  apply_method: string;
  process: string;
  contact: string;
  order_no: number;
  hit: number;
  created_at: string;
  updated_at: string;
  positions: AdminRecruitPositionRow[];
  options: {
    use_options: RecruitManageFilterOption[];
    type_options: RecruitManageFilterOption[];
  };
  links: {
    list_url: string;
    public_view_url: string;
  };
}

export interface RecruitManagePostGetResponse {
  ok: boolean;
  data: AdminRecruitPostDetail;
}

export interface RecruitManagePostSaveBody {
  mode: "create" | "update";
  wr_id?: number;
  use_yn: string;
  subject: string;
  content: string;
  type: string;
  is_always: boolean;
  display_period: { start: string; end: string };
  recruit_period: { start: string; end: string };
  notice: string;
  apply_method: string;
  process: string;
  contact: string;
  order_no: number;
  positions: AdminRecruitPositionRow[];
}

export interface RecruitManagePostSaveResponse {
  ok: boolean;
  message?: string;
  data?: {
    mode: "create" | "update";
    wr_id: number;
    redirect?: {
      manage_detail_url: string;
      manage_list_url: string;
      public_view_url: string;
    };
  };
  error?: string;
}

export interface RecruitManagePostDeleteResponse {
  ok: boolean;
  message?: string;
  data?: {
    deleted_count: number;
    deleted_wr_ids: number[];
    deleted_application_count: number;
    errors: string[];
    partial_success: boolean;
  };
  error?: string;
}

export interface RecruitManagePostSortResponse {
  ok: boolean;
  message?: string;
  data?: {
    updated_count: number;
    updated: { wr_id: number; old_order_no: number; new_order_no: number }[];
  };
  error?: string;
}

export async function getAdminRecruitManagePosts(query: RecruitManagePostsQuery = {}) {
  return adminRawRequest<RecruitManagePostsResponse>("/front/recurit/manage_posts.php", {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      use_yn: query.use_yn,
      status_code: query.status_code,
      keyword: query.keyword?.trim() || undefined,
    },
  });
}

export async function getAdminRecruitManagePost(wrId: number) {
  const res = await adminRawRequest<RecruitManagePostGetResponse>("/front/recurit/manage_post.php", {
    query: { wr_id: wrId },
  });
  return res.data;
}

export async function saveAdminRecruitManagePost(body: RecruitManagePostSaveBody) {
  return adminRawRequest<RecruitManagePostSaveResponse>("/front/recurit/ajax.manage_post_save.php", {
    method: "POST",
    body,
  });
}

export async function deleteAdminRecruitManagePosts(wrIds: number[]) {
  if (wrIds.length === 1) {
    return adminRawRequest<RecruitManagePostDeleteResponse>(
      "/front/recurit/ajax.manage_post_delete.php",
      { method: "POST", body: { wr_id: wrIds[0] } }
    );
  }
  return adminRawRequest<RecruitManagePostDeleteResponse>(
    "/front/recurit/ajax.manage_post_delete.php",
    { method: "POST", body: { wr_ids: wrIds } }
  );
}

export async function sortAdminRecruitManagePosts(
  items: { wr_id: number; order_no: number }[]
) {
  return adminRawRequest<RecruitManagePostSortResponse>("/front/recurit/ajax.manage_post_sort.php", {
    method: "POST",
    body: { items },
  });
}

/** 신규 작성 화면용 — 서버 `type_options` 와 동일한 기본값 */
export const RECRUIT_POST_TYPE_OPTIONS: RecruitManageFilterOption[] = [
  { value: "신입", label: "신입" },
  { value: "경력", label: "경력" },
  { value: "인턴", label: "인턴" },
  { value: "해외", label: "해외" },
  { value: "무관", label: "무관" },
];
