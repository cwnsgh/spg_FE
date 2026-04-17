import type { IrFinancialRow } from "@/api";

/** IRLibrary와 동일 규칙으로 셀 표기(숫자는 천 단위 구분) */
export function formatFinancialCellValue(value: string | null | undefined): string {
  if (!value || !value.trim()) return "—";

  const normalizedValue = value.replace(/,/g, "").trim();
  const isNumeric = /^-?\d+(\.\d+)?$/.test(normalizedValue);

  if (!isNumeric) {
    return value.trim();
  }

  return Number(normalizedValue).toLocaleString("ko-KR");
}

/** 연간·분기 컬럼 중 가장 오른쪽(최신)에 값이 있으면 그 값을 사용 */
export function pickLatestQuarterDisplay(values: string[] | undefined): string {
  if (!values?.length) return "—";
  for (let i = values.length - 1; i >= 0; i -= 1) {
    const raw = values[i]?.trim();
    if (raw) return formatFinancialCellValue(raw);
  }
  return "—";
}

/** 후보 라벨 순으로 정확 일치하는 첫 행 값(관리자에 등록된 표기와 동일해야 함) */
export function rowValueByLabelCandidates(
  rows: IrFinancialRow[] | undefined,
  labelCandidates: string[]
): string {
  for (const label of labelCandidates) {
    const normalized = label.trim();
    const row = rows?.find((r) => r.label.trim() === normalized);
    if (row) return pickLatestQuarterDisplay(row.values);
  }
  return "—";
}
