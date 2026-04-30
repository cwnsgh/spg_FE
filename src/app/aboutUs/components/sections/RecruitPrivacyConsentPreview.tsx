/**
 * 개인정보 동의서 미리보기 UI. 사용처: `RecruitApplyPreview.tsx`.
 */
import styles from "./RecruitPrivacyConsentPreview.module.css";

function norm(v: unknown): string {
  return v == null ? "" : String(v);
}

function formatKoreanDate(v: unknown): string {
  const s = norm(v).trim().slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) {
    return `${m[1]}년 ${Number(m[2])}월 ${Number(m[3])}일`;
  }
  const s2 = norm(v).trim();
  return s2 || "—";
}

function CheckAgreed() {
  return (
    <span className={styles.consentOpt}>
      <span className={styles.consentBox} aria-hidden>
        ✓
      </span>
      동의함
    </span>
  );
}

function CheckEmpty() {
  return (
    <span className={styles.consentOpt}>
      <span className={styles.consentBox} aria-hidden />
      동의하지 않음
    </span>
  );
}

function UncheckedOption({ label }: { label: string }) {
  return (
    <span className={styles.consentOpt}>
      <span className={styles.consentBox} aria-hidden />
      {label}
    </span>
  );
}

export default function RecruitPrivacyConsentPreview({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const applicantName = norm(data.re_name).trim() || "—";
  const signDate = formatKoreanDate(data.re_applydate || data.re_update);

  return (
    <section className={styles.consentDoc} aria-label="개인정보 수집·이용·제공 동의서">
      <h2 className={styles.consentHeroTitle}>개인정보 수집·이용·제공 동의서</h2>
      <p className={styles.consentIntro}>
        (주)에스피지와의 채용절차와 관련하여 귀사가 본인의 개인정보를 수집·이용하거나 제3자에게
        제공하고자 하는 경우에는 「개인정보보호법」에 따라 본인의 동의를 얻어야 합니다.
      </p>

      <table className={styles.consentGrid}>
        <tbody>
          <tr>
            <th scope="row">목적</th>
            <td>
              채용절차의 진행 및 관리, 경력·자격 등 확인(조회 및 검증), 채용여부의 결정, 민원처리,
              분쟁해결, 법령상 의무이행, 우선채용대상 자격 판단
            </td>
          </tr>
          <tr>
            <th scope="row">수집항목</th>
            <td>
              <strong>■ 필수적 정보: 개인식별정보</strong>
              <br />
              성명, <span className={styles.consentEm}>생년월일</span> 등 고유식별정보, 국적, 주소 및
              거주지, 이메일 주소, 전화번호, 휴대폰 번호 등 연락처
              <br />
              <br />
              <strong>■ 선택적 정보: 개인식별정보 외에 입사지원서 등에 제공한 정보</strong>
              <br />
              학력사항, 외국어사항, 자격사항, 보훈/장애관련정보, 리더십 및 사회봉사활동 관련정보,
              경력사항, 평판조회를 위한 추천인 정보, 귀사 내 친척·지인 관계 정보, 지원경로, 자기소개
              관련정보, 기타 채용을 위해 본인이 작성한 관련정보 등
            </td>
          </tr>
          <tr>
            <th scope="row">보유·이용 기간</th>
            <td>
              위 개인정보는 수집·이용에 관한 동의일로부터 3년 동안 위 이용목적을 위하여 보유·이용됩니다.
              단, 위 기간 경과 또는 지원자가 근로계약 체결을 거절할 경우에는 민원처리, 분쟁해결, 법령상
              의무이행을 위하여 필요한 범위 내에서만 보유·이용됩니다.
            </td>
          </tr>
          <tr>
            <th scope="row">동의 거부 시 불이익</th>
            <td>
              위 개인정보 중 필수적 정보의 수집·이용에 관한 동의는 채용심사를 위하여 필수적이므로, 위
              사항에 동의하셔야만 채용심사 및 근로계약의 체결이 가능합니다. 선택적 정보의 수집·이용에
              관한 동의는 거부하실 수 있으며, 다만 동의하지 않으시는 경우 채용심사 시 불이익을 받으실
              수 있습니다.
            </td>
          </tr>
          <tr className={styles.consentCheckRow}>
            <th scope="row">수집·이용 동의</th>
            <td>
              <p className={styles.consentCheckLabel}>
                귀사가 위와 같이 본인의 개인정보를 수집·이용하는 것에 동의합니다.
              </p>
              <div className={styles.consentCheckOpts}>
                <span className={styles.consentCheckLabel} style={{ marginBottom: 0 }}>
                  (필수)
                </span>
                <CheckAgreed />
                <CheckEmpty />
              </div>
              <div className={styles.consentCheckOpts} style={{ marginTop: "0.75rem" }}>
                <span className={styles.consentCheckLabel} style={{ marginBottom: 0 }}>
                  (선택)
                </span>
                <UncheckedOption label="동의함" />
                <UncheckedOption label="동의하지 않음" />
              </div>
            </td>
          </tr>
          <tr className={styles.consentCheckRow}>
            <th scope="row">고유식별정보</th>
            <td>
              <p className={styles.consentCheckLabel}>
                귀사가 위 목적으로 다음과 같은 본인의 고유식별정보를 수집·이용하는 것에 동의합니다.
                <br />
                고유식별정보: 주민등록번호, 운전면허번호, 외국인등록번호, 여권번호
              </p>
              <div className={styles.consentCheckOpts}>
                <CheckAgreed />
                <CheckEmpty />
              </div>
            </td>
          </tr>
          <tr className={styles.consentCheckRow}>
            <th scope="row">
              민감정보
              <br />
              동의
            </th>
            <td>
              <p className={styles.consentCheckLabel}>
                귀사가 위 목적으로 다음과 같은 본인의 민감정보를 수집·이용하는 것에 동의합니다.
                <br />
                <span className={styles.consentEm}>
                  민감정보: 장애 등 병력사항, 국가보훈대상, 범죄 경력, 병역 이행(면제)사유, 노조가입여부
                </span>
              </p>
              <div className={styles.consentCheckOpts}>
                <CheckAgreed />
                <CheckEmpty />
              </div>
            </td>
          </tr>
          <tr className={styles.consentCheckRow}>
            <th scope="row">서류 파기</th>
            <td>
              <p className={styles.consentCheckLabel}>
                채용여부 확정 후 구직자가 제출한 입사지원서 등은 즉시 파기하는 것에 동의합니다.
              </p>
              <div className={styles.consentCheckOpts}>
                <CheckAgreed />
                <CheckEmpty />
              </div>
            </td>
          </tr>
          <tr className={styles.consentCheckRow}>
            <th scope="row">제3자 제공</th>
            <td>
              <p className={styles.consentCheckLabel}>
                채용절차상 필요한 범위에서 개인정보가 제3자에게 제공되는 경우, 관련 법령에 따라
                안내된 목적과 절차에 따라 제공됨에 동의합니다.
              </p>
              <div className={styles.consentCheckOpts}>
                <CheckAgreed />
                <CheckEmpty />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className={styles.consentFooter} role="presentation">
        <div className={styles.consentFooterLabel}>
          이름
          <br />
          NAME
        </div>
        <div className={styles.consentFooterValue}>
          {applicantName}
          <span style={{ marginLeft: "0.5rem", color: "#555" }}>(서명)</span>
        </div>
        <div className={styles.consentFooterLabel}>
          날짜
          <br />
          DATE
        </div>
        <div className={styles.consentFooterValue}>{signDate}</div>
      </div>
    </section>
  );
}
