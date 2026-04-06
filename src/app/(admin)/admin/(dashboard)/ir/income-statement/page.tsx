"use client";

import {
  createAdminIncomeStatement,
  deleteAdminIncomeStatement,
  getAdminIncomeStatementDetail,
  getAdminIncomeStatementList,
  updateAdminIncomeStatement,
} from "@/api";
import IrStatementManager from "../components/IrStatementManager";

const incomeStatementLabels = [
  "매출액",
  "매출원가",
  "매출총이익",
  "판매비와관리비",
  "영업이익",
  "영업외수익",
  "영업외비용",
  "법인세비용차감전이익",
  "법인세비용",
  "당기순이익",
  "기타포괄손익",
  "총포괄손익",
];

export default function AdminIncomeStatementPage() {
  return (
    <IrStatementManager
      eyebrow="IR INFORMATION"
      title="손익계산서 관리"
      description="손익계산서 데이터를 연도별로 운영할 수 있는 관리자 화면입니다."
      rowLabels={incomeStatementLabels}
      getList={getAdminIncomeStatementList}
      getDetail={getAdminIncomeStatementDetail}
      createItem={createAdminIncomeStatement}
      updateItem={updateAdminIncomeStatement}
      deleteItem={deleteAdminIncomeStatement}
    />
  );
}
