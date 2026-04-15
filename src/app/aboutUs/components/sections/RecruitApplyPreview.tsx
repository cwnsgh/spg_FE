"use client";

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

export interface RecruitApplyPreviewProps {
  /** `recruitGetApply` / 작성 폼과 동일한 키를 가진 한 덩어의 지원서 객체 */
  data: Record<string, unknown>;
  /** 채용공고 제목 (선택) */
  postSubject?: string;
}

export default function RecruitApplyPreview({ data, postSubject }: RecruitApplyPreviewProps) {
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

  const textOrEmpty = (s: string) =>
    s.trim() ? <span className={styles.pre}>{s}</span> : <span className={styles.empty}>(미입력)</span>;

  return (
    <div className={styles.wrap}>
      <h1 className={styles.docTitle}>입 사 지 원 서</h1>

      <dl className={styles.meta}>
        <div className={styles.metaRow}>
          <dt className={styles.metaDt}>채용공고</dt>
          <dd className={styles.metaDd}>{postSubject?.trim() || "(공고 제목 없음)"}</dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaDt}>지원번호</dt>
          <dd className={styles.metaDd}>{norm(data.re_id) || "-"}</dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaDt}>응시구분</dt>
          <dd className={styles.metaDd}>{textOrEmpty(norm(data.re_work_type))}</dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaDt}>응시부서</dt>
          <dd className={styles.metaDd}>{textOrEmpty(norm(data.re_work))}</dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaDt}>성명</dt>
          <dd className={styles.metaDd}>{textOrEmpty(norm(data.re_name))}</dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaDt}>성명(한자)</dt>
          <dd className={styles.metaDd}>{textOrEmpty(norm(data.re_name_cn))}</dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaDt}>성명(영문)</dt>
          <dd className={styles.metaDd}>{textOrEmpty(norm(data.re_name_en))}</dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaDt}>생년월일</dt>
          <dd className={styles.metaDd}>{textOrEmpty(norm(data.re_birth))}</dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaDt}>성별</dt>
          <dd className={styles.metaDd}>{textOrEmpty(norm(data.re_sex))}</dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaDt}>휴대폰</dt>
          <dd className={styles.metaDd}>{textOrEmpty(norm(data.re_hp))}</dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaDt}>집전화</dt>
          <dd className={styles.metaDd}>{textOrEmpty(norm(data.re_tel))}</dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaDt}>이메일</dt>
          <dd className={styles.metaDd}>{textOrEmpty(norm(data.re_email))}</dd>
        </div>
        <div className={styles.metaRow} style={{ gridColumn: "1 / -1" }}>
          <dt className={styles.metaDt}>주소</dt>
          <dd className={styles.metaDd}>
            {textOrEmpty(
              joinAddr(
                norm(data.re_zip),
                norm(data.re_addr1),
                norm(data.re_addr2),
                norm(data.re_addr3),
                norm(data.re_addr_jibeon)
              )
            )}
          </dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaDt}>증명사진 파일</dt>
          <dd className={styles.metaDd}>{textOrEmpty(norm(data.re_img))}</dd>
        </div>
      </dl>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>학력사항</h2>
        {schoolRows.length === 0 ? (
          <p className={styles.empty}>(없음)</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>기간</th>
                <th>학교명</th>
                <th>전공</th>
                <th>구분</th>
                <th>졸업여부</th>
              </tr>
            </thead>
            <tbody>
              {schoolRows.map((r, i) => {
                const o = rowObj(r);
                return (
                  <tr key={i}>
                    <td>
                      {norm(o.sdate)} ~ {norm(o.edate)}
                    </td>
                    <td>{norm(o.name)}</td>
                    <td>{norm(o.major)}</td>
                    <td>{norm(o.last)}</td>
                    <td>{norm(o.end)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>병역사항</h2>
        <table className={styles.table}>
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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>자격면허</h2>
        {licenceRows.length === 0 ? (
          <p className={styles.empty}>(없음)</p>
        ) : (
          licenceRows.map((r, i) => {
            const o = rowObj(r);
            return (
              <div key={i} className={styles.listCard}>
                <table className={styles.table}>
                  <tbody>
                    <tr>
                      <th>취득일</th>
                      <td>{norm(o.date)}</td>
                    </tr>
                    <tr>
                      <th>자격증/면허명</th>
                      <td>{norm(o.name)}</td>
                    </tr>
                    <tr>
                      <th>등급</th>
                      <td>{norm(o.grade)}</td>
                    </tr>
                    <tr>
                      <th>발급구분</th>
                      <td>{norm(o.output) || norm(o.publisher)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>경력사항</h2>
        {careerRows.length === 0 ? (
          <p className={styles.empty}>(없음)</p>
        ) : (
          careerRows.map((r, i) => {
            const o = rowObj(r);
            return (
              <div key={i} className={styles.listCard}>
                <table className={styles.table}>
                  <tbody>
                    <tr>
                      <th>업체명</th>
                      <td>{norm(o.name)}</td>
                    </tr>
                    <tr>
                      <th>근무기간</th>
                      <td>
                        {norm(o.sdate)} ~ {norm(o.edate)}
                      </td>
                    </tr>
                    <tr>
                      <th>직위</th>
                      <td>{norm(o.position)}</td>
                    </tr>
                    <tr>
                      <th>근무부서</th>
                      <td>{norm(o.part)}</td>
                    </tr>
                    <tr>
                      <th>담당업무</th>
                      <td>{norm(o.cont)}</td>
                    </tr>
                    <tr>
                      <th>연봉(만원)</th>
                      <td>{norm(o.salary)}</td>
                    </tr>
                    <tr>
                      <th>소재지</th>
                      <td>{norm(o.location)}</td>
                    </tr>
                    <tr>
                      <th>퇴사사유</th>
                      <td>{norm(o.reason)}</td>
                    </tr>
                    <tr>
                      <th>노조유무</th>
                      <td>{norm(o.union)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>상벌사항</h2>
        {awardRows.length === 0 ? (
          <p className={styles.empty}>(없음)</p>
        ) : (
          awardRows.map((r, i) => {
            const o = rowObj(r);
            return (
              <div key={i} className={styles.listCard}>
                <table className={styles.table}>
                  <tbody>
                    <tr>
                      <th>상벌내용</th>
                      <td>{norm(o.cont)}</td>
                    </tr>
                    <tr>
                      <th>일자</th>
                      <td>{norm(o.date)}</td>
                    </tr>
                    <tr>
                      <th>상벌기관</th>
                      <td>{norm(o.publisher)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>외국어</h2>
        {langRows.length === 0 ? (
          <p className={styles.empty}>(없음)</p>
        ) : (
          <table className={styles.table}>
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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>OA 활용</h2>
        <table className={styles.table}>
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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>기타사항</h2>
        <table className={styles.table}>
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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>자기소개서</h2>
        {PROFILE_LABELS.map((title, i) => {
          const k = `re_profile${i + 1}`;
          const val = norm(data[k]);
          return (
            <div key={k} className={styles.listCard}>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.35rem", fontWeight: 700 }}>{title}</h3>
              {val ? <p className={styles.pre}>{val}</p> : <p className={styles.empty}>(미입력)</p>}
            </div>
          );
        })}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>경력소개서</h2>
        {historyRows.length === 0 ? (
          <p className={styles.empty}>(없음)</p>
        ) : (
          historyRows.map((r, i) => {
            const o = rowObj(r);
            return (
              <div key={i} className={styles.listCard}>
                <table className={styles.table}>
                  <tbody>
                    <tr>
                      <th>회사명</th>
                      <td>{norm(o.name)}</td>
                    </tr>
                    <tr>
                      <th>담당업무</th>
                      <td>{norm(o.job)}</td>
                    </tr>
                    <tr>
                      <th>근무기간</th>
                      <td>
                        {norm(o.sdate)} ~ {norm(o.edate)} ( {norm(o.year)}년 {norm(o.month)}개월 )
                      </td>
                    </tr>
                    <tr>
                      <th>세부경력</th>
                      <td>{norm(o.cont) ? <span className={styles.pre}>{norm(o.cont)}</span> : ""}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
