/**
 * 사용자용 채용공고 API (`front/recurit/posts.php`)
 */
import { apiRequest } from "./client";

export interface RecruitPositionSummary {
  job: string;
  count: string;
}

export interface RecruitPositionDetail extends RecruitPositionSummary {
  work?: string;
  business?: string;
  content?: string;
  required?: string;
  map?: string;
}

export interface RecruitPostListItem {
  id: number;
  status: string;
  type: string;
  subject: string;
  period: string;
  positions: RecruitPositionSummary[];
}

export interface RecruitPostsPagination {
  total_count: number;
  total_pages: number;
  current_page: number;
  limit: number;
}

export interface RecruitPostsListResponse {
  ok: boolean;
  list: RecruitPostListItem[];
  pagination: RecruitPostsPagination;
}

export interface RecruitPostDetail {
  id: number;
  status: string;
  type: string;
  subject: string;
  content: string;
  is_always: boolean;
  period: {
    start: string;
    end: string;
    text: string;
  };
  notice: string;
  positions: RecruitPositionDetail[];
  apply_method: string;
  process: string;
  contact: string;
  can_apply: boolean;
  links: {
    list_url: string;
    apply_url: string;
  };
  raw?: Record<string, unknown>;
}

export interface RecruitPostsParams {
  page?: number;
  /** 백엔드 `rows` / `limit`, 기본 12 */
  rows?: number;
}

export async function getRecruitPosts(params: RecruitPostsParams = {}) {
  return apiRequest<RecruitPostsListResponse>("/front/recurit/posts.php", {
    query: {
      page: params.page ?? 1,
      rows: params.rows ?? 12,
    },
  });
}

export async function getRecruitPostDetail(wrId: number) {
  return apiRequest<RecruitPostDetail>("/front/recurit/posts.php", {
    query: { wr_id: wrId },
  });
}
