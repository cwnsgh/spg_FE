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
