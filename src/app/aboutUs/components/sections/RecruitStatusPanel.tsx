"use client";

import {
  ApiError,
  getRecruitPosts,
  recruitAuthSearchApply,
  recruitGetApply,
  recruitStatusLabel,
  type RecruitPostListItem,
} from "@/api";
import { useCallback, useEffect, useState } from "react";
import styles from "./RecruitFlows.module.css";

function norm(v: unknown): string {
  return v == null ? "" : String(v);
}

export default function RecruitStatusPanel() {
  const [posts, setPosts] = useState<RecruitPostListItem[]>([]);
  const [wrId, setWrId] = useState(0);
  const [re_name, setRe_name] = useState("");
  const [re_hp, setRe_hp] = useState("");
  const [re_pwd, setRe_pwd] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [apply, setApply] = useState<Record<string, unknown> | null>(null);

  const loadPosts = useCallback(() => {
    void getRecruitPosts({ page: 1, rows: 200 })
      .then((r) => setPosts(r.list ?? []))
      .catch(() => setPosts([]));
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const search = async () => {
    if (wrId <= 0) {
      setErr("채용공고를 선택해 주세요.");
      return;
    }
    setBusy(true);
    setErr("");
    setApply(null);
    try {
      await recruitAuthSearchApply({
        wr_id: wrId,
        re_name: re_name.trim(),
        re_hp: re_hp.trim(),
        re_pwd,
      });
      const row = await recruitGetApply();
      setApply(row);
    } catch (e) {
      if (e instanceof ApiError) setErr(e.message);
      else setErr("조회에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.flow}>
      <h3 className={styles.flowTitle}>나의 지원현황</h3>
      <p className={styles.lead}>
        지원 시 입력한 <strong>이름·휴대폰·비밀번호</strong>로 제출 완료된 지원서를 조회합니다. (미제출
        건은 입사지원 탭에서 &quot;이어 작성&quot;을 이용해 주세요.)
      </p>

      {err ? <p className={styles.error}>{err}</p> : null}

      <div className={styles.authCard}>
        <div className={styles.row}>
          <div className={`${styles.field} ${styles.full}`}>
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
          <div className={styles.field}>
            <label>이름</label>
            <input value={re_name} onChange={(e) => setRe_name(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>휴대폰</label>
            <input value={re_hp} onChange={(e) => setRe_hp(e.target.value)} />
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <label>비밀번호</label>
            <input
              type="password"
              value={re_pwd}
              onChange={(e) => setRe_pwd(e.target.value)}
              autoComplete="current-password"
            />
          </div>
        </div>
        <button type="button" className={styles.btnPrimary} disabled={busy} onClick={() => void search()}>
          조회하기
        </button>
      </div>

      {apply ? (
        <div className={styles.readOnlyBox}>
          <h4 style={{ marginTop: 0 }}>지원서 요약</h4>
          <dl>
            <dt>지원번호</dt>
            <dd>{norm(apply.re_id)}</dd>
            <dt>진행상태</dt>
            <dd>{recruitStatusLabel(Number(apply.re_status))}</dd>
            <dt>지원 직무</dt>
            <dd>{norm(apply.re_work) || "—"}</dd>
            <dt>성명</dt>
            <dd>{norm(apply.re_name)}</dd>
            <dt>연락처</dt>
            <dd>{norm(apply.re_hp)}</dd>
            <dt>이메일</dt>
            <dd>{norm(apply.re_email)}</dd>
            <dt>제출일</dt>
            <dd>{norm(apply.re_applydate) || "—"}</dd>
            <dt>최종 수정</dt>
            <dd>{norm(apply.re_update) || "—"}</dd>
          </dl>
          <p className={styles.hint} style={{ marginTop: "1.5rem" }}>
            상세 수정·첨부 확인은 관리자 화면 또는 내부 절차에 따릅니다. 제출 완료 후에는 이 화면에서
            내용을 바꿀 수 없습니다.
          </p>
        </div>
      ) : null}
    </div>
  );
}
