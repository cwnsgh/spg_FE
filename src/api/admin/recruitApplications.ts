/**
 * 채용 지원서 목록 (관리자 세션 필요)
 * 백엔드: `front/recurit/applications.php`
 */
import { ApiError } from "../client";
import { adminRawRequest } from "./raw";

export interface RecruitApplicationFilePreview {
  pf_id: number;
  pf_type: string;
  pf_no: number;
  pf_source: string;
  pf_file: string;
  pf_image: number;
  url: string;
}

export interface RecruitApplicationRow {
  re_id: number;
  re_status: number;
  re_status_text: string;
  post: {
    wr_id: number;
    subject: string;
    use_yn: string;
  };
  re_type: string;
  re_work: string;
  applicant: {
    name: string;
    sex: string;
    birth: string;
    phone: string;
  };
  applied_at: string;
  applied_date_text: string;
  updated_at: string;
  file_count: number;
  has_files: boolean;
  has_file_row: boolean;
  files_preview: RecruitApplicationFilePreview[];
  files_preview_names: string[];
  links: {
    detail_url: string;
    edit_url: string;
    print_url: string;
  };
}

export interface RecruitApplicationStatusOption {
  value: number;
  label: string;
}

export interface RecruitApplicationPostOption {
  wr_id: number;
  subject: string;
  use_yn: string;
  status: string;
}

export interface RecruitApplicationsResponse {
  ok: boolean;
  filters: {
    wr_id: number;
    re_work: string;
    re_status: number;
    re_name: string;
    apply_start: string;
    apply_end: string;
    page: number;
    limit: number;
  };
  filter_options: {
    status_options: RecruitApplicationStatusOption[];
    work_options: string[];
    post_options: RecruitApplicationPostOption[];
  };
  list: RecruitApplicationRow[];
  pagination: {
    total_count: number;
    total_pages: number;
    current_page: number;
    limit: number;
  };
}

export interface RecruitApplicationsQuery {
  page?: number;
  limit?: number;
  wr_id?: number;
  re_work?: string;
  re_status?: number;
  re_name?: string;
  apply_start?: string;
  apply_end?: string;
}

export async function getAdminRecruitApplications(query: RecruitApplicationsQuery = {}) {
  return adminRawRequest<RecruitApplicationsResponse>("/front/recurit/applications.php", {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      wr_id: query.wr_id,
      re_work: query.re_work,
      re_status: query.re_status,
      re_name: query.re_name,
      apply_start: query.apply_start,
      apply_end: query.apply_end,
    },
  });
}

/**
 * 지원서 본문 JSON (관리자 세션) — 공개 지원 마지막 단계 `RecruitApplyPreview`와 동일 구조.
 * 백엔드: `GET front/recurit/apply.php?re_id=`
 */
export async function getAdminRecruitApplyPreview(reId: number) {
  const json = await adminRawRequest<Record<string, unknown>>("/front/recurit/apply.php", {
    method: "GET",
    query: { re_id: reId },
  });
  const data = json.data;
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  throw new ApiError("지원서 데이터를 불러오지 못했습니다.", 500);
}

export interface RecruitStatusUpdateItem {
  re_id: number;
  re_status: number;
}

export interface RecruitStatusUpdateResponse {
  ok: boolean;
  message?: string;
  data?: {
    updated_count: number;
    updated: Array<{
      re_id: number;
      old_status: number;
      old_status_text: string;
      new_status: number;
      new_status_text: string;
    }>;
  };
}

/** 관리자 지원서 상태 변경 (`ajax.application_status.php`) */
export async function updateAdminRecruitApplicationStatuses(
  items: RecruitStatusUpdateItem[]
) {
  return adminRawRequest<RecruitStatusUpdateResponse>(
    "/front/recurit/ajax.application_status.php",
    {
      method: "POST",
      body: { items },
    }
  );
}
