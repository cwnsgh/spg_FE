"use client";

/**
 * 채용 공고 상세·모집분야 렌더(공개·어드민 미리보기 공용). 사용처: `RecruitPostEditor.tsx`.
 */
import type { RecruitPostDetail, RecruitPositionDetail } from "@/api";
import type { ReactNode } from "react";
import modalStyles from "@/app/aboutUs/components/sections/Recruitment.module.css";

function looksLikeHtml(s: string): boolean {
  return /<[a-z][\s\S]*?>/i.test(s);
}

function shouldShowExtraBodyHtml(content: string, subject: string): boolean {
  const strip = (x: string) =>
    x
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const c = strip(content);
  const s = strip(subject);
  if (!c) return false;
  if (c === s) return false;
  return true;
}

function renderCellRichText(text: string | undefined | null): ReactNode {
  if (!text?.trim()) {
    return <span className={modalStyles.cellDash}>—</span>;
  }
  const t = text.trim();
  if (looksLikeHtml(t)) {
    return <div className={modalStyles.cellRich} dangerouslySetInnerHTML={{ __html: t }} />;
  }
  const lines = t
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-*‧]\s*/, "").trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return <span className={modalStyles.cellDash}>—</span>;
  }
  if (lines.length === 1) {
    return <span className={modalStyles.cellPlainSpan}>{lines[0]}</span>;
  }
  return (
    <ul className={modalStyles.cellBulletList}>
      {lines.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

export interface RecruitPostDetailViewProps {
  detail: RecruitPostDetail;
  /** 미리보기일 때 상단 안내 문구 */
  showPreviewNote?: boolean;
  /** 하단 버튼 영역(목록보기·지원하기 등). 없으면 생략 */
  actions?: ReactNode;
}

export default function RecruitPostDetailView({
  detail,
  showPreviewNote,
  actions,
}: RecruitPostDetailViewProps) {
  return (
    <>
      {showPreviewNote ? (
        <p className={modalStyles.previewNote}>
          저장 전 미리보기입니다. 「상태」 등은 실제 공개 시 서버·노출 조건에 따라 달라질 수 있습니다.
        </p>
      ) : null}

      <table className={modalStyles.detailSummaryTable}>
        <tbody>
          <tr>
            <th scope="row">상태</th>
            <td>{detail.status || "—"}</td>
          </tr>
          <tr>
            <th scope="row">모집분야</th>
            <td>{detail.type || "—"}</td>
          </tr>
          <tr>
            <th scope="row">접수기간</th>
            <td>{detail.is_always ? "상시접수" : detail.period?.text || "—"}</td>
          </tr>
          <tr>
            <th scope="row">참고사항</th>
            <td className={modalStyles.detailSummaryNoticeCell}>
              {detail.notice?.trim() ? renderCellRichText(detail.notice) : "—"}
            </td>
          </tr>
        </tbody>
      </table>

      {detail.positions?.length ? (
        <div className={modalStyles.detailPositionsWrap}>
          <table className={modalStyles.detailPositionsTable}>
            <thead>
              <tr>
                <th>직무</th>
                <th>모집인원</th>
                <th>근무형태</th>
                <th>주요업무</th>
                <th>모집분야</th>
                <th>자격요건</th>
                <th>근무지</th>
              </tr>
            </thead>
            <tbody>
              {detail.positions.map((p: RecruitPositionDetail, i: number) => (
                <tr key={i}>
                  <td className={modalStyles.detailTdSimple}>
                    <span className={modalStyles.detailCellText}>{p.job?.trim() || "—"}</span>
                  </td>
                  <td className={modalStyles.detailTdSimple}>
                    <span className={modalStyles.detailCellText}>{p.count?.trim() || "—"}</span>
                  </td>
                  <td className={modalStyles.detailTdSimple}>
                    <span className={modalStyles.detailCellText}>{p.work?.trim() || "—"}</span>
                  </td>
                  <td className={modalStyles.detailTdRich}>{renderCellRichText(p.business)}</td>
                  <td className={modalStyles.detailTdRich}>{renderCellRichText(p.content)}</td>
                  <td className={modalStyles.detailTdRich}>{renderCellRichText(p.required)}</td>
                  <td className={modalStyles.detailTdSimple}>
                    <span className={modalStyles.detailCellText}>{p.map?.trim() || "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={modalStyles.detailNoPositions}>등록된 모집 직무 정보가 없습니다.</p>
      )}

      {detail.apply_method?.trim() ? (
        <section className={modalStyles.detailExtra}>
          <h4>접수방법</h4>
          <div className={modalStyles.detailExtraBody}>{renderCellRichText(detail.apply_method)}</div>
        </section>
      ) : null}
      {detail.process?.trim() ? (
        <section className={modalStyles.detailExtra}>
          <h4>전형절차</h4>
          <div className={modalStyles.detailExtraBody}>{renderCellRichText(detail.process)}</div>
        </section>
      ) : null}
      {detail.contact?.trim() ? (
        <section className={modalStyles.detailExtra}>
          <h4>문의처</h4>
          <div className={modalStyles.detailExtraBody}>{renderCellRichText(detail.contact)}</div>
        </section>
      ) : null}

      {shouldShowExtraBodyHtml(detail.content, detail.subject) ? (
        <section className={modalStyles.detailExtra}>
          <h4>추가 안내</h4>
          <div className={modalStyles.detailHtml} dangerouslySetInnerHTML={{ __html: detail.content }} />
        </section>
      ) : null}

      {actions}
    </>
  );
}
