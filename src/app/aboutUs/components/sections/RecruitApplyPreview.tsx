"use client";

import { Fragment, useEffect, useState } from "react";
import {
  recruitProfileImageUrl,
  recruitUploadFilePublicUrl,
  recruitUploadPreviewKind,
} from "./recruitApplyAssets";
import RecruitPrivacyConsentPreview from "./RecruitPrivacyConsentPreview";
import styles from "./RecruitApplyPreview.module.css";

function norm(v: unknown): string {
  return v == null ? "" : String(v);
}

function asArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v.trim()) {
    try {
      const p = JSON.parse(v) as unknown;
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

function rowObj(r: unknown): Record<string, unknown> {
  return r && typeof r === "object" && !Array.isArray(r) ? (r as Record<string, unknown>) : {};
}

function joinAddr(zip: string, a1: string, a2: string, a3: string, jibeon: string): string {
  const parts = [zip && `(${zip})`, a1, a2, a3, jibeon && `(지번 ${jibeon})`].filter(Boolean);
  return parts.join(" ").trim();
}

const OA_LABELS = ["EXCEL", "MS-Word", "PPT", "한컴오피스"] as const;

const PROFILE_LABELS = [
  "1. 당사를 선택한 동기와 희망직종에 대한 사유",
  "2. 입사 후 하고 싶은 업무와 이를 위해 준비해온 과정",
  "3. 입사 후 본인의 장래포부",
  "4. 대학 동아리·봉사·사회단체 활동 경험",
  "5. 본인의 장점 및 보완점",
] as const;

const STEP1_ATTACHMENT_LABELS: {
  key: "fgrade" | "fscore" | "fcerti" | "fcareer";
  label: string;
}[] = [
  { key: "fgrade", label: "최종학력 졸업증명서" },
  { key: "fscore", label: "최종학력 성적증명서" },
  { key: "fcerti", label: "자격증" },
  { key: "fcareer", label: "경력증명서" },
];

function schoolFinalLabel(lastRaw: unknown): string {
  const t = norm(lastRaw).trim();
  if (t === "1" || t.toLowerCase() === "y" || t === "예") return "최종학력";
  return "—";
}

/** 예시 양식(졸업·예정·중퇴·휴학) 원 안 표시용 — 저장값 매핑 */
const SCHOOL_END_DISPLAY = ["졸업", "예정", "중퇴", "휴학"] as const;

function schoolEndCircleKey(stored: string): (typeof SCHOOL_END_DISPLAY)[number] | "" {
  const t = stored.trim();
  if (!t) return "";
  if (t === "졸업") return "졸업";
  if (t === "중퇴") return "중퇴";
  if (t === "휴학") return "휴학";
  if (t === "재학중" || t === "수료") return "예정";
  return "";
}

function unionCircleKey(raw: string): "유" | "무" | "" {
  const t = raw.trim();
  if (!t) return "";
  if (t === "유" || t === "가입") return "유";
  if (t === "무" || t === "미가입" || t === "아니오") return "무";
  const tl = t.toLowerCase();
  if (tl === "y" || tl === "yes" || tl === "true") return "유";
  if (tl === "n" || tl === "no" || tl === "false") return "무";
  return "";
}

function SchoolEndCircles({ end }: { end: string }) {
  const key = schoolEndCircleKey(norm(end));
  const raw = norm(end).trim();
  return (
    <span className={styles.spgChoiceRow}>
      {SCHOOL_END_DISPLAY.map((label) => (
        <span
          key={label}
          className={label === key ? styles.spgCircleChoiceOn : styles.spgCircleChoiceOff}
        >
          {label}
        </span>
      ))}
      {raw && !key ? <span className={styles.spgEndRaw}> ({raw})</span> : null}
    </span>
  );
}

function UnionCircles({ value }: { value: string }) {
  const k = unionCircleKey(norm(value));
  return (
    <span className={styles.spgUnionPair}>
      <span className={k === "유" ? styles.spgCircleChoiceOn : styles.spgCircleChoiceOff}>유</span>
      <span className={k === "무" ? styles.spgCircleChoiceOn : styles.spgCircleChoiceOff}>무</span>
    </span>
  );
}

export type RecruitStep1AttachmentRow = {
  pf_id?: number;
  pf_source?: string;
  pf_file?: string;
  /** 업로드 API가 내려주는 경우 그대로 사용 */
  url?: string;
};

export interface RecruitApplyPreviewProps {
  /** `recruitGetApply` / 작성 폼과 동일한 키를 가진 한 덩어의 지원서 객체 */
  data: Record<string, unknown>;
  /** 채용공고 제목 (선택) */
  postSubject?: string;
  /** 1단계 첨부 목록(미리보기 전용). 관리자 화면 등에서는 생략 가능 */
  step1Attachments?: Partial<
    Record<"fgrade" | "fscore" | "fcerti" | "fcareer", RecruitStep1AttachmentRow[]>
  >;
}

export default function RecruitApplyPreview({
  data,
  postSubject,
  step1Attachments,
}: RecruitApplyPreviewProps) {
  const armyRaw = data.re_army;
  let armyType = "";
  let armyCont = "";
  if (Array.isArray(armyRaw) && armyRaw[0] && typeof armyRaw[0] === "object") {
    const o = armyRaw[0] as Record<string, unknown>;
    armyType = norm(o.type);
    armyCont = norm(o.cont);
  } else if (armyRaw && typeof armyRaw === "object" && !Array.isArray(armyRaw)) {
    const o = armyRaw as Record<string, unknown>;
    armyType = norm(o.type);
    armyCont = norm(o.cont);
  }

  const schoolRows = asArray(data.re_school);
  const licenceRows = asArray(data.re_licence);
  const careerRows = asArray(data.re_career);
  const awardRows = asArray(data.re_award);
  const langRows = asArray(data.re_lang);
  const oaArr = asArray(data.re_oa);
  const addRaw = data.re_add;
  const add =
    addRaw && typeof addRaw === "object" && !Array.isArray(addRaw)
      ? (addRaw as Record<string, unknown>)
      : {};
  const historyRows = asArray(data.re_history);

  const [attachmentPreview, setAttachmentPreview] = useState<{
    title: string;
    fileLabel: string;
    url: string;
    kind: "image" | "pdf" | "other";
  } | null>(null);

  useEffect(() => {
    if (!attachmentPreview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAttachmentPreview(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [attachmentPreview]);

  const openAttachmentPreview = (sectionTitle: string, file: RecruitStep1AttachmentRow) => {
    const url = recruitUploadFilePublicUrl(file);
    if (!url) return;
    const fileLabel = norm(file.pf_source) || norm(file.pf_file) || "첨부";
    const kind = recruitUploadPreviewKind(fileLabel);
    setAttachmentPreview({ title: sectionTitle, fileLabel, url, kind });
  };

  const openProfilePhotoPreview = () => {
    const fileLabel = norm(data.re_img);
    if (!fileLabel) return;
    const url = recruitProfileImageUrl(fileLabel);
    if (!url) return;
    setAttachmentPreview({
      title: "증명사진",
      fileLabel,
      url,
      kind: "image",
    });
  };

  const textOrEmpty = (s: string) =>
    s.trim() ? <span className={styles.pre}>{s}</span> : <span className={styles.empty}>(미입력)</span>;

  return (
    <Fragment>
    <div className={styles.wrap}>
      <RecruitPrivacyConsentPreview data={data} />

      <div className={styles.applicationSheet}>
        <header className={styles.spgAppHeader}>
          <div className={styles.spgHeaderLeft}>
            <span className={styles.spgAppBrandEn}>SPG</span>
            <div className={styles.spgTitleBlock}>
              <span className={styles.spgAppBrandKr}>주식회사에스피지</span>
              <h1 className={styles.spgAppTitleMerged}>입사지원서</h1>
            </div>
          </div>
          <table className={styles.spgAppCornerTable} aria-label="응시 요약">
            <tbody>
              <tr>
                <th>응시구분</th>
                <td>{norm(data.re_work_type).trim() || "…"}</td>
              </tr>
              <tr>
                <th>응시부서</th>
                <td>{norm(data.re_work).trim() || "…"}</td>
              </tr>
            </tbody>
          </table>
        </header>

        <table className={styles.spgPersonGrid}>
          <tbody>
            <tr>
              <th scope="row">채용공고</th>
              <td colSpan={3}>{postSubject?.trim() || "(공고 제목 없음)"}</td>
              <td rowSpan={7} className={styles.spgPhotoCell}>
                {norm(data.re_img).trim() ? (
                  <button
                    type="button"
                    className={styles.spgPhotoBtn}
                    onClick={openProfilePhotoPreview}
                    aria-label="증명사진 크게 보기"
                  >
                    <img
                      src={recruitProfileImageUrl(norm(data.re_img))}
                      alt=""
                      className={styles.spgPhotoImg}
                      width={105}
                      height={133}
                    />
                  </button>
                ) : (
                  <div className={styles.spgPhotoPlaceholder}>(사진)</div>
                )}
              </td>
            </tr>
            <tr>
              <th scope="row">성명(한글)</th>
              <td>{textOrEmpty(norm(data.re_name))}</td>
              <th scope="row">성명(한자)</th>
              <td>{textOrEmpty(norm(data.re_name_cn))}</td>
            </tr>
            <tr>
              <th scope="row">성명(영문)</th>
              <td colSpan={3}>{textOrEmpty(norm(data.re_name_en))}</td>
            </tr>
            <tr>
              <th scope="row">생년월일</th>
              <td>{textOrEmpty(norm(data.re_birth))}</td>
              <th scope="row">성별</th>
              <td>{textOrEmpty(norm(data.re_sex))}</td>
            </tr>
            <tr>
              <th scope="row">휴대폰</th>
              <td>{textOrEmpty(norm(data.re_hp))}</td>
              <th scope="row">집전화</th>
              <td>{textOrEmpty(norm(data.re_tel))}</td>
            </tr>
            <tr>
              <th scope="row">이메일</th>
              <td colSpan={3}>{textOrEmpty(norm(data.re_email))}</td>
            </tr>
            <tr>
              <th scope="row">주소</th>
              <td colSpan={3} className={styles.spgAddrCell}>
                {textOrEmpty(
                  joinAddr(
                    norm(data.re_zip),
                    norm(data.re_addr1),
                    norm(data.re_addr2),
                    norm(data.re_addr3),
                    norm(data.re_addr_jibeon)
                  )
                )}
              </td>
            </tr>
          </tbody>
        </table>

      {step1Attachments ? (
        <section className={styles.spgSection}>
          <h2 className={styles.spgSectionTitle}>첨부자료</h2>
          {STEP1_ATTACHMENT_LABELS.map(({ key, label: blockTitle }) => {
            const list = step1Attachments[key] ?? [];
            return (
              <div key={key} className={`${styles.attachBlock} ${styles.spgAttachBlock}`}>
                <h3 className={styles.attachTitle}>{blockTitle}</h3>
                {list.length === 0 ? (
                  <p className={styles.empty}>(없음)</p>
                ) : (
                  <ul className={styles.attachList}>
                    {list.map((f, i) => {
                      const fileName = norm(f.pf_source) || norm(f.pf_file) || "(파일)";
                      const href = recruitUploadFilePublicUrl(f);
                      return (
                        <li key={f.pf_id ?? `${key}-${i}`}>
                          {href ? (
                            <button
                              type="button"
                              className={styles.attachPreviewBtn}
                              onClick={() => openAttachmentPreview(blockTitle, f)}
                            >
                              <span className={styles.attachPreviewName}>{fileName}</span>
                              <span className={styles.attachPreviewAction}>미리보기</span>
                            </button>
                          ) : (
                            <span className={styles.attachPreviewName}>{fileName}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </section>
      ) : null}

      <section className={styles.spgSection}>
        <h2 className={styles.spgSectionTitle}>학력사항</h2>
        {schoolRows.length === 0 ? (
          <p className={styles.empty}>(없음)</p>
        ) : (
          <table className={`${styles.spgTable} ${styles.spgTableCentered}`}>
            <thead>
              <tr>
                <th>기간</th>
                <th>학교명</th>
                <th>전공</th>
                <th>최종학력</th>
                <th>이수구분</th>
              </tr>
            </thead>
            <tbody>
              {schoolRows.map((r, i) => {
                const o = rowObj(r);
                const finalIdx = schoolRows.findIndex(
                  (x) => schoolFinalLabel(rowObj(x).last) === "최종학력"
                );
                const nameIdx = schoolRows.findIndex((x) => norm(rowObj(x).name).trim());
                const badgeIdx = finalIdx >= 0 ? finalIdx : nameIdx;
                const showRecent = norm(o.name).trim() && badgeIdx === i;
                return (
                  <tr key={i}>
                    <td>
                      {norm(o.sdate)} ~ {norm(o.edate)}
                    </td>
                    <td className={styles.spgTdName}>
                      {showRecent ? (
                        <span className={styles.spgRecentBadge} title="최종학력">
                          최근
                        </span>
                      ) : null}
                      {norm(o.name)}
                    </td>
                    <td>{norm(o.major)}</td>
                    <td>{schoolFinalLabel(o.last)}</td>
                    <td className={styles.spgTdChoices}>
                      <SchoolEndCircles end={norm(o.end)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className={styles.spgSection}>
        <h2 className={styles.spgSectionTitle}>병역사항</h2>
        <table className={styles.spgTable}>
          <tbody>
            <tr>
              <th>구분</th>
              <td>
                {armyType.trim() ? armyType : <span className={styles.empty}>(미입력)</span>}
              </td>
            </tr>
            <tr>
              <th>내용</th>
              <td>
                {armyCont.trim() ? (
                  <span className={styles.pre}>{armyCont}</span>
                ) : (
                  <span className={styles.empty}>(미입력)</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.spgSection}>
        <h2 className={styles.spgSectionTitle}>자격·면허</h2>
        {licenceRows.length === 0 ? (
          <p className={styles.empty}>(없음)</p>
        ) : (
          <table className={`${styles.spgTable} ${styles.spgTableCentered}`}>
            <thead>
              <tr>
                <th>취득일</th>
                <th>자격증·면허명</th>
                <th>등급</th>
                <th>발급기관</th>
              </tr>
            </thead>
            <tbody>
              {licenceRows.map((r, i) => {
                const o = rowObj(r);
                return (
                  <tr key={i}>
                    <td>{norm(o.date)}</td>
                    <td>{norm(o.name)}</td>
                    <td>{norm(o.grade)}</td>
                    <td>{norm(o.output) || norm(o.publisher)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className={styles.spgSection}>
        <h2 className={styles.spgSectionTitle}>경력사항</h2>
        {careerRows.length === 0 ? (
          <p className={styles.empty}>(없음)</p>
        ) : (
          <div className={styles.spgHorizScroll}>
            <table className={`${styles.spgTable} ${styles.spgTableCareer} ${styles.spgTableCentered}`}>
              <thead>
                <tr>
                  <th>업체명</th>
                  <th>근무기간</th>
                  <th>직위</th>
                  <th>근무부서</th>
                  <th>담당업무</th>
                  <th>급여</th>
                  <th>소재지</th>
                  <th>퇴사사유</th>
                  <th>노조유무</th>
                </tr>
              </thead>
              <tbody>
                {careerRows.map((r, i) => {
                  const o = rowObj(r);
                  const firstCareerIdx = careerRows.findIndex((x) => norm(rowObj(x).name).trim());
                  const showRecent =
                    norm(o.name).trim() && firstCareerIdx === i && careerRows.some((x) =>
                      norm(rowObj(x).name).trim()
                    );
                  return (
                    <tr key={i}>
                      <td className={styles.spgTdName}>
                        {showRecent ? (
                          <span className={styles.spgRecentBadge} title="가장 최근 경력">
                            최근
                          </span>
                        ) : null}
                        {norm(o.name)}
                      </td>
                      <td>
                        {norm(o.sdate)} ~ {norm(o.edate)}
                      </td>
                      <td>{norm(o.position)}</td>
                      <td>{norm(o.part)}</td>
                      <td className={styles.spgCareerCont}>{norm(o.cont)}</td>
                      <td>{norm(o.salary)}</td>
                      <td>{norm(o.location)}</td>
                      <td>{norm(o.reason)}</td>
                      <td>
                        <UnionCircles value={norm(o.union)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.spgSection}>
        <h2 className={styles.spgSectionTitle}>상벌사항</h2>
        <div className={styles.spgAwardSplit}>
          {[0, 1].map((half) => (
            <table key={half} className={`${styles.spgTable} ${styles.spgTableCentered} ${styles.spgAwardHalf}`}>
              <thead>
                <tr>
                  <th>상벌내용</th>
                  <th>일자</th>
                  <th>상벌기관</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }, (_, row) => {
                  const idx = half * 4 + row;
                  const r = awardRows[idx];
                  const o = r ? rowObj(r) : null;
                  return (
                    <tr key={row}>
                      <td>{o ? norm(o.cont) : "\u00a0"}</td>
                      <td>{o ? norm(o.date) : "\u00a0"}</td>
                      <td>{o ? norm(o.publisher) : "\u00a0"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ))}
        </div>
      </section>

      <section className={styles.spgSection}>
        <h2 className={styles.spgSectionTitle}>외국어</h2>
        {langRows.length === 0 ? (
          <p className={styles.empty}>(없음)</p>
        ) : (
          <table className={`${styles.spgTable} ${styles.spgTableCentered}`}>
            <thead>
              <tr>
                <th>언어</th>
                <th>독해</th>
                <th>작문</th>
                <th>회화</th>
              </tr>
            </thead>
            <tbody>
              {langRows.map((r, i) => {
                const o = rowObj(r);
                return (
                  <tr key={i}>
                    <td>{norm(o.name)}</td>
                    <td>{norm(o.reading)}</td>
                    <td>{norm(o.writing)}</td>
                    <td>{norm(o.talking)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className={styles.spgSection}>
        <h2 className={styles.spgSectionTitle}>OA 활용</h2>
        <table className={`${styles.spgTable} ${styles.spgTableCentered}`}>
          <tbody>
            {OA_LABELS.map((label, i) => (
              <tr key={label}>
                <th>{label}</th>
                <td>{norm(oaArr[i])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.spgSection}>
        <h2 className={styles.spgSectionTitle}>기타사항</h2>
        <table className={styles.spgTable}>
          <tbody>
            <tr>
              <th>통근방법</th>
              <td>{norm(add.trans)}</td>
            </tr>
            <tr>
              <th>과거병력</th>
              <td>{norm(add.disease)}</td>
            </tr>
            <tr>
              <th>보훈대상</th>
              <td>{norm(add.patriot)}</td>
            </tr>
            <tr>
              <th>장애여부</th>
              <td>{norm(add.disability)}</td>
            </tr>
            <tr>
              <th>연장근무</th>
              <td>{norm(add.over)}</td>
            </tr>
            <tr>
              <th>주야 교대근무</th>
              <td>{norm(add.change)}</td>
            </tr>
            <tr>
              <th>희망연봉(만원)</th>
              <td>{norm(add.salary)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.spgSection}>
        <h2 className={styles.spgSectionTitle}>면접소견 (인사팀 작성란)</h2>
        <table className={styles.spgTable}>
          <tbody>
            <tr>
              <th>면접일</th>
              <td colSpan={3} className={styles.spgBlankLine}>
                &nbsp;
              </td>
            </tr>
            <tr>
              <th>면접소견</th>
              <td colSpan={3} className={styles.spgTallBlank}>
                &nbsp;
              </td>
            </tr>
            <tr>
              <th>최종결정연봉</th>
              <td className={styles.spgBlankLine}>&nbsp;</td>
              <th>비고</th>
              <td className={styles.spgBlankLine}>&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </section>
      </div>

      <section className={`${styles.section} ${styles.docSectionProfile}`}>
        <div className={styles.docSheetHeader}>
          <div className={styles.docSheetHeaderLeft}>
            {norm(data.re_name)}
            {norm(data.re_sex) ? `(${norm(data.re_sex)})` : ""} {norm(data.re_hp)}
          </div>
          <div className={styles.docSheetHeaderRight}>
            <span className={styles.docSheetCo}>주식회사에스피지</span>
            <h2 className={styles.docSheetTitle}>자기소개서</h2>
          </div>
        </div>
        <hr className={styles.docSheetRule} />
        {PROFILE_LABELS.map((title, i) => {
          const k = `re_profile${i + 1}`;
          const val = norm(data[k]);
          return (
            <div key={k} className={styles.profileQBlock}>
              <div className={styles.profileQHead}>{title}</div>
              <div className={styles.profileQBody}>
                {val ? <p className={styles.pre}>{val}</p> : <p className={styles.empty}>(미입력)</p>}
              </div>
            </div>
          );
        })}
      </section>

      <section className={`${styles.section} ${styles.docSectionCareer}`}>
        <div className={styles.docSheetHeader}>
          <div className={styles.docSheetHeaderLeft}>
            {norm(data.re_name)}
            {norm(data.re_sex) ? `(${norm(data.re_sex)})` : ""} {norm(data.re_hp)}
          </div>
          <div className={styles.docSheetHeaderRight}>
            <span className={styles.docSheetCo}>주식회사에스피지</span>
            <h2 className={styles.docSheetTitle}>경력소개서</h2>
          </div>
        </div>
        <hr className={styles.docSheetRuleAccent} />
        {historyRows.length === 0 ? (
          <p className={styles.empty}>(없음)</p>
        ) : (
          historyRows.map((r, i) => {
            const o = rowObj(r);
            const hasName = Boolean(norm(o.name).trim());
            const firstNamedIdx = historyRows.findIndex((x) => norm(rowObj(x).name).trim());
            const showRecent = hasName && firstNamedIdx === i;
            return (
              <div key={i} className={styles.historyCard}>
                <table className={styles.historyTable}>
                  <tbody>
                    <tr>
                      <th>
                        회사명
                        {showRecent ? (
                          <span className={styles.historyRecentBadge} title="가장 최근 경력">
                            최근
                          </span>
                        ) : null}
                      </th>
                      <td>{norm(o.name)}</td>
                      <th>담당업무</th>
                      <td>{norm(o.job)}</td>
                    </tr>
                    <tr>
                      <th>근무기간</th>
                      <td colSpan={3}>
                        {norm(o.sdate)} ~ {norm(o.edate)} ( {norm(o.year)}년 {norm(o.month)}개월 )
                      </td>
                    </tr>
                    <tr>
                      <th className={styles.historyDetailTh}>세부경력 소개</th>
                      <td colSpan={3} className={styles.historyDetailTd}>
                        {norm(o.cont) ? <span className={styles.pre}>{norm(o.cont)}</span> : ""}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </section>
    </div>

    {attachmentPreview ? (
      <div
        className={styles.filePreviewBackdrop}
        role="presentation"
        onClick={() => setAttachmentPreview(null)}
      >
        <div
          className={styles.filePreviewCard}
          role="dialog"
          aria-modal="true"
          aria-labelledby="file-preview-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.filePreviewHeader}>
            <div>
              <p className={styles.filePreviewEyebrow}>{attachmentPreview.title}</p>
              <h3 id="file-preview-title" className={styles.filePreviewTitle}>
                {attachmentPreview.fileLabel}
              </h3>
            </div>
            <button
              type="button"
              className={styles.filePreviewClose}
              onClick={() => setAttachmentPreview(null)}
            >
              닫기
            </button>
          </div>
          <div className={styles.filePreviewBody}>
            {attachmentPreview.kind === "image" ? (
              <img
                src={attachmentPreview.url}
                alt={attachmentPreview.fileLabel}
                className={styles.filePreviewImage}
              />
            ) : attachmentPreview.kind === "pdf" ? (
              <iframe
                title={attachmentPreview.fileLabel}
                src={attachmentPreview.url}
                className={styles.filePreviewIframe}
              />
            ) : (
              <p className={styles.filePreviewOther}>
                이 형식은 여기서 바로 미리보기할 수 없습니다.{" "}
                <a href={attachmentPreview.url} target="_blank" rel="noreferrer">
                  새 창에서 열기
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    ) : null}
    </Fragment>
  );
}
