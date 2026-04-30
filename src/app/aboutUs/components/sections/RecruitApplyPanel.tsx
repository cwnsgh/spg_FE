"use client";

/**
 * 채용 지원 플로우 진입(공고 선택·비밀번호·마법사 래핑). 사용처: `Recruitment.tsx`.
 */
import {
  ApiError,
  getRecruitPosts,
  recruitAuthApplyAgree,
  recruitAuthSearchDoc,
  type RecruitPostListItem,
} from "@/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import RecruitApplyWizard from "./RecruitApplyWizard";
import styles from "./RecruitFlows.module.css";
import {
  isValidRecruitPassword,
  RECRUIT_PASSWORD_HINT,
  RECRUIT_PASSWORD_MAX,
  RECRUIT_PASSWORD_MIN,
} from "./recruitFormRules";
import { RECRUIT_PRIVACY_CONSENT_FULL_TEXT } from "./recruitPrivacyConsent";

interface Props {
  initialWrId: number | null;
  onConsumedInitial: () => void;
}

export default function RecruitApplyPanel({ initialWrId, onConsumedInitial }: Props) {
  const [posts, setPosts] = useState<RecruitPostListItem[]>([]);
  const [wrId, setWrId] = useState(0);
  const [phase, setPhase] = useState<"pick" | "new" | "resume" | "form">("pick");

  const [newForm, setNewForm] = useState({
    re_name: "",
    re_hp: "",
    re_email: "",
    re_birth: "",
    re_pwd: "",
    re_pwd_confirm: "",
  });
  const [resumeForm, setResumeForm] = useState({
    re_name: "",
    re_hp: "",
    re_pwd: "",
  });
  const [privacyConsent, setPrivacyConsent] = useState({
    collectUse: false,
    uniqueId: false,
    sensitive: false,
    destroyDocs: false,
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const allPrivacyAgreed = useMemo(
    () =>
      privacyConsent.collectUse &&
      privacyConsent.uniqueId &&
      privacyConsent.sensitive &&
      privacyConsent.destroyDocs,
    [privacyConsent]
  );

  const resetPrivacyConsent = useCallback(() => {
    setPrivacyConsent({
      collectUse: false,
      uniqueId: false,
      sensitive: false,
      destroyDocs: false,
    });
  }, []);

  const loadPosts = useCallback(() => {
    void getRecruitPosts({ page: 1, rows: 200 })
      .then((r) => setPosts(r.list ?? []))
      .catch(() => setPosts([]));
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (initialWrId && initialWrId > 0) {
      setWrId(initialWrId);
      onConsumedInitial();
    }
  }, [initialWrId, onConsumedInitial]);

  const submitNew = async () => {
    if (wrId <= 0) {
      setErr("채용공고를 선택해 주세요.");
      return;
    }
    if (!allPrivacyAgreed) {
      setErr("개인정보 처리에 대한 필수 동의를 모두 선택해 주세요.");
      return;
    }
    if (!isValidRecruitPassword(newForm.re_pwd)) {
      setErr(`비밀번호는 ${RECRUIT_PASSWORD_HINT}로 입력해 주세요.`);
      return;
    }
    if (newForm.re_pwd !== newForm.re_pwd_confirm) {
      setErr("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await recruitAuthApplyAgree({
        wr_id: wrId,
        re_name: newForm.re_name.trim(),
        re_hp: newForm.re_hp.trim(),
        re_email: newForm.re_email.trim(),
        re_birth: newForm.re_birth.trim(),
        re_pwd: newForm.re_pwd,
        re_pwd_confirm: newForm.re_pwd_confirm,
      });
      setPhase("form");
    } catch (e) {
      if (e instanceof ApiError) setErr(e.message);
      else setErr("신규 지원을 시작하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const submitResume = async () => {
    if (wrId <= 0) {
      setErr("채용공고를 선택해 주세요.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await recruitAuthSearchDoc({
        wr_id: wrId,
        re_name: resumeForm.re_name.trim(),
        re_hp: resumeForm.re_hp.trim(),
        re_pwd: resumeForm.re_pwd,
      });
      setPhase("form");
    } catch (e) {
      if (e instanceof ApiError) setErr(e.message);
      else setErr("지원서를 불러오지 못했습니다.");
    } finally {
      setBusy(false);
    }
  };

  if (phase === "form" && wrId > 0) {
    return (
      <RecruitApplyWizard
        wrId={wrId}
        onExit={() => {
          setPhase("pick");
        }}
      />
    );
  }

  return (
    <div className={styles.flow}>
      <h3 className={styles.flowTitle}>입사지원</h3>
      <p className={styles.lead}>
        공고를 선택한 뒤 <strong>신규 지원</strong>(최초 작성) 또는{" "}
        <strong>이어 작성</strong>(임시저장 분)을 선택하세요. 인증은 휴대폰 번호와 비밀번호를
        사용합니다.
      </p>

      {err ? <p className={styles.error}>{err}</p> : null}

      <div className={`${styles.field} ${styles.full}`} style={{ marginBottom: "2rem" }}>
        <label>채용공고</label>
        <select value={wrId || ""} onChange={(e) => setWrId(Number(e.target.value))}>
          <option value="">선택</option>
          {posts.map((p) => (
            <option key={p.id} value={p.id}>
              [{p.status}] {p.subject}
            </option>
          ))}
        </select>
      </div>

      {phase === "pick" && (
        <div className={styles.stack}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => {
              setErr("");
              resetPrivacyConsent();
              setPhase("new");
            }}
          >
            신규 지원하기
          </button>
          <button
            type="button"
            className={styles.btn}
            onClick={() => {
              setErr("");
              setPhase("resume");
            }}
          >
            이어 작성하기
          </button>
        </div>
      )}

      {phase === "new" && (
        <div className={styles.authCard}>
          <h4>신규 지원 — 개인정보 동의·기본 정보</h4>

          <p className={styles.consentSectionTitle}>개인정보 수집·이용·제공 동의서</p>
          <div className={styles.consentScroll}>{RECRUIT_PRIVACY_CONSENT_FULL_TEXT}</div>

          <label className={styles.consentMaster}>
            <input
              type="checkbox"
              checked={allPrivacyAgreed}
              onChange={(e) => {
                const v = e.target.checked;
                setPrivacyConsent({
                  collectUse: v,
                  uniqueId: v,
                  sensitive: v,
                  destroyDocs: v,
                });
              }}
            />
            전체 약관에 동의합니다.
          </label>

          <div className={styles.consentChecks}>
            <label className={styles.consentCheck}>
              <input
                type="checkbox"
                checked={privacyConsent.collectUse}
                onChange={(e) =>
                  setPrivacyConsent((p) => ({ ...p, collectUse: e.target.checked }))
                }
              />
              <span>개인정보 수집·이용·제공에 동의합니다. (필수)</span>
            </label>
            <label className={styles.consentCheck}>
              <input
                type="checkbox"
                checked={privacyConsent.uniqueId}
                onChange={(e) =>
                  setPrivacyConsent((p) => ({ ...p, uniqueId: e.target.checked }))
                }
              />
              <span>고유식별정보를 수집·이용하는 것에 동의합니다. (필수)</span>
            </label>
            <label className={styles.consentCheck}>
              <input
                type="checkbox"
                checked={privacyConsent.sensitive}
                onChange={(e) =>
                  setPrivacyConsent((p) => ({ ...p, sensitive: e.target.checked }))
                }
              />
              <span>민감정보를 수집·이용하는 것에 동의합니다. (필수)</span>
            </label>
            <label className={styles.consentCheck}>
              <input
                type="checkbox"
                checked={privacyConsent.destroyDocs}
                onChange={(e) =>
                  setPrivacyConsent((p) => ({ ...p, destroyDocs: e.target.checked }))
                }
              />
              <span>
                채용여부 확정 후 제출한 입사지원서 등은 파기에 동의 합니다. (필수)
              </span>
            </label>
          </div>

          {!allPrivacyAgreed ? (
            <p className={styles.consentLockedHint}>
              위 필수 동의 4항목을 모두 선택한 뒤에만 기본 정보 입력과 지원 시작이 가능합니다.
            </p>
          ) : null}

          <h4 className={styles.consentSectionTitle}>기본 정보</h4>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>이름</label>
              <input
                value={newForm.re_name}
                disabled={!allPrivacyAgreed}
                onChange={(e) => setNewForm({ ...newForm, re_name: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label>휴대폰</label>
              <input
                value={newForm.re_hp}
                disabled={!allPrivacyAgreed}
                onChange={(e) => setNewForm({ ...newForm, re_hp: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label>이메일</label>
              <input
                type="email"
                value={newForm.re_email}
                disabled={!allPrivacyAgreed}
                onChange={(e) => setNewForm({ ...newForm, re_email: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label>생년월일</label>
              <input
                type="date"
                value={newForm.re_birth}
                disabled={!allPrivacyAgreed}
                onChange={(e) => setNewForm({ ...newForm, re_birth: e.target.value })}
              />
              <p className={styles.hint}>달력에서 선택해 주세요.</p>
            </div>
            <div className={styles.field}>
              <label>비밀번호 ({RECRUIT_PASSWORD_HINT})</label>
              <input
                type="password"
                value={newForm.re_pwd}
                disabled={!allPrivacyAgreed}
                onChange={(e) => setNewForm({ ...newForm, re_pwd: e.target.value })}
                autoComplete="new-password"
                minLength={RECRUIT_PASSWORD_MIN}
                maxLength={RECRUIT_PASSWORD_MAX}
                title={`${RECRUIT_PASSWORD_HINT}`}
              />
            </div>
            <div className={styles.field}>
              <label>비밀번호 확인</label>
              <input
                type="password"
                value={newForm.re_pwd_confirm}
                disabled={!allPrivacyAgreed}
                onChange={(e) => setNewForm({ ...newForm, re_pwd_confirm: e.target.value })}
                autoComplete="new-password"
                minLength={RECRUIT_PASSWORD_MIN}
                maxLength={RECRUIT_PASSWORD_MAX}
                title={`${RECRUIT_PASSWORD_HINT}`}
              />
            </div>
          </div>
          <div className={styles.stack}>
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={busy || !allPrivacyAgreed}
              onClick={() => void submitNew()}
            >
              시작하기
            </button>
            <button
              type="button"
              className={styles.btn}
              onClick={() => {
                setPhase("pick");
                setErr("");
                resetPrivacyConsent();
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {phase === "resume" && (
        <div className={styles.authCard}>
          <h4>이어 작성 — 인증</h4>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>이름</label>
              <input
                value={resumeForm.re_name}
                onChange={(e) =>
                  setResumeForm({ ...resumeForm, re_name: e.target.value })
                }
              />
            </div>
            <div className={styles.field}>
              <label>휴대폰</label>
              <input
                value={resumeForm.re_hp}
                onChange={(e) =>
                  setResumeForm({ ...resumeForm, re_hp: e.target.value })
                }
              />
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label>비밀번호</label>
              <input
                type="password"
                value={resumeForm.re_pwd}
                onChange={(e) =>
                  setResumeForm({ ...resumeForm, re_pwd: e.target.value })
                }
                autoComplete="current-password"
              />
            </div>
          </div>
          <div className={styles.stack}>
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={busy}
              onClick={() => void submitResume()}
            >
              지원서 불러오기
            </button>
            <button
              type="button"
              className={styles.btn}
              onClick={() => {
                setPhase("pick");
                setErr("");
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
