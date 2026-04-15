/**
 * 관리자 제품 등록 폼용 임시 기본값 (로컬·업로드 작업 편의).
 * 나중에 제거하거나 백엔드 "분류별 템플릿"으로 옮기면 됩니다.
 */
import type { AdminSpgCategoryRow } from "@/api";

export type ProductFormDevPreset = {
  /** 2뎁스 `name_en`과 대소문자 무시로 같으면 매칭 */
  matchDepth2NameEn?: string;
  /** 2뎁스 `name_ko`와 대소문자 무시로 같으면 매칭 */
  matchDepth2NameKo?: string;
  /** 정확히 이 분류 ID가 선택돼 있으면 매칭 (다른 뎁스/이름용으로 확장) */
  matchCaIds?: number[];
  summaryKo: string;
  summaryEn: string;
  features: { ko: string; en: string }[];
};

function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** 추가 프리셋은 이 배열에만 객체를 더 넣으면 됩니다. */
export const PRODUCT_FORM_DEV_PRESETS: ProductFormDevPreset[] = [
  {
    matchDepth2NameEn: "ELECTROMAGNETIC BRAKE MOTOR",
    summaryKo:
      "교류 무여자 작동형 전자(電磁) BRAKE를 MOTOR 후부에 장착하여 전원이 OFF와 동시에 MOTOR가 순시에 정지하여 부하를 유지합니다. ",
    summaryEn:
      "The electromagnetic brake of AC non-excitation run type is mounted at the back of the motor to enable the motor to stop instantly when the power is turned off, and the load maintained.",
    features: [
      { ko: "전자 브레이크", en: "Electromagnetic Brake" },
      { ko: "무여자 작동형", en: "Non-excitation Run Type" },
      { ko: "순시 정지", en: "Instantaneous Stop" },
      { ko: "부하 유지", en: "Load Maintenance" },
      { ko: "교류", en: "AC" },
    ],
  },
];

export function findProductFormDevPreset(
  categories: AdminSpgCategoryRow[],
  selectedCaIds: number[]
): ProductFormDevPreset | null {
  const byId = new Map(categories.map((c) => [c.ca_id, c]));

  for (const id of selectedCaIds) {
    const row = byId.get(id);
    if (!row) continue;

    for (const preset of PRODUCT_FORM_DEV_PRESETS) {
      if (preset.matchCaIds?.includes(id)) {
        return preset;
      }
      if (row.depth !== 2) continue;

      const ko = norm(row.name_ko);
      const en = norm(row.name_en);

      if (preset.matchDepth2NameKo && norm(preset.matchDepth2NameKo) === ko) {
        return preset;
      }
      if (
        preset.matchDepth2NameEn &&
        en === norm(preset.matchDepth2NameEn)
      ) {
        return preset;
      }
    }
  }

  return null;
}

export function isProductFormTextSlotEmpty(
  summaryKo: string,
  summaryEn: string,
  pairs: { ko: string; en: string }[]
): boolean {
  if (summaryKo.trim() !== "" || summaryEn.trim() !== "") return false;
  return !pairs.some((p) => p.ko.trim() !== "" || p.en.trim() !== "");
}
