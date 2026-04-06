import { apiRequest } from "./client";
import { IrFinancialsData } from "./types";

export interface FinancialsParams {
  type: 1 | 2 | 3;
  gi_id?: number;
}

// IR 재무 데이터를 조회합니다.
// type: 1=재무상태표, 2=손익계산서, 3=현금흐름표
export async function getFinancials(params: FinancialsParams) {
  return apiRequest<IrFinancialsData>("/front/ir/financials.php", {
    query: {
      type: params.type,
      gi_id: params.gi_id,
    },
  });
}
