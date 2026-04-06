"use client";

import {
  createAdminCashFlow,
  deleteAdminCashFlow,
  getAdminCashFlowDetail,
  getAdminCashFlowList,
  updateAdminCashFlow,
} from "@/api";
import IrStatementManager from "../components/IrStatementManager";

const cashFlowLabels = [
  "영업활동으로 인한 현금흐름",
  "투자활동으로 인한 현금흐름",
  "재무활동으로 인한 현금흐름",
  "현금의증가(감소)",
  "기초의 현금 및 현금자산",
  "환율변동효과",
  "기말의 현금 및 현금성 자산",
];

export default function AdminCashFlowPage() {
  return (
    <IrStatementManager
      eyebrow="IR INFORMATION"
      title="현금흐름표 관리"
      description="현금흐름표 데이터를 연도별로 관리하고 공개 IR 자료실과 동일한 소스를 유지합니다."
      rowLabels={cashFlowLabels}
      getList={getAdminCashFlowList}
      getDetail={getAdminCashFlowDetail}
      createItem={createAdminCashFlow}
      updateItem={updateAdminCashFlow}
      deleteItem={deleteAdminCashFlow}
    />
  );
}
