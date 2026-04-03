import { apiRequest } from "./client";
import { FranchiseItem, FranchiseListData } from "./types";

// franchise 목록 조회에서 사용할 검색 조건입니다.
export interface FranchiseListParams {
  gf_type?: number;
  page?: number;
  limit?: number;
  area?: string;
  center?: string;
}

// 지역 필터용 목록 조회입니다.
// 예: 국내대리점/해외지사 같은 타입에 따라 지역 탭을 만들 때 사용합니다.
export async function getFranchiseAreas(gfType = 2) {
  return apiRequest<string[]>("/front/franchise/areas.php", {
    query: { gf_type: gfType },
  });
}

// franchise 목록 조회입니다.
// area, center 같은 검색 조건을 query string으로 붙여서 보냅니다.
export async function getFranchiseList(params: FranchiseListParams = {}) {
  return apiRequest<FranchiseListData>("/front/franchise/list.php", {
    query: {
      gf_type: params.gf_type ?? 2,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      area: params.area,
      center: params.center,
    },
  });
}

// franchise 상세 조회입니다.
// 리스트에서 특정 지점 상세 모달/상세 화면으로 넘어갈 때 사용할 수 있습니다.
export async function getFranchiseDetail(gfId: number) {
  return apiRequest<FranchiseItem>("/front/franchise/detail.php", {
    query: { gf_id: gfId },
  });
}
