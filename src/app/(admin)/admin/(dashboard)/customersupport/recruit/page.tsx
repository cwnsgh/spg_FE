"use client";

import {
  ApiError,
  API_BASE_URL,
  BACKEND_ORIGIN,
  deleteAdminRecruitApplications,
  getAdminRecruitApplications,
  getAdminRecruitApplyPreview,
  RECRUIT_STATUS_DELETE_PENDING,
  type RecruitApplicationFilePreview,
  type RecruitApplicationRow,
  type RecruitApplicationsResponse,
  updateAdminRecruitApplicationStatuses,
} from "@/api";
import RecruitApplyPreview from "@/app/aboutUs/components/sections/RecruitApplyPreview";
import {
  recruitUploadFilePublicUrl,
  recruitUploadPreviewKind,
} from "@/app/aboutUs/components/sections/recruitApplyAssets";
import { requestRecruitApplyPreviewPrint } from "@/app/aboutUs/components/sections/requestRecruitApplyPreviewPrint";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

/** pt_file에 동일 pf_file(또는 url)이 여러 번 쌓이면 배지가 중복 — 화면에서는 한 번만 */
function dedupeRecruitFilesPreview(
  files: RecruitApplicationFilePreview[] | undefined
): RecruitApplicationFilePreview[] {
  if (!files?.length) return [];
  const seen = new Set<string>();
  const out: RecruitApplicationFilePreview[] = [];
  for (const f of files) {
    const pathKey = (f.pf_file ?? "").trim().toLowerCase();
    const urlKey = (f.url ?? "").trim().toLowerCase();
    const key = pathKey || urlKey;
    if (key) {
      if (seen.has(key)) continue;
      seen.add(key);
    }
    out.push(f);
  }
  return out;
}

export default function AdminRecruitApplicationsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [wrId, setWrId] = useState(0);
  const [reStatus, setReStatus] = useState(0);
  const [reName, setReName] = useState("");
  const [applyStart, setApplyStart] = useState("");
  const [applyEnd, setApplyEnd] = useState("");
  const [reWork, setReWork] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState<RecruitApplicationsResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewPostSubject, setPreviewPostSubject] = useState("");
  const [previewBundle, setPreviewBundle] = useState<Record<string, unknown> | null>(
    null
  );
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  /** PHP 인쇄/레거시 URL — 양식 미리보기와 별도 */
  const [previewServerUrl, setPreviewServerUrl] = useState("");
  const [listFilePreview, setListFilePreview] = useState<{
    title: string;
    url: string;
    kind: "image" | "pdf" | "other";
  } | null>(null);
  const [listFileDialog, setListFileDialog] = useState<{
    rowTitle: string;
    files: RecruitApplicationFilePreview[];
  } | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    reId: number;
    applicantName: string;
    oldStatus: number;
    oldLabel: string;
    nextStatus: number;
    nextLabel: string;
  } | null>(null);
  const [statusChanging, setStatusChanging] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminRecruitApplications({
        page,
        limit,
        wr_id: wrId > 0 ? wrId : undefined,
        re_status: reStatus > 0 ? reStatus : undefined,
        re_name: reName.trim() || undefined,
        apply_start: applyStart || undefined,
        apply_end: applyEnd || undefined,
        re_work: reWork || undefined,
      });
      setPayload(data);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError("목록을 불러오지 못했습니다.");
      }
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    wrId,
    reStatus,
    reName,
    applyStart,
    applyEnd,
    reWork,
    refreshKey,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setSelectedIds([]);
  }, [page, refreshKey]);

  const list = payload?.list ?? [];
  const pagination = payload?.pagination;
  const postOptions = payload?.filter_options?.post_options ?? [];
  const statusOptions = payload?.filter_options?.status_options ?? [];
  const workOptions = payload?.filter_options?.work_options ?? [];

  const pageIds = useMemo(() => list.map((r) => r.re_id), [list]);
  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const someOnPageSelected = pageIds.some((id) => selectedIds.includes(id));

  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    el.indeterminate = !allOnPageSelected && someOnPageSelected;
  }, [allOnPageSelected, someOnPageSelected]);

  const selectedRowsResolved = useMemo(() => {
    return selectedIds
      .map((id) => list.find((r) => r.re_id === id))
      .filter((r): r is RecruitApplicationRow => Boolean(r));
  }, [list, selectedIds]);

  const canDeleteSelected =
    selectedIds.length > 0 &&
    selectedRowsResolved.length === selectedIds.length &&
    selectedRowsResolved.every((r) => r.re_status === RECRUIT_STATUS_DELETE_PENDING);

  const toggleRowSelected = (reId: number) => {
    setSelectedIds((prev) =>
      prev.includes(reId) ? prev.filter((id) => id !== reId) : [...prev, reId]
    );
  };

  const toggleSelectAllOnPage = () => {
    if (allOnPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const confirmBulkDelete = async () => {
    if (!canDeleteSelected || selectedIds.length === 0) return;
    const ok = window.confirm(
      `선택한 ${selectedIds.length}건을 영구 삭제합니다.\n삭제대기 상태인 지원서만 서버에서 삭제됩니다.`
    );
    if (!ok) return;
    setBulkDeleting(true);
    try {
      await deleteAdminRecruitApplications(selectedIds);
      setSelectedIds([]);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "삭제에 실패했습니다.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const applyFilters = () => {
    setPage(1);
    setRefreshKey((k) => k + 1);
  };

  const resetFilters = () => {
    setWrId(0);
    setReStatus(0);
    setReName("");
    setApplyStart("");
    setApplyEnd("");
    setReWork("");
    setPage(1);
    setRefreshKey((k) => k + 1);
  };

  const link = (path: string) => `${BACKEND_ORIGIN}${path}`;
  const usesDevProxy = API_BASE_URL.startsWith("/api/proxy");

  const fileOpenHref = (url: string) => {
    const u = url?.trim() ?? "";
    if (!u) return "#";
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    return link(u.startsWith("/") ? u : `/${u}`);
  };

  const printOpenHref = (url: string) => {
    const u = url?.trim() ?? "";
    if (!u) return "#";

    const toProxyPath = (pathWithQuery: string) => {
      const normalized = pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
      const withoutApiPrefix = normalized.startsWith("/api/")
        ? normalized.slice(4)
        : normalized === "/api"
          ? "/"
          : normalized;
      return `${API_BASE_URL}${withoutApiPrefix}`;
    };

    if (u.startsWith("http://") || u.startsWith("https://")) {
      if (!usesDevProxy) return u;
      try {
        const parsed = new URL(u);
        return toProxyPath(`${parsed.pathname}${parsed.search}`);
      } catch {
        return u;
      }
    }

    if (usesDevProxy) return toProxyPath(u);
    return link(u.startsWith("/") ? u : `/${u}`);
  };
  const openPrintPreview = async (row: RecruitApplicationRow) => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError("");
    setPreviewBundle(null);
    setPreviewTitle(
      `지원서 미리보기 · #${row.re_id} ${row.applicant.name ? `(${row.applicant.name})` : ""}`
    );
    setPreviewPostSubject(row.post.subject?.trim() ?? "");
    const serverHref = printOpenHref(
      row.links.print_url || row.links.detail_url || row.links.edit_url
    );
    setPreviewServerUrl(serverHref !== "#" ? serverHref : "");

    try {
      const data = await getAdminRecruitApplyPreview(row.re_id);
      setPreviewBundle(data);
    } catch (e) {
      setPreviewError(
        e instanceof ApiError ? e.message : "지원서를 불러오지 못했습니다."
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewTitle("");
    setPreviewPostSubject("");
    setPreviewBundle(null);
    setPreviewError("");
    setPreviewServerUrl("");
    setPreviewLoading(false);
  };

  const printPreview = () => {
    requestRecruitApplyPreviewPrint();
  };

  const openListFilePreview = (f: RecruitApplicationFilePreview) => {
    const built = recruitUploadFilePublicUrl({ url: f.url, pf_file: f.pf_file }).trim();
    const url = built || fileOpenHref(f.url || "");
    if (!url || url === "#") return;
    const name = (f.pf_file || f.url || "").trim();
    const kind = recruitUploadPreviewKind(name);
    const title = f.pf_source?.trim() || f.pf_file || "첨부";
    // 목록 모달 위에 미리보기 모달이 가려지지 않도록 목록은 먼저 닫습니다.
    setListFileDialog(null);
    setListFilePreview({ title, url, kind });
  };

  const resolveRecruitFileHref = (f: RecruitApplicationFilePreview) => {
    const built = recruitUploadFilePublicUrl({ url: f.url, pf_file: f.pf_file }).trim();
    return built || fileOpenHref(f.url || "");
  };

  const statusLabel = (value: number) =>
    statusOptions.find((s) => s.value === value)?.label || `상태 ${value}`;

  const requestStatusChange = (row: RecruitApplicationRow, nextStatus: number) => {
    const oldStatus = row.re_status;
    if (nextStatus === oldStatus) return;
    setPendingStatusChange({
      reId: row.re_id,
      applicantName: row.applicant.name || String(row.re_id),
      oldStatus,
      oldLabel: statusLabel(oldStatus),
      nextStatus,
      nextLabel: statusLabel(nextStatus),
    });
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    setStatusChanging(true);
    try {
      await updateAdminRecruitApplicationStatuses([
        { re_id: pendingStatusChange.reId, re_status: pendingStatusChange.nextStatus },
      ]);
      setPendingStatusChange(null);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "상태 변경에 실패했습니다.");
    } finally {
      setStatusChanging(false);
    }
  };

  useEffect(() => {
    if (!listFilePreview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setListFilePreview(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listFilePreview]);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.field}>
          <label htmlFor="recruit-wr">공고</label>
          <select
            id="recruit-wr"
            value={wrId}
            onChange={(e) => setWrId(Number(e.target.value))}
          >
            <option value={0}>전체</option>
            {postOptions.map((p) => (
              <option key={p.wr_id} value={p.wr_id}>
                {p.subject || `공고 #${p.wr_id}`}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="recruit-status">진행상태</label>
          <select
            id="recruit-status"
            value={reStatus}
            onChange={(e) => setReStatus(Number(e.target.value))}
          >
            <option value={0}>전체</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="recruit-work">지원직무</label>
          <select
            id="recruit-work"
            value={reWork}
            onChange={(e) => setReWork(e.target.value)}
          >
            <option value="">전체</option>
            {workOptions.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="recruit-name">지원자명</label>
          <input
            id="recruit-name"
            value={reName}
            onChange={(e) => setReName(e.target.value)}
            placeholder="검색"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="recruit-start">제출 시작일</label>
          <input
            id="recruit-start"
            type="date"
            value={applyStart}
            onChange={(e) => setApplyStart(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="recruit-end">제출 종료일</label>
          <input
            id="recruit-end"
            type="date"
            value={applyEnd}
            onChange={(e) => setApplyEnd(e.target.value)}
          />
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.primaryButton} onClick={() => applyFilters()}>
            검색
          </button>
          <button type="button" className={styles.secondaryButton} onClick={() => resetFilters()}>
            초기화
          </button>
        </div>
      </div>

      {error ? <div className={styles.errorBox}>{error}</div> : null}
      {loading ? <p className={styles.loading}>불러오는 중…</p> : null}

      {!loading && pagination ? (
        <p className={styles.summary}>
          총 {pagination.total_count}건 · {pagination.current_page} / {pagination.total_pages}페이지
        </p>
      ) : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colSelect} scope="col">
                <span className={styles.srOnly}>선택</span>
              </th>
              <th className={styles.colStatus}>상태</th>
              <th className={styles.colPost}>공고명</th>
              <th className={styles.colType}>모집분야</th>
              <th className={styles.colWork}>응시분야</th>
              <th className={styles.colApplicant}>지원자</th>
              <th className={styles.colPhone}>연락처</th>
              <th className={styles.colDate}>제출일</th>
              <th className={styles.colHistory}>이력내역</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && !loading ? (
              <tr>
                <td colSpan={9} className={styles.muted}>
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              list.map((row: RecruitApplicationRow) => {
                const previewFiles = dedupeRecruitFilesPreview(row.files_preview);
                return (
                <tr key={row.re_id}>
                  <td className={styles.colSelect}>
                    <input
                      type="checkbox"
                      className={styles.rowCheckbox}
                      checked={selectedIds.includes(row.re_id)}
                      onChange={() => toggleRowSelected(row.re_id)}
                      aria-label={`${row.applicant.name || `지원서 ${row.re_id}`} 선택`}
                    />
                  </td>
                  <td>
                    <select
                      className={styles.statusSelect}
                      value={row.re_status}
                      aria-label={`상태 ${row.applicant.name || row.re_id}`}
                      onChange={(e) => requestStatusChange(row, Number(e.target.value))}
                    >
                      {statusOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={styles.postCell}>
                    <div className={styles.postTitle} title={row.post.subject || "—"}>
                      {row.post.subject || "—"}
                    </div>
                    <div className={styles.fileSummaryRow}>
                      <span className={styles.fileSummaryText}>
                        첨부 {previewFiles.length}개
                      </span>
                      {previewFiles.length ? (
                        <button
                          type="button"
                          className={styles.fileSummaryBtn}
                          onClick={() =>
                            setListFileDialog({
                              rowTitle: row.post.subject || `지원서 #${row.re_id}`,
                              files: previewFiles,
                            })
                          }
                        >
                          보기
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td>{row.re_type || "무관"}</td>
                  <td>{row.re_work || "—"}</td>
                  <td>
                    <div>{row.applicant.name || "—"}</div>
                    <div className={styles.muted}>
                      {row.applicant.sex || "—"} {row.applicant.birth || ""}
                    </div>
                  </td>
                  <td>{row.applicant.phone || "—"}</td>
                  <td>{row.applied_date_text || row.applied_at?.slice(0, 10) || "—"}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.previewButton}
                      onClick={() => void openPrintPreview(row)}
                    >
                      이력내역
                    </button>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && list.length > 0 ? (
        <div className={styles.bulkBar}>
          <div className={styles.bulkBarLeft}>
            <label className={styles.selectAllLabel}>
              <input
                ref={selectAllRef}
                type="checkbox"
                className={styles.rowCheckbox}
                checked={allOnPageSelected}
                onChange={toggleSelectAllOnPage}
              />
              전체선택
            </label>
            <button
              type="button"
              className={styles.dangerButton}
              disabled={!canDeleteSelected || bulkDeleting}
              title={
                canDeleteSelected
                  ? "선택한 삭제대기 지원서를 영구 삭제합니다."
                  : "삭제대기 상태인 행만 선택한 뒤 사용할 수 있습니다."
              }
              onClick={() => void confirmBulkDelete()}
            >
              {bulkDeleting ? "삭제 중…" : "삭제대기 선택삭제"}
            </button>
          </div>
          <p className={styles.bulkHint}>
            선택한 항목이 모두「삭제대기」일 때만 삭제됩니다. 그 외 상태는 먼저 상태를
            삭제대기로 바꾼 뒤 삭제하세요.
          </p>
        </div>
      ) : null}

      {previewOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="지원서 미리보기">
          <div className={`${styles.modalCard} ${styles.printRoot}`}>
            <div className={`${styles.modalHeader} ${styles.noPrint}`}>
              <strong>{previewTitle || "지원서 미리보기"}</strong>
              <div className={styles.modalActions}>
                {previewServerUrl ? (
                  <a href={previewServerUrl} target="_blank" rel="noreferrer">
                    서버 인쇄/원본(새 창)
                  </a>
                ) : null}
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={printPreview}
                  disabled={!previewBundle || Boolean(previewLoading)}
                >
                  인쇄
                </button>
                <button type="button" className={styles.secondaryButton} onClick={closePreview}>
                  닫기
                </button>
              </div>
            </div>
            <div className={styles.previewBody}>
              {previewLoading ? (
                <p className={styles.previewLoading}>지원서를 불러오는 중…</p>
              ) : previewError ? (
                <div className={styles.previewError} role="alert">
                  <p>{previewError}</p>
                  {previewServerUrl ? (
                    <p>
                      <a href={previewServerUrl} target="_blank" rel="noreferrer">
                        서버 페이지로 열기
                      </a>
                    </p>
                  ) : null}
                </div>
              ) : previewBundle ? (
                <div id="recruit-apply-print-root">
                  <RecruitApplyPreview data={previewBundle} postSubject={previewPostSubject} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {listFilePreview ? (
        <div
          className={styles.fileQuickBackdrop}
          role="presentation"
          onClick={() => setListFilePreview(null)}
        >
          <div
            className={styles.fileQuickCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-file-preview-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.fileQuickHeader}>
              <div>
                <p className={styles.fileQuickEyebrow}>첨부 미리보기</p>
                <p id="admin-file-preview-title" className={styles.fileQuickTitle}>
                  {listFilePreview.title}
                </p>
              </div>
              <button
                type="button"
                className={styles.fileQuickClose}
                onClick={() => setListFilePreview(null)}
              >
                닫기
              </button>
            </div>
            <div className={styles.fileQuickBody}>
              {listFilePreview.kind === "image" ? (
                <img
                  className={styles.fileQuickImage}
                  src={listFilePreview.url}
                  alt={listFilePreview.title}
                />
              ) : listFilePreview.kind === "pdf" ? (
                <iframe
                  className={styles.fileQuickIframe}
                  title={listFilePreview.title}
                  src={listFilePreview.url}
                />
              ) : (
                <p className={styles.fileQuickOther}>
                  이 형식은 여기서 바로 미리보기할 수 없습니다.{" "}
                  <a href={listFilePreview.url} target="_blank" rel="noreferrer">
                    새 창에서 열기
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {listFileDialog ? (
        <div
          className={styles.fileListBackdrop}
          role="presentation"
          onClick={() => setListFileDialog(null)}
        >
          <div
            className={styles.fileQuickCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-file-list-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.fileQuickHeader}>
              <div>
                <p className={styles.fileQuickEyebrow}>첨부파일 목록</p>
                <p id="admin-file-list-title" className={styles.fileQuickTitle}>
                  {listFileDialog.rowTitle}
                </p>
              </div>
              <button
                type="button"
                className={styles.fileQuickClose}
                onClick={() => setListFileDialog(null)}
              >
                닫기
              </button>
            </div>
            <div className={styles.fileListBody}>
              {listFileDialog.files.map((f) => {
                const label = f.pf_source?.trim() || f.pf_file || "첨부";
                const href = resolveRecruitFileHref(f);
                return (
                  <div key={`${f.pf_id}-${f.pf_file}-${f.url}`} className={styles.fileListRow}>
                    <span className={styles.fileListName}>{label}</span>
                    <div className={styles.fileListActions}>
                      <button
                        type="button"
                        className={styles.fileListBtn}
                        onClick={() => openListFilePreview(f)}
                      >
                        미리보기
                      </button>
                      {href && href !== "#" ? (
                        <>
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.fileListBtn}
                          >
                            새창
                          </a>
                          <a href={href} download className={styles.fileListBtn}>
                            다운로드
                          </a>
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {pendingStatusChange ? (
        <div
          className={styles.statusModalBackdrop}
          role="presentation"
          onClick={() => (statusChanging ? null : setPendingStatusChange(null))}
        >
          <div
            className={styles.statusModalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-change-title"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="status-change-title" className={styles.statusModalTitle}>
              상태를 변경하시겠습니까?
            </p>
            <p className={styles.statusModalText}>
              {pendingStatusChange.applicantName} 지원자 상태를
            </p>
            <p className={styles.statusModalFlow}>
              ({pendingStatusChange.oldLabel}) → ({pendingStatusChange.nextLabel})
            </p>
            <div className={styles.statusModalActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setPendingStatusChange(null)}
                disabled={statusChanging}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => void confirmStatusChange()}
                disabled={statusChanging}
              >
                {statusChanging ? "변경 중..." : "변경"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pagination && pagination.total_pages > 1 ? (
        <div className={styles.pagination}>
          <button
            type="button"
            disabled={pagination.current_page <= 1}
            onClick={() => setPage(1)}
          >
            «
          </button>
          <button
            type="button"
            disabled={pagination.current_page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹
          </button>
          <span>
            {pagination.current_page} / {pagination.total_pages}
          </span>
          <button
            type="button"
            disabled={pagination.current_page >= pagination.total_pages}
            onClick={() => setPage((p) => p + 1)}
          >
            ›
          </button>
          <button
            type="button"
            disabled={pagination.current_page >= pagination.total_pages}
            onClick={() => setPage(pagination.total_pages)}
          >
            »
          </button>
        </div>
      ) : null}
    </div>
  );
}
