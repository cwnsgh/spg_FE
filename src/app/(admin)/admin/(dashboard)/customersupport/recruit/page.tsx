"use client";

import {
  ApiError,
  API_BASE_URL,
  BACKEND_ORIGIN,
  getAdminRecruitApplications,
  getAdminRecruitApplyPreview,
  type RecruitApplicationFilePreview,
  type RecruitApplicationRow,
  type RecruitApplicationsResponse,
} from "@/api";
import RecruitApplyPreview from "@/app/aboutUs/components/sections/RecruitApplyPreview";
import { useCallback, useEffect, useState } from "react";
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

  const list = payload?.list ?? [];
  const pagination = payload?.pagination;
  const postOptions = payload?.filter_options?.post_options ?? [];
  const statusOptions = payload?.filter_options?.status_options ?? [];
  const workOptions = payload?.filter_options?.work_options ?? [];

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
    window.print();
  };

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
              <th style={{ width: "3.2rem" }} />
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
                const previewFilesTop = previewFiles.slice(0, 2);
                const previewFilesRemain = Math.max(0, previewFiles.length - previewFilesTop.length);
                return (
                <tr key={row.re_id}>
                  <td>
                    <input type="checkbox" aria-label={`지원자 선택 ${row.applicant.name || row.re_id}`} />
                  </td>
                  <td>
                    <select
                      className={styles.statusSelect}
                      value={row.re_status}
                      disabled
                      aria-label={`상태 ${row.applicant.name || row.re_id}`}
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
                    {previewFiles.length ? (
                      <div className={styles.fileBadges}>
                        {previewFilesTop.map((f) => {
                          const label = f.pf_source?.trim() || f.pf_file || "첨부";
                          const href = fileOpenHref(f.url);
                          return (
                            <a
                              key={`${f.pf_id}-${f.pf_file}`}
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.fileBadge}
                              title={label}
                            >
                              {label}
                            </a>
                          );
                        })}
                        {previewFilesRemain > 0 ? (
                          <span className={styles.fileMore}>+{previewFilesRemain}개</span>
                        ) : null}
                      </div>
                    ) : null}
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
                <RecruitApplyPreview data={previewBundle} postSubject={previewPostSubject} />
              ) : null}
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
