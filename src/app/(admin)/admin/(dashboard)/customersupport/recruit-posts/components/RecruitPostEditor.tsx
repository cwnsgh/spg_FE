"use client";

/**
 * 관리자 채용공고 작성·수정·미리보기. 사용처: `recruit-posts/new`, `recruit-posts/edit` page.
 */
import {
  ApiError,
  deleteAdminRecruitManagePosts,
  getAdminRecruitManagePost,
  getAdminRecruitManagePosts,
  RECRUIT_POST_TYPE_OPTIONS,
  normalizeAdminRecruitPositionRows,
  saveAdminRecruitManagePost,
  type AdminRecruitPositionRow,
  type RecruitManageFilterOption,
} from "@/api";
import recruitModalStyles from "@/app/aboutUs/components/sections/Recruitment.module.css";
import { buildRecruitPreviewDetail } from "@/components/recruit/buildRecruitPreviewDetail";
import RecruitPostDetailView from "@/components/recruit/RecruitPostDetailView";
import { useOverlayDismiss } from "@/hooks/useOverlayDismiss";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./RecruitPostEditor.module.css";

const emptyPosition = (): AdminRecruitPositionRow => ({
  job: "",
  count: "00",
  work_type: "",
  business: "",
  content: "",
  required: "",
  location: "",
});

export interface RecruitPostEditorProps {
  /** `null` 이면 신규 등록 */
  wrId: number | null;
}

export default function RecruitPostEditor({ wrId }: RecruitPostEditorProps) {
  const router = useRouter();
  const isNew = wrId === null;
  const wrIdNum = wrId ?? 0;

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [useOptions, setUseOptions] = useState<RecruitManageFilterOption[]>([
    { value: "사용", label: "사용" },
    { value: "미사용", label: "미사용" },
  ]);
  const [typeOptions, setTypeOptions] = useState<RecruitManageFilterOption[]>(
    RECRUIT_POST_TYPE_OPTIONS
  );

  const [useYn, setUseYn] = useState("사용");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("무관");
  const [isAlways, setIsAlways] = useState(true);
  const [displayStart, setDisplayStart] = useState("");
  const [displayEnd, setDisplayEnd] = useState("");
  const [recruitStart, setRecruitStart] = useState("");
  const [recruitEnd, setRecruitEnd] = useState("");
  const [notice, setNotice] = useState("");
  const [applyMethod, setApplyMethod] = useState("");
  const [process, setProcess] = useState("");
  const [contact, setContact] = useState("");
  const [orderNo, setOrderNo] = useState(0);
  const [positions, setPositions] = useState<AdminRecruitPositionRow[]>([
    emptyPosition(),
  ]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmPositionDeleteIndex, setConfirmPositionDeleteIndex] = useState<
    number | null
  >(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const closePreview = useCallback(() => setPreviewOpen(false), []);
  const { handleOverlayMouseDown, handleOverlayClick } =
    useOverlayDismiss(closePreview);

  const closeConfirmPositionDelete = useCallback(
    () => setConfirmPositionDeleteIndex(null),
    []
  );
  const {
    handleOverlayMouseDown: handleDeleteConfirmOverlayMouseDown,
    handleOverlayClick: handleDeleteConfirmOverlayClick,
  } = useOverlayDismiss(closeConfirmPositionDelete);

  useEffect(() => {
    if (!previewOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;
    const gutter = window.innerWidth - html.clientWidth;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (gutter > 0) {
      body.style.paddingRight = `${gutter}px`;
    }

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
    };
  }, [previewOpen]);

  useEffect(() => {
    if (confirmPositionDeleteIndex === null) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;
    const gutter = window.innerWidth - html.clientWidth;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (gutter > 0) {
      body.style.paddingRight = `${gutter}px`;
    }

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
    };
  }, [confirmPositionDeleteIndex]);

  const previewDetail = useMemo(
    () =>
      buildRecruitPreviewDetail({
        subject,
        content: "",
        type,
        isAlways,
        recruitStart,
        recruitEnd,
        notice,
        applyMethod,
        process,
        contact,
        positions,
      }),
    [
      subject,
      type,
      isAlways,
      recruitStart,
      recruitEnd,
      notice,
      applyMethod,
      process,
      contact,
      positions,
    ]
  );

  const loadOptionsForNew = useCallback(async () => {
    try {
      const res = await getAdminRecruitManagePosts({ page: 1, limit: 1 });
      if (res.filter_options?.use_options?.length) {
        setUseOptions(res.filter_options.use_options);
      }
    } catch {
      /* 기본값 유지 */
    }
  }, []);

  const loadDetail = useCallback(async () => {
    if (isNew || !wrIdNum) return;
    setLoading(true);
    setError("");
    try {
      const data = await getAdminRecruitManagePost(wrIdNum);
      setUseYn(data.use_yn || "사용");
      setSubject(data.subject || "");
      setType(data.type || "무관");
      setIsAlways(Boolean(data.is_always));
      setDisplayStart(data.display_period?.start ?? "");
      setDisplayEnd(data.display_period?.end ?? "");
      setRecruitStart(data.recruit_period?.start ?? "");
      setRecruitEnd(data.recruit_period?.end ?? "");
      setNotice(data.notice ?? "");
      setApplyMethod(data.apply_method ?? "");
      setProcess(data.process ?? "");
      setContact(data.contact ?? "");
      setOrderNo(Number(data.order_no) || 0);
      const rawPositions = normalizeAdminRecruitPositionRows(data.positions);
      const pos = rawPositions.length > 0 ? rawPositions : [emptyPosition()];
      setPositions(pos.map((p) => ({ ...emptyPosition(), ...p })));
      if (data.options?.use_options?.length)
        setUseOptions(data.options.use_options);
      if (data.options?.type_options?.length)
        setTypeOptions(data.options.type_options);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("공고를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [isNew, wrIdNum]);

  useEffect(() => {
    if (isNew) {
      void loadOptionsForNew();
      setLoading(false);
      return;
    }
    if (!wrIdNum || Number.isNaN(wrIdNum)) {
      setError("잘못된 공고 번호입니다.");
      setLoading(false);
      return;
    }
    void loadDetail();
  }, [isNew, wrIdNum, loadDetail, loadOptionsForNew]);

  const updatePosition = (
    index: number,
    patch: Partial<AdminRecruitPositionRow>
  ) => {
    setPositions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const addPosition = () => setPositions((p) => [...p, emptyPosition()]);

  const removePositionAt = (index: number) => {
    setPositions((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const requestRemovePosition = (index: number) => {
    if (positions.length <= 1) return;
    setConfirmPositionDeleteIndex(index);
  };

  const confirmRemovePosition = () => {
    if (confirmPositionDeleteIndex === null) return;
    const index = confirmPositionDeleteIndex;
    setConfirmPositionDeleteIndex(null);
    removePositionAt(index);
  };

  const movePosition = (index: number, dir: -1 | 1) => {
    setPositions((prev) => {
      const nextIndex = index + dir;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const validate = (): string | null => {
    if (!subject.trim()) return "공고 제목을 입력해주세요.";
    const filled = positions.filter((p) => p.job.trim());
    if (filled.length === 0) return "모집 직무를 1건 이상 입력해주세요.";
    if (!isAlways) {
      if (!displayStart.trim() || !displayEnd.trim())
        return "상시접수가 아닌 경우 노출기간을 입력해주세요.";
      if (!recruitStart.trim() || !recruitEnd.trim())
        return "상시접수가 아닌 경우 접수기간을 입력해주세요.";
    }
    return null;
  };

  const buildPayload = () => {
    const pos = positions
      .filter((p) => p.job.trim())
      .map((p) => ({
        job: p.job.trim(),
        count: p.count?.trim() || "00",
        work_type: p.work_type?.trim() ?? "",
        business: p.business?.trim() ?? "",
        content: p.content?.trim() ?? "",
        required: p.required?.trim() ?? "",
        location: p.location?.trim() ?? "",
      }));
    return {
      mode: isNew ? ("create" as const) : ("update" as const),
      ...(isNew ? {} : { wr_id: wrIdNum }),
      use_yn: useYn,
      subject: subject.trim(),
      content: subject.trim(),
      type,
      is_always: isAlways,
      display_period: { start: displayStart.trim(), end: displayEnd.trim() },
      recruit_period: { start: recruitStart.trim(), end: recruitEnd.trim() },
      notice: notice.trim(),
      apply_method: applyMethod.trim(),
      process: process.trim(),
      contact: contact.trim(),
      order_no: Number(orderNo) || 0,
      positions: pos,
    };
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveAdminRecruitManagePost(buildPayload());
      router.replace("/admin/customersupport/recruit-posts");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (isNew || !wrIdNum) return;
    const ok = window.confirm(
      "이 공고와 연결된 모든 지원서·첨부가 삭제됩니다. 정말 삭제할까요?"
    );
    if (!ok) return;
    setSaving(true);
    setError("");
    try {
      await deleteAdminRecruitManagePosts([wrIdNum]);
      router.replace("/admin/customersupport/recruit-posts");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("삭제에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const pageHeading = useMemo(
    () => (isNew ? "새 채용공고" : `공고 수정 #${wrIdNum}`),
    [isNew, wrIdNum]
  );

  if (!isNew && (!wrIdNum || Number.isNaN(wrIdNum))) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBox}>잘못된 경로입니다.</div>
        <Link
          href="/admin/customersupport/recruit-posts"
          className={styles.backLink}
        >
          ← 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.backRow}>
        <Link
          href="/admin/customersupport/recruit-posts"
          className={styles.backLink}
        >
          ← 목록으로
        </Link>
      </div>
      <div>
        <h1 className={styles.pageTitle}>{pageHeading}</h1>
        <p className={styles.subTitle}>
          제목·기간·모집 직무를 입력한 뒤 저장하면 공개 채용 페이지에
          반영됩니다.
        </p>
      </div>

      {error ? <div className={styles.errorBox}>{error}</div> : null}
      {loading ? <p className={styles.loading}>불러오는 중…</p> : null}

      {!loading ? (
        <form className={styles.form} onSubmit={(e) => void onSubmit(e)}>
          <div className={styles.legacySheet}>
            <table className={styles.formTable}>
              <tbody>
                <tr>
                  <th
                    scope="row"
                    title="미사용 시 채용 목록에 노출되지 않습니다."
                  >
                    분류
                  </th>
                  <td>
                    <select
                      id="use-yn"
                      value={useYn}
                      onChange={(e) => setUseYn(e.target.value)}
                    >
                      {useOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <span className={styles.cellHint}>
                      미사용이면 채용 목록에 나오지 않습니다.
                    </span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">제목</th>
                  <td>
                    <input
                      id="subj"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="채용 공고 제목을 입력하세요"
                    />
                  </td>
                </tr>
                <tr>
                  <th
                    scope="row"
                    title="응시구분은 공개 모달 요약 표의 모집분야에 표시됩니다."
                  >
                    응시구분 · 정렬
                  </th>
                  <td>
                    <div className={styles.inline2}>
                      <div className={styles.inlineField}>
                        <span className={styles.inlineLabel}>응시구분</span>
                        <select
                          id="exam-type"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                        >
                          {typeOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.inlineField}>
                        <label htmlFor="order">목록 정렬순서</label>
                        <input
                          id="order"
                          type="number"
                          min={0}
                          value={orderNo}
                          onChange={(e) => setOrderNo(Number(e.target.value))}
                        />
                        <span className={styles.cellHint}>
                          숫자가 작을수록 목록 상단에 가깝게 옵니다.
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope="row">상시접수</th>
                  <td>
                    <div className={styles.checkInline}>
                      <input
                        id="always"
                        type="checkbox"
                        checked={isAlways}
                        onChange={(e) => setIsAlways(e.target.checked)}
                      />
                      <label htmlFor="always">
                        상시 모집 · 상시 접수 (노출·접수 기간과 관계없이 상시로
                        표시·접수)
                      </label>
                    </div>
                    <span className={styles.cellHint}>
                      체크 시 공개 화면에서 접수기간이 「상시접수」로 보입니다.
                      미체크 시 아래 노출·접수 기간이 필요합니다.
                    </span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">노출기간</th>
                  <td>
                    <div className={styles.periodPair}>
                      <input
                        id="d1"
                        type="date"
                        value={displayStart}
                        onChange={(e) => setDisplayStart(e.target.value)}
                        disabled={isAlways}
                        aria-label="노출 시작"
                      />
                      <span className={styles.periodSep}>~</span>
                      <input
                        id="d2"
                        type="date"
                        value={displayEnd}
                        onChange={(e) => setDisplayEnd(e.target.value)}
                        disabled={isAlways}
                        aria-label="노출 종료"
                      />
                    </div>
                    <span className={styles.cellHint}>
                      목록 노출에 사용됩니다. 상시접수 시 비활성입니다.
                    </span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">접수기간</th>
                  <td>
                    <div className={styles.periodPair}>
                      <input
                        id="r1"
                        type="date"
                        value={recruitStart}
                        onChange={(e) => setRecruitStart(e.target.value)}
                        aria-label="접수 시작"
                      />
                      <span className={styles.periodSep}>~</span>
                      <input
                        id="r2"
                        type="date"
                        value={recruitEnd}
                        onChange={(e) => setRecruitEnd(e.target.value)}
                        aria-label="접수 종료"
                      />
                    </div>
                    <span className={styles.cellHint}>
                      상시접수가 아닐 때 모달·목록의 접수기간 문구에 반영됩니다.
                    </span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">참고사항</th>
                  <td>
                    <textarea
                      id="notice"
                      value={notice}
                      onChange={(e) => setNotice(e.target.value)}
                      rows={4}
                    />
                  </td>
                </tr>
                <tr>
                  <th scope="row">접수방법</th>
                  <td>
                    <textarea
                      id="apply"
                      value={applyMethod}
                      onChange={(e) => setApplyMethod(e.target.value)}
                      rows={3}
                    />
                    <span className={styles.fieldExample}>
                      ex) 홈페이지(온라인접수)
                    </span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">전형절차</th>
                  <td>
                    <textarea
                      id="proc"
                      value={process}
                      onChange={(e) => setProcess(e.target.value)}
                      rows={3}
                    />
                    <span className={styles.fieldExample}>
                      ex) 서류전형 &gt; 1차면접 &gt; 건강검진 &gt; 최종합격
                    </span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">문의처</th>
                  <td>
                    <textarea
                      id="contact"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      rows={2}
                    />
                    <span className={styles.fieldExample}>
                      ex) 인사총무팀(02-2222-3333)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <h3 className={styles.blockHeading}>모집 직무</h3>
            <div className={styles.tableScroll}>
              <table className={styles.positionTable}>
                <thead>
                  <tr>
                    <th className={styles.colJob}>직무</th>
                    <th className={styles.colCount}>모집인원</th>
                    <th className={styles.colWork}>근무형태</th>
                    <th className={styles.colBusiness}>주요업무</th>
                    <th className={styles.colContent}>모집분야</th>
                    <th className={styles.colRequired}>자격요건</th>
                    <th className={styles.colLocation}>근무지</th>
                    <th className={styles.colActions}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p, i) => (
                    <tr key={i}>
                      <td className={styles.colJob}>
                        <input
                          value={p.job}
                          onChange={(e) =>
                            updatePosition(i, { job: e.target.value })
                          }
                          placeholder="직무명"
                          aria-label={`직무 ${i + 1}`}
                        />
                      </td>
                      <td className={styles.colCount}>
                        <input
                          value={p.count}
                          onChange={(e) =>
                            updatePosition(i, { count: e.target.value })
                          }
                          placeholder="00"
                          aria-label={`모집인원 ${i + 1}`}
                        />
                      </td>
                      <td className={styles.colWork}>
                        <input
                          value={p.work_type}
                          onChange={(e) =>
                            updatePosition(i, { work_type: e.target.value })
                          }
                          placeholder="정규직"
                          aria-label={`근무형태 ${i + 1}`}
                        />
                      </td>
                      <td className={styles.colBusiness}>
                        <input
                          value={p.business}
                          onChange={(e) =>
                            updatePosition(i, { business: e.target.value })
                          }
                          aria-label={`주요업무 ${i + 1}`}
                        />
                      </td>
                      <td className={styles.colContent}>
                        <textarea
                          value={p.content}
                          onChange={(e) =>
                            updatePosition(i, { content: e.target.value })
                          }
                          aria-label={`모집분야 ${i + 1}`}
                        />
                      </td>
                      <td className={styles.colRequired}>
                        <textarea
                          value={p.required}
                          onChange={(e) =>
                            updatePosition(i, { required: e.target.value })
                          }
                          aria-label={`자격요건 ${i + 1}`}
                        />
                      </td>
                      <td className={styles.colLocation}>
                        <input
                          value={p.location}
                          onChange={(e) =>
                            updatePosition(i, { location: e.target.value })
                          }
                          aria-label={`근무지 ${i + 1}`}
                        />
                      </td>
                      <td className={styles.colActions}>
                        <div className={styles.posActions}>
                          <button
                            type="button"
                            className={styles.posIconBtn}
                            disabled={i === 0}
                            onClick={() => movePosition(i, -1)}
                            aria-label={`직무 ${i + 1} 위로`}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className={styles.posIconBtn}
                            disabled={i >= positions.length - 1}
                            onClick={() => movePosition(i, 1)}
                            aria-label={`직무 ${i + 1} 아래로`}
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className={`${styles.posIconBtn} ${styles.posIconBtnDanger}`}
                            disabled={positions.length <= 1}
                            onClick={() => requestRemovePosition(i)}
                            aria-label={`직무 ${i + 1} 삭제`}
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.addRowBar}>
              <button
                type="button"
                className={styles.addRowBtn}
                onClick={addPosition}
              >
                + 직무 행 추가
              </button>
            </div>
          </div>

          <div className={styles.footerActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setPreviewOpen(true)}
            >
              미리보기
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={saving}
            >
              {saving ? "저장 중…" : isNew ? "등록하기" : "저장하기"}
            </button>
            <Link
              href="/admin/customersupport/recruit-posts"
              className={styles.secondaryButton}
            >
              취소
            </Link>
          </div>

          {!isNew ? (
            <div className={styles.dangerBar}>
              <p>공고를 삭제하면 해당 공고 지원서·첨부가 모두 삭제됩니다.</p>
              <button
                type="button"
                className={styles.dangerOutline}
                disabled={saving}
                onClick={() => void onDelete()}
              >
                이 공고 삭제
              </button>
            </div>
          ) : null}
        </form>
      ) : null}

      {portalReady &&
        confirmPositionDeleteIndex !== null &&
        createPortal(
          <div
            className={styles.confirmOverlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="recruit-position-delete-title"
            onMouseDown={handleDeleteConfirmOverlayMouseDown}
            onClick={handleDeleteConfirmOverlayClick}
          >
            <div
              className={styles.confirmDialog}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <h3
                id="recruit-position-delete-title"
                className={styles.confirmTitle}
              >
                삭제하시겠습니까?
              </h3>
              <p className={styles.confirmBody}>
                직무 #{confirmPositionDeleteIndex + 1} 행을 목록에서 제거합니다.
              </p>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.confirmCancel}
                  onClick={closeConfirmPositionDelete}
                >
                  취소
                </button>
                <button
                  type="button"
                  className={styles.confirmDanger}
                  onClick={confirmRemovePosition}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {portalReady &&
        previewOpen &&
        createPortal(
          <div
            className={recruitModalStyles.detailModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="recruit-admin-preview-title"
            onMouseDown={handleOverlayMouseDown}
            onClick={handleOverlayClick}
          >
            <div
              className={recruitModalStyles.detailModalInner}
              onMouseDown={(e) => e.stopPropagation()}
              role="document"
            >
              <div className={recruitModalStyles.detailModalHeader}>
                <h3
                  id="recruit-admin-preview-title"
                  className={recruitModalStyles.detailModalTitle}
                >
                  {previewDetail.subject}
                </h3>
                <button
                  type="button"
                  className={recruitModalStyles.detailClose}
                  onClick={closePreview}
                  aria-label="닫기"
                >
                  ×
                </button>
              </div>
              <div className={recruitModalStyles.detailModalBody}>
                <RecruitPostDetailView
                  detail={previewDetail}
                  showPreviewNote
                  actions={
                    <div className={recruitModalStyles.detailModalActions}>
                      <button
                        type="button"
                        className={recruitModalStyles.detailButton}
                        onClick={closePreview}
                      >
                        닫기
                      </button>
                    </div>
                  }
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
