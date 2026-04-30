/** Next.js 페이지: 재무상태표(IR) 관리. URL `/admin/ir/financial-statement` */
"use client";

import {
  createAdminFinancialStatement,
  deleteAdminFinancialStatement,
  getAdminFinancialStatementDetail,
  getAdminFinancialStatementList,
  updateAdminFinancialStatement,
} from "@/api";
import IrStatementManager from "../components/IrStatementManager";

const financialStatementLabels = [
  "유동자산",
  "비유동자산",
  "자산총계",
  "유동부채",
  "비유동부채",
  "부채총계",
  "자본금",
  "자본잉여금",
  "기타자본구성요소",
  "이익잉여금",
  "비지배지분",
  "자본총계",
  "부채와 자본 총계",
];

export default function AdminFinancialStatementPage() {
  return (
    <IrStatementManager
      eyebrow="IR INFORMATION"
      title="재무상태표 관리"
      description="공개 IR 자료실의 재무상태표 데이터를 연도별로 등록, 수정, 삭제합니다."
      rowLabels={financialStatementLabels}
      getList={getAdminFinancialStatementList}
      getDetail={getAdminFinancialStatementDetail}
      createItem={createAdminFinancialStatement}
      updateItem={updateAdminFinancialStatement}
      deleteItem={deleteAdminFinancialStatement}
    />
  );
}
