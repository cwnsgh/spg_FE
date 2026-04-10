"use client";

import {
  ApiError,
  deleteAdminRecruitManagePosts,
  getAdminRecruitManagePosts,
  sortAdminRecruitManagePosts,
  type RecruitManagePostListRow,
  type RecruitManagePostsResponse,
} from "@/api";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

function statusPillClass(code: number, isAlways: boolean) {
  if (isAlways) return styles.statusPillAlways;
  if (code === 4) return styles.statusPillClosed;
  if (code === 3) return styles.statusPillOpen;
  return "";
}

interface DeleteConfirmModalProps {
  open: boolean;
  count: number;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteConfirmModal({
  open,
  count,
  busy,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (!open) setConfirmText("");
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.confirmOverlay}>
      <div className={styles.confirmModal} role="dialog" aria-modal="true">
        <h3>삭제하시겠습니까?</h3>
        <p>
          삭제된 채용공고와 연결된 지원서/첨부 파일도 함께 삭제됩니다.
          <br />
          정말 삭제하려면 아래에 <strong>삭제하겠습니다</strong> 를 입력해주세요.
        </p>
        <input
          className={styles.confirmInput}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="삭제하겠습니다"
        />
        <div className={styles.confirmActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onCancel}
            disabled={busy}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.dangerButton}
            onClick={onConfirm}
            disabled={busy || confirmText.trim() !== "삭제하겠습니다"}
          >
            {busy ? "삭제 중…" : `삭제 (${count}건)`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRecruitPostsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [useYn, setUseYn] = useState("");
  const [statusCode, setStatusCode] = useState(0);
  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [payload, setPayload] = useState<RecruitManagePostsResponse | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const [orderDraft, setOrderDraft] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sortSaving, setSortSaving] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<number[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminRecruitManagePosts({
        page,
        limit,
        use_yn: useYn || undefined,
        status_code: statusCode > 0 ? statusCode : undefined,
        keyword: keyword.trim() || undefined,
      });
      setPayload(data);
      const next: Record<number, number> = {};
      for (const row of data.list) {
        next[row.wr_id] = row.order_no;
      }
      setOrderDraft(next);
      setSelected(new Set());
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
  }, [page, limit, useYn, statusCode, keyword]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const list = payload?.list ?? [];
  const pagination = payload?.pagination;
  const useOptions = payload?.filter_options?.use_options ?? [];
  const statusOptions = payload?.filter_options?.status_options ?? [];

  const applyFilters = () => {
    setPage(1);
    setRefreshKey((k) => k + 1);
  };

  const resetFilters = () => {
    setUseYn("");
    setStatusCode(0);
    setKeyword("");
    setPage(1);
    setRefreshKey((k) => k + 1);
  };

  const toggleSelect = (wrId: number) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(wrId)) n.delete(wrId);
      else n.add(wrId);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === list.length && list.length > 0) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(list.map((r) => r.wr_id)));
  };

  const setOrderFor = (wrId: number, value: string) => {
    const n = Number(value);
    if (Number.isNaN(n)) return;
    setOrderDraft((d) => ({ ...d, [wrId]: n }));
  };

  const saveSort = async () => {
    if (list.length === 0) return;
    setSortSaving(true);
    setError("");
    setSuccess("");
    try {
      const items = list.map((r) => ({
        wr_id: r.wr_id,
        order_no: orderDraft[r.wr_id] ?? r.order_no,
      }));
      const res = await sortAdminRecruitManagePosts(items);
      if (res.message) setSuccess(res.message);
      else setSuccess("정렬순서가 저장되었습니다.");
      setRefreshKey((k) => k + 1);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("정렬 저장에 실패했습니다.");
    } finally {
      setSortSaving(false);
    }
  };

  const openDeleteModal = (ids: number[]) => {
    if (ids.length === 0) return;
    setDeleteTargetIds(ids);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteBusy) return;
    setDeleteModalOpen(false);
    setDeleteTargetIds([]);
  };

  const confirmDelete = async () => {
    if (deleteTargetIds.length === 0) return;
    setDeleteBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await deleteAdminRecruitManagePosts(deleteTargetIds);
      if (res.message) setSuccess(res.message);
      else setSuccess("삭제되었습니다.");
      setRefreshKey((k) => k + 1);
      setDeleteModalOpen(false);
      setDeleteTargetIds([]);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("삭제에 실패했습니다.");
    } finally {
      setDeleteBusy(false);
    }
  };

  const allSelected = useMemo(
    () => list.length > 0 && selected.size === list.length,
    [list.length, selected.size]
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <h1>채용공고 관리</h1>
          <p>
            사이트에 노출되는 채용공고를 등록·수정하고, 목록 정렬순서를 한 번에
            저장할 수 있습니다.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link
            href="/admin/customersupport/recruit-posts/new"
            className={styles.primaryButton}
          >
            새 공고 작성
          </Link>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.field}>
          <label htmlFor="rp-use">사용구분</label>
          <select
            id="rp-use"
            value={useYn}
            onChange={(e) => setUseYn(e.target.value)}
          >
            <option value="">전체</option>
            {useOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="rp-status">진행상태</label>
          <select
            id="rp-status"
            value={statusCode}
            onChange={(e) => setStatusCode(Number(e.target.value))}
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
          <label htmlFor="rp-kw">제목 검색</label>
          <input
            id="rp-kw"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="키워드"
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters();
            }}
          />
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => applyFilters()}
          >
            검색
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => resetFilters()}
          >
            초기화
          </button>
        </div>
      </div>

      {success ? <div className={styles.successBox}>{success}</div> : null}
      {error ? <div className={styles.errorBox}>{error}</div> : null}
      {loading ? <p className={styles.loading}>불러오는 중…</p> : null}

      {!loading && pagination ? (
        <p className={styles.summary}>
          총 {pagination.total_count}건 · {pagination.current_page} /{" "}
          {pagination.total_pages}페이지
        </p>
      ) : null}

      {!loading && list.length > 0 ? (
        <div className={styles.bulkBar}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => toggleSelectAll()}
            />
            <span>현재 페이지 전체 선택</span>
          </label>
          <span>선택 {selected.size}건</span>
          <button
            type="button"
            className={styles.dangerButton}
            disabled={selected.size === 0 || deleteBusy}
            onClick={() => openDeleteModal([...selected])}
          >
            선택 삭제
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={sortSaving || list.length === 0}
            onClick={() => void saveSort()}
          >
            {sortSaving ? "순서 저장 중…" : "현재 페이지 순서 저장"}
          </button>
        </div>
      ) : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.centerCell} style={{ width: "3rem" }} />
              <th style={{ width: "6.8rem" }}>노출순서</th>
              <th>제목 · 요약</th>
              <th style={{ minWidth: "20rem" }}>모집직무 미리보기(요약)</th>
              <th>사용</th>
              <th>상태</th>
              <th>노출 / 접수</th>
              <th style={{ minWidth: "11rem" }}>작업</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && !loading ? (
              <tr>
                <td colSpan={8} className={styles.muted}>
                  등록된 공고가 없습니다. 우측 상단에서 새 공고를 작성해 보세요.
                </td>
              </tr>
            ) : (
              list.map((row) => (
                <tr key={row.wr_id}>
                  <td className={styles.centerCell}>
                    <input
                      type="checkbox"
                      checked={selected.has(row.wr_id)}
                      onChange={() => toggleSelect(row.wr_id)}
                      aria-label={`선택 ${row.subject || row.wr_id}`}
                    />
                  </td>
                  <td>
                    <input
                      className={styles.orderInput}
                      type="number"
                      min={0}
                      value={orderDraft[row.wr_id] ?? row.order_no}
                      onChange={(e) => setOrderFor(row.wr_id, e.target.value)}
                    />
                  </td>
                  <td>
                    <div className={styles.cellStack}>
                      <span className={styles.cellTitle}>
                        {row.subject || "—"}
                      </span>
                      <span className={styles.muted}>
                        조회 {row.hit} ·{" "}
                        {row.created_date_text || row.created_at?.slice(0, 10)}
                      </span>
                    </div>
                  </td>
                  <td>
                    {row.positions_preview?.length ? (
                      <ul className={styles.previewList}>
                        {row.positions_preview.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className={styles.muted}>—</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={
                        row.use_yn === "사용"
                          ? styles.useBadge
                          : styles.useBadgeOff
                      }
                    >
                      {row.use_yn}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusPill} ${statusPillClass(row.status_code, row.is_always)}`}
                    >
                      {row.status_text}
                      {row.is_always ? " · 상시" : ""}
                    </span>
                  </td>
                  <td>
                    <div className={styles.cellStack}>
                      <span title="노출기간">
                        {row.display_period?.text || "—"}
                      </span>
                      <span className={styles.muted} title="접수기간">
                        접수 {row.recruit_period?.text || "—"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Link
                        href={`/admin/customersupport/recruit-posts/edit?id=${row.wr_id}`}
                        className={styles.secondaryButton}
                      >
                        편집
                      </Link>
                      <button
                        type="button"
                        className={styles.rowDeleteButton}
                        disabled={deleteBusy}
                        onClick={() => openDeleteModal([row.wr_id])}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

      <DeleteConfirmModal
        open={deleteModalOpen}
        count={deleteTargetIds.length}
        busy={deleteBusy}
        onCancel={closeDeleteModal}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
