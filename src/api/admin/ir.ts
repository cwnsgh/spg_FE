/**
 * 관리자 IR 재무 데이터(재무상태표·손익·현금흐름) CRUD입니다.
 * 세 PHP 엔드포인트를 동일 패턴의 내부 헬퍼로 묶었습니다.
 */
import { apiRequest } from "../client";
import type { Pagination } from "../types";

type AdminIrApiPath =
  | "/admin/financial_statement.php"
  | "/admin/income_statement.php"
  | "/admin/cash_flow.php";

export interface AdminIrListItem {
  gi_id: number;
  gi_year: string;
}

export interface AdminIrListData {
  items: AdminIrListItem[];
  pagination: Pagination & {
    limit: number;
  };
}

export type AdminIrStatementDetail = {
  gi_id: number;
  gi_year: string;
} & Partial<Record<`gi_${number}`, string[]>>;

export interface AdminIrSavePayload {
  gi_id?: number;
  gi_year: string;
  [key: `gi_${number}`]: string[] | number | string | undefined;
}

interface AdminIrListParams {
  page?: number;
  limit?: number;
}

/** 연도별 행 목록 + 페이징 */
function getAdminIrList(path: AdminIrApiPath, params: AdminIrListParams = {}) {
  return apiRequest<AdminIrListData>(path, {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
    credentials: "include",
  });
}

/** `gi_id` 기준 단건(연도 + 동적 `gi_N` 컬럼들) */
function getAdminIrDetail(path: AdminIrApiPath, giId: number) {
  return apiRequest<AdminIrStatementDetail>(path, {
    query: { gi_id: giId },
    credentials: "include",
  });
}

/** 신규 연도 행 등록 */
function createAdminIrStatement(path: AdminIrApiPath, payload: AdminIrSavePayload) {
  return apiRequest<{ ok: true; message: string; gi_id: number }>(path, {
    method: "POST",
    body: payload,
    credentials: "include",
  });
}

/** 기존 연도 행 수정 */
function updateAdminIrStatement(path: AdminIrApiPath, payload: AdminIrSavePayload) {
  return apiRequest<{ ok: true; message: string }>(path, {
    method: "PUT",
    body: payload,
    credentials: "include",
  });
}

/** 연도 행 삭제 */
function deleteAdminIrStatement(path: AdminIrApiPath, giId: number) {
  return apiRequest<{ ok: true; message: string }>(path, {
    method: "DELETE",
    body: { gi_id: giId },
    credentials: "include",
  });
}

export function getAdminFinancialStatementList(params: AdminIrListParams = {}) {
  return getAdminIrList("/admin/financial_statement.php", params);
}

export function getAdminFinancialStatementDetail(giId: number) {
  return getAdminIrDetail("/admin/financial_statement.php", giId);
}

export function createAdminFinancialStatement(payload: AdminIrSavePayload) {
  return createAdminIrStatement("/admin/financial_statement.php", payload);
}

export function updateAdminFinancialStatement(payload: AdminIrSavePayload) {
  return updateAdminIrStatement("/admin/financial_statement.php", payload);
}

export function deleteAdminFinancialStatement(giId: number) {
  return deleteAdminIrStatement("/admin/financial_statement.php", giId);
}

export function getAdminIncomeStatementList(params: AdminIrListParams = {}) {
  return getAdminIrList("/admin/income_statement.php", params);
}

export function getAdminIncomeStatementDetail(giId: number) {
  return getAdminIrDetail("/admin/income_statement.php", giId);
}

export function createAdminIncomeStatement(payload: AdminIrSavePayload) {
  return createAdminIrStatement("/admin/income_statement.php", payload);
}

export function updateAdminIncomeStatement(payload: AdminIrSavePayload) {
  return updateAdminIrStatement("/admin/income_statement.php", payload);
}

export function deleteAdminIncomeStatement(giId: number) {
  return deleteAdminIrStatement("/admin/income_statement.php", giId);
}

export function getAdminCashFlowList(params: AdminIrListParams = {}) {
  return getAdminIrList("/admin/cash_flow.php", params);
}

export function getAdminCashFlowDetail(giId: number) {
  return getAdminIrDetail("/admin/cash_flow.php", giId);
}

export function createAdminCashFlow(payload: AdminIrSavePayload) {
  return createAdminIrStatement("/admin/cash_flow.php", payload);
}

export function updateAdminCashFlow(payload: AdminIrSavePayload) {
  return updateAdminIrStatement("/admin/cash_flow.php", payload);
}

export function deleteAdminCashFlow(giId: number) {
  return deleteAdminIrStatement("/admin/cash_flow.php", giId);
}
