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
  {
    matchDepth2NameEn: "TERMINAL BOX TYPE MOTORS",
    summaryKo:
      "TERMINAL BOX에 의해 MOTOR의 구출선 등 충전부가 밀폐 되어 먼지, 수분 등을 보호합니다. 따라서 내환경성이 중요시되는 곳에서 사용이 용이합니다. 또한 GASKET를 사용하여 확실하게 밀폐되어 있습니다.",
    summaryEn:
      "The motor’s charging section including leadwire is made airtight by the terminal box to provide the protection from dust and moisture. Therefore, the motor can be used in harsh environment. And the motor is made completely airtight with a gasket.",
    features: [
      { ko: "터미널 박스", en: "Terminal Box" },
      { ko: "충전부", en: "Charging Section" },
      { ko: "내환경성", en: "Environmental Resistance" },
      { ko: "밀폐", en: "Hermetic Seal" },
      { ko: "가스켓", en: "Gasket" },
    ],
  },
  {
    matchDepth2NameEn: "TORQUE MOTOR",
    summaryKo: "토크모터는 기동토크가 크며 수하(垂下)특성을 갖고 있습니다.",
    summaryEn:
      "Regarding the torque motor, the starting torque is big. And it has the special drooping and hanging characteristics. ",
    features: [
      { ko: "기동 토크", en: "Starting Torque" },
      { ko: "수하 특성", en: "Drooping Characteristics" },
      { ko: "구속 운전", en: "Locked-rotor Operation" },
      { ko: "장력 제어", en: "Tension Control" },
      { ko: "회전수 제어", en: "Speed Control" },
    ],
  },
  {
    matchDepth2NameEn: "INDUSTRIAL MOTOR / P Series",
    summaryKo:
      "P Series는 최저효율제를 만족하는 고성능 동력용 모터로, IP55의 높은 방진·방수 성능과 F종 절연을 갖춘 컴팩트한 설계가 특징입니다.",
    summaryEn:
      "The P Series is a high-performance industrial motor that complies with Minimum Energy Efficiency Standards, featuring a compact design with IP55 protection and Class F insulation.",
    features: [
      { ko: "최저효율제 만족", en: "MEPS Compliance" },
      { ko: "고신뢰성 및 저소음", en: "High Reliability & Low Noise" },
      { ko: "방진·방수 등급 (IP55)", en: "Ingress Protection (IP55)" },
      { ko: "F종 절연", en: "Class F Insulation" },
      { ko: "컴팩트 설계", en: "Compact Design" },
    ],
  },
  {
    matchDepth2NameEn: "INDUSTRIAL GEARED MOTOR / PA SERIES",
    summaryKo:
      "PA Series는 최대 1,230 N·m의 강력한 허용 토크를 제공하는 기어드 모터로, 최저효율제 만족과 IP55 등급의 보호 성능을 통해 산업 현장에 최적화된 고출력 솔루션을 제공합니다.",
    summaryEn:
      "The PA Series is a high-torque geared motor providing up to 1,230 N·m of allowable torque, offering a high-output solution optimized for industrial sites with MEPS compliance and IP55-rated protection.",
    features: [
      {
        ko: "최대 허용 토크 (1,230 N·m)",
        en: "Maximum Allowable Torque (1,230 N·m)",
      },
      { ko: "최저효율제 기준 만족", en: "MEPS Compliance" },
      { ko: "고신뢰성 및 저소음", en: "High Reliability & Low Noise" },
      {
        ko: "방진·방수 등급 (IP55/IP40)",
        en: "Ingress Protection (IP55/IP40)",
      },
      { ko: "F종 절연", en: "Class F Insulation" },
    ],
  },
  {
    matchDepth2NameEn: "INDUSTRIAL GEARED MOTOR / PC SERIES",
    summaryKo:
      "PC Series는 최대 610 N·m의 높은 허용 토크와 컴팩트한 사이즈를 동시에 구현한 기어드 모터로, 최저효율제 기준 만족과 IP55 등급의 내환경성을 갖추어 산업용 설비에 최적화되어 있습니다.",
    summaryEn:
      "The PC Series is a compact geared motor offering a high allowable torque of up to 610 N·m. It is optimized for industrial equipment, featuring MEPS compliance and IP55-rated environmental resistance.",
    features: [
      {
        ko: "최대 허용 토크 (610 N·m)",
        en: "Maximum Allowable Torque (610 N·m)",
      },
      { ko: "최저효율제 기준 만족", en: "MEPS Compliance" },
      { ko: "고신뢰성 및 저소음", en: "High Reliability & Low Noise" },
      {
        ko: "방진·방수 등급 (IP55/IP40)",
        en: "Ingress Protection (IP55/IP40)",
      },
      { ko: "F종 절연", en: "Class F Insulation" },
    ],
  },
];

export function findProductFormDevPreset(
  categories: AdminSpgCategoryRow[],
  selectedCaIds: number[]
): ProductFormDevPreset | null {
  const byId = new Map(categories.map((c) => [c.ca_id, c]));

  const getDepth2Anchor = (startId: number): AdminSpgCategoryRow | null => {
    let cur = byId.get(startId) ?? null;
    let guard = 0;
    while (cur && guard++ < 10) {
      if (cur.depth === 2) return cur;
      if (cur.parent_id == null) return null;
      cur = byId.get(cur.parent_id) ?? null;
    }
    return null;
  };

  for (const id of selectedCaIds) {
    const row = byId.get(id);
    if (!row) continue;
    const depth2Anchor = getDepth2Anchor(id);

    for (const preset of PRODUCT_FORM_DEV_PRESETS) {
      if (preset.matchCaIds?.includes(id)) {
        return preset;
      }
      if (!depth2Anchor) continue;

      const ko = norm(depth2Anchor.name_ko);
      const en = norm(depth2Anchor.name_en);

      if (preset.matchDepth2NameKo && norm(preset.matchDepth2NameKo) === ko) {
        return preset;
      }
      if (preset.matchDepth2NameEn && en === norm(preset.matchDepth2NameEn)) {
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
