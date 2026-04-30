/**
 * 관리자 채용공고 편집 상태를 공개 상세 DTO 형태로 변환. 사용처: `RecruitPostEditor.tsx` 미리보기.
 */
import type { RecruitPostDetail, RecruitPositionDetail } from "@/api";
import type { AdminRecruitPositionRow } from "@/api/admin/recruitPosts";

function formatPeriodText(start: string, end: string): string {
  if (!start && !end) return "—";
  const a = start?.replace(/-/g, ".") ?? "";
  const b = end?.replace(/-/g, ".") ?? "";
  if (a && b) return `${a} ~ ${b}`;
  return `${a || "—"} ~ ${b || "—"}`;
}

/**
 * 어드민 폼 상태 → 공개 상세 모달과 동일 타입으로 변환(미리보기용)
 */
export function buildRecruitPreviewDetail(input: {
  subject: string;
  content: string;
  type: string;
  isAlways: boolean;
  recruitStart: string;
  recruitEnd: string;
  notice: string;
  applyMethod: string;
  process: string;
  contact: string;
  positions: AdminRecruitPositionRow[];
}): RecruitPostDetail {
  const bodyContent = input.content.trim() || input.subject.trim();
  const positions: RecruitPositionDetail[] = input.positions
    .filter((p) => p.job.trim())
    .map((p) => ({
      job: p.job.trim(),
      count: p.count?.trim() || "00",
      work: p.work_type?.trim() || "",
      business: p.business?.trim() || "",
      content: p.content?.trim() || "",
      required: p.required?.trim() || "",
      map: p.location?.trim() || "",
    }));

  return {
    id: 0,
    status: "미리보기(실제 공개 시 자동 표기)",
    type: input.type || "—",
    subject: input.subject.trim() || "제목 미입력",
    content: bodyContent,
    is_always: input.isAlways,
    period: {
      start: input.recruitStart,
      end: input.recruitEnd,
      text: formatPeriodText(input.recruitStart, input.recruitEnd),
    },
    notice: input.notice,
    positions,
    apply_method: input.applyMethod,
    process: input.process,
    contact: input.contact,
    can_apply: true,
    links: { list_url: "", apply_url: "" },
  };
}
