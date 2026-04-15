/**
 * 응시구분 드롭다운 옵션 (백엔드 별도 코드테이블 없을 때 공통 라벨)
 * 운영에서 항목을 바꾸려면 이 배열만 수정하면 됩니다.
 */
export const RECRUIT_EXAM_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "신입", label: "신입" },
  { value: "경력", label: "경력" },
  { value: "인턴", label: "인턴" },
  { value: "계약", label: "계약" },
  { value: "기타", label: "기타" },
];

/** 학력 이수구분 (백엔드 `re_school[].end`) */
export const RECRUIT_SCHOOL_END_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "== 이수구분 ==" },
  { value: "졸업", label: "졸업" },
  { value: "수료", label: "수료" },
  { value: "재학중", label: "재학중" },
  { value: "휴학", label: "휴학" },
  { value: "중퇴", label: "중퇴" },
];

/** 병역구분 (`re_army.type`) */
export const RECRUIT_ARMY_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "선택해 주세요" },
  { value: "군필", label: "군필" },
  { value: "미필", label: "미필" },
  { value: "면제", label: "면제" },
  { value: "공익", label: "공익" },
  { value: "사회복무", label: "사회복무" },
  { value: "기타", label: "기타" },
];
