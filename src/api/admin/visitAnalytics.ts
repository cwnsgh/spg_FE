/**
 * 그누보드 접속 로그·집계 (`g5_visit`, `g5_visit_sum`)
 * 백엔드: `admin/visit_stats.php`, `admin/visit_search.php`
 */
import { adminRawRequest } from "./raw";

export type VisitStatsType =
  | "list"
  | "domain"
  | "browser"
  | "os"
  | "device"
  | "hour"
  | "week"
  | "year"
  | "month"
  | "date";

/** `visit_stats.php` list 타입 행 (SELECT * FROM g5_visit) */
export type VisitLogRow = Record<string, string | number | null | undefined>;

export interface VisitStatsListResponse {
  ok: true;
  type: "list";
  total_count: number;
  total_page: number;
  current_page: number;
  data: VisitLogRow[];
}

export interface VisitStatsAggregateRow {
  name: string;
  cnt: number;
  rate: number;
}

export interface VisitStatsAggregateResponse {
  ok: true;
  type: Exclude<VisitStatsType, "list">;
  total_sum: number;
  data: VisitStatsAggregateRow[];
}

export type VisitStatsResponse = VisitStatsListResponse | VisitStatsAggregateResponse;

export interface VisitStatsQuery {
  type: VisitStatsType;
  page?: number;
  fr_date?: string;
  to_date?: string;
  /** list 전용: 리퍼러 도메인 부분 검색 */
  domain_search?: string;
}

export async function getAdminVisitStats(query: VisitStatsQuery) {
  return adminRawRequest<VisitStatsResponse>("/admin/visit_stats.php", {
    query: {
      type: query.type,
      page: query.page ?? 1,
      fr_date: query.fr_date,
      to_date: query.to_date,
      domain_search: query.domain_search?.trim() || undefined,
    },
  });
}

export type VisitSearchField = "vi_ip" | "vi_referer" | "vi_date";

export interface VisitSearchRow {
  vi_id: number;
  vi_ip: string;
  vi_referer: string;
  vi_browser: string;
  vi_os: string;
  vi_device: string;
  vi_date: string;
  vi_time: string;
}

export interface VisitSearchResponse {
  ok: true;
  data: VisitSearchRow[];
  pagination: {
    total_records: number;
    total_pages: number;
    current_page: number;
    rows_per_page: number;
  };
}

export interface VisitSearchQuery {
  sfl?: VisitSearchField;
  stx?: string;
  page?: number;
}

export async function searchAdminVisits(query: VisitSearchQuery) {
  return adminRawRequest<VisitSearchResponse>("/admin/visit_search.php", {
    query: {
      sfl: query.sfl,
      stx: query.stx?.trim() || undefined,
      page: query.page ?? 1,
    },
  });
}
