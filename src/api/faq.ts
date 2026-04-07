/**
 * 사용자용 FAQ API입니다.
 * 백엔드: `front/faq.php` (카테고리·검색·페이징)
 */
import { apiRequest } from "./client";
import { FaqData } from "./types";

// FAQ 목록 조회에서 사용할 조건입니다.
export interface FaqParams {
  fm_id?: number;
  page?: number;
  stx?: string;
}

// FAQ 전체 조회 함수입니다.
// fm_id가 없으면 전체 카테고리, 있으면 특정 카테고리 기준으로 조회합니다.
export async function getFaq(params: FaqParams = {}) {
  return apiRequest<FaqData>("/front/faq.php", {
    query: {
      fm_id: params.fm_id,
      page: params.page ?? 1,
      stx: params.stx,
    },
  });
}
