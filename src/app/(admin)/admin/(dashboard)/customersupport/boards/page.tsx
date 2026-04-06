"use client";

import {
  ApiError,
  createAdminBoard,
  deleteAdminBoard,
  getAdminBoardDetail,
  getAdminBoardList,
  getAdminGroupList,
  updateAdminBoard,
} from "@/api";
import { useOverlayDismiss } from "@/hooks/useOverlayDismiss";
import type {
  AdminBoardItem,
  AdminBoardListData,
  AdminBoardSavePayload,
  AdminGroupItem,
} from "@/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const boardSearchFieldOptions = [
  { value: "bo_subject", label: "게시판명" },
  { value: "bo_table", label: "게시판 ID" },
  { value: "gr_id", label: "그룹 ID" },
] as const;

const boardSortOptions = [
  { value: "bo_table", label: "게시판 ID" },
  { value: "bo_subject", label: "게시판명" },
  { value: "gr_id", label: "그룹 ID" },
  { value: "bo_order", label: "정렬순서" },
] as const;

const sortDirectionOptions = [
  { value: "DESC", label: "내림차순" },
  { value: "ASC", label: "오름차순" },
] as const;

const deviceOptions = [
  { value: "both", label: "PC/모바일" },
  { value: "pc", label: "PC 전용" },
  { value: "mobile", label: "모바일 전용" },
] as const;

const yesNoOptions = [
  { value: 1, label: "사용" },
  { value: 0, label: "미사용" },
] as const;

interface BoardFormState {
  bo_table: string;
  gr_id: string;
  bo_subject: string;
  bo_device: string;
  bo_skin: string;
  bo_mobile_skin: string;
  bo_order: number;
  bo_use_search: number;
  bo_use_sns: number;
  bo_list_level: number;
  bo_read_level: number;
  bo_write_level: number;
  bo_reply_level: number;
  bo_comment_level: number;
  bo_upload_level: number;
  bo_download_level: number;
  bo_html_level: number;
  bo_link_level: number;
}

const initialBoardForm: BoardFormState = {
  bo_table: "",
  gr_id: "default",
  bo_subject: "",
  bo_device: "both",
  bo_skin: "basic",
  bo_mobile_skin: "basic",
  bo_order: 0,
  bo_use_search: 1,
  bo_use_sns: 0,
  bo_list_level: 1,
  bo_read_level: 1,
  bo_write_level: 1,
  bo_reply_level: 1,
  bo_comment_level: 1,
  bo_upload_level: 1,
  bo_download_level: 1,
  bo_html_level: 1,
  bo_link_level: 1,
};

const initialBoardPagination: AdminBoardListData["pagination"] = {
  total_count: 0,
  total_pages: 0,
  current_page: 1,
  limit: 15,
};

function formatDevice(value: string) {
  return deviceOptions.find((option) => option.value === value)?.label ?? value;
}

function formatYesNo(value?: number) {
  return value === 1 ? "사용" : "미사용";
}

export default function AdminBoardsPage() {
  const [page, setPage] = useState(1);
  const [rows] = useState(15);
  const [searchField, setSearchField] =
    useState<(typeof boardSearchFieldOptions)[number]["value"]>("bo_subject");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortField, setSortField] =
    useState<(typeof boardSortOptions)[number]["value"]>("bo_table");
  const [sortDirection, setSortDirection] =
    useState<(typeof sortDirectionOptions)[number]["value"]>("DESC");
  const [boards, setBoards] = useState<AdminBoardItem[]>([]);
  const [boardPagination, setBoardPagination] =
    useState<AdminBoardListData["pagination"]>(initialBoardPagination);
  const [isBoardLoading, setIsBoardLoading] = useState(true);
  const [boardError, setBoardError] = useState("");
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [boardModalMode, setBoardModalMode] = useState<"create" | "edit">("create");
  const [boardForm, setBoardForm] = useState<BoardFormState>(initialBoardForm);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [isBoardFormLoading, setIsBoardFormLoading] = useState(false);
  const [isBoardSaving, setIsBoardSaving] = useState(false);
  const [boardFormError, setBoardFormError] = useState("");

  const [groups, setGroups] = useState<AdminGroupItem[]>([]);

  const fetchBoards = useCallback(async () => {
    setIsBoardLoading(true);
    setBoardError("");

    try {
      const data = await getAdminBoardList({
        page,
        rows,
        sfl: searchField,
        stx: searchKeyword.trim(),
        sst: sortField,
        sod: sortDirection,
      });

      setBoards(data.items);
      setBoardPagination(data.pagination);
    } catch (error) {
      if (error instanceof ApiError) {
        setBoardError(error.message);
      } else {
        setBoardError("게시판 목록을 불러오지 못했습니다.");
      }
    } finally {
      setIsBoardLoading(false);
    }
  }, [page, rows, searchField, searchKeyword, sortDirection, sortField]);

  const fetchGroups = useCallback(async () => {
    try {
      const data = await getAdminGroupList({
        page: 1,
        rows: 100,
        sst: "gr_id",
        sod: "ASC",
      });

      setGroups(data.items);
    } catch {
      setGroups([]);
    }
  }, []);

  useEffect(() => {
    void fetchBoards();
  }, [fetchBoards]);

  useEffect(() => {
    void fetchGroups();
  }, [fetchGroups]);

  const paginationPages = useMemo(
    () => Array.from({ length: boardPagination.total_pages }, (_, index) => index + 1),
    [boardPagination.total_pages]
  );

  const openCreateBoardModal = () => {
    setBoardModalMode("create");
    setEditingBoardId(null);
    setBoardForm({
      ...initialBoardForm,
      gr_id: groups[0]?.gr_id ?? "default",
    });
    setBoardFormError("");
    setIsBoardModalOpen(true);
  };

  const openEditBoardModal = async (boTable: string) => {
    setBoardModalMode("edit");
    setEditingBoardId(boTable);
    setBoardFormError("");
    setIsBoardModalOpen(true);
    setIsBoardFormLoading(true);

    try {
      const detail = await getAdminBoardDetail(boTable);
      setBoardForm({
        bo_table: detail.bo_table,
        gr_id: detail.gr_id ?? "default",
        bo_subject: detail.bo_subject ?? "",
        bo_device: detail.bo_device ?? "both",
        bo_skin: detail.bo_skin ?? "basic",
        bo_mobile_skin: detail.bo_mobile_skin ?? "basic",
        bo_order: Number(detail.bo_order ?? 0),
        bo_use_search: Number(detail.bo_use_search ?? 0),
        bo_use_sns: Number(detail.bo_use_sns ?? 0),
        bo_list_level: Number(detail.bo_list_level ?? 1),
        bo_read_level: Number(detail.bo_read_level ?? 1),
        bo_write_level: Number(detail.bo_write_level ?? 1),
        bo_reply_level: Number(detail.bo_reply_level ?? 1),
        bo_comment_level: Number(detail.bo_comment_level ?? 1),
        bo_upload_level: Number(detail.bo_upload_level ?? 1),
        bo_download_level: Number(detail.bo_download_level ?? 1),
        bo_html_level: Number(detail.bo_html_level ?? 1),
        bo_link_level: Number(detail.bo_link_level ?? 1),
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setBoardFormError(error.message);
      } else {
        setBoardFormError("게시판 상세 정보를 불러오지 못했습니다.");
      }
    } finally {
      setIsBoardFormLoading(false);
    }
  };

  const closeBoardModal = () => {
    setIsBoardModalOpen(false);
    setIsBoardFormLoading(false);
    setIsBoardSaving(false);
    setBoardFormError("");
  };

  const { handleOverlayMouseDown, handleOverlayClick } =
    useOverlayDismiss(closeBoardModal);

  const handleBoardFieldChange = (
    key: keyof BoardFormState,
    value: string | number
  ) => {
    setBoardForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleBoardSave = async () => {
    setBoardFormError("");
    setIsBoardSaving(true);

    const payload: AdminBoardSavePayload = {
      bo_table: boardForm.bo_table.trim(),
      gr_id: boardForm.gr_id,
      bo_subject: boardForm.bo_subject.trim(),
      bo_device: boardForm.bo_device,
      bo_skin: boardForm.bo_skin.trim(),
      bo_mobile_skin: boardForm.bo_mobile_skin.trim(),
      bo_order: boardForm.bo_order,
      bo_use_search: boardForm.bo_use_search,
      bo_use_sns: boardForm.bo_use_sns,
      bo_list_level: boardForm.bo_list_level,
      bo_read_level: boardForm.bo_read_level,
      bo_write_level: boardForm.bo_write_level,
      bo_reply_level: boardForm.bo_reply_level,
      bo_comment_level: boardForm.bo_comment_level,
      bo_upload_level: boardForm.bo_upload_level,
      bo_download_level: boardForm.bo_download_level,
      bo_html_level: boardForm.bo_html_level,
      bo_link_level: boardForm.bo_link_level,
    };

    try {
      if (boardModalMode === "create") {
        await createAdminBoard(payload);
      } else {
        await updateAdminBoard(payload);
      }

      closeBoardModal();
      await fetchBoards();
      await fetchGroups();
    } catch (error) {
      if (error instanceof ApiError) {
        setBoardFormError(error.message);
      } else {
        setBoardFormError("게시판 저장 중 오류가 발생했습니다.");
      }
    } finally {
      setIsBoardSaving(false);
    }
  };

  const handleDeleteBoard = async (boTable: string) => {
    const confirmed = window.confirm(
      "게시판을 삭제하면 연결된 글 테이블과 첨부파일 폴더까지 함께 삭제됩니다. 계속할까요?"
    );

    if (!confirmed) return;

    try {
      await deleteAdminBoard(boTable);
      await fetchBoards();
      await fetchGroups();
    } catch (error) {
      if (error instanceof ApiError) {
        setBoardError(error.message);
      } else {
        setBoardError("게시판 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.heroCard}>
        <div>
          <p className={styles.eyebrow}>CUSTOMER SUPPORT</p>
          <h3 className={styles.title}>게시판 관리</h3>
          <p className={styles.description}>
            우선 게시판 목록 중심으로만 확인할 수 있게 정리했습니다. 게시판은 실제
            테이블을 생성/수정/삭제하므로 운영 중인 값은 신중하게 변경해주세요.
          </p>
        </div>

        <div className={styles.heroActions}>
          <button type="button" className={styles.primaryButton} onClick={openCreateBoardModal}>
            게시판 등록
          </button>
        </div>
      </section>

      <section className={styles.filterCard}>
        <div className={styles.filterGrid}>
          <label className={styles.field}>
            <span>검색 항목</span>
            <select
              value={searchField}
              onChange={(event) => {
                setSearchField(
                  event.target.value as (typeof boardSearchFieldOptions)[number]["value"]
                );
                setPage(1);
              }}
            >
              {boardSearchFieldOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>정렬</span>
            <select
              value={sortField}
              onChange={(event) => {
                setSortField(event.target.value as (typeof boardSortOptions)[number]["value"]);
                setPage(1);
              }}
            >
              {boardSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>정렬 방향</span>
            <select
              value={sortDirection}
              onChange={(event) => {
                setSortDirection(
                  event.target.value as (typeof sortDirectionOptions)[number]["value"]
                );
                setPage(1);
              }}
            >
              {sortDirectionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={`${styles.field} ${styles.searchField}`}>
            <span>검색어</span>
            <input
              type="text"
              placeholder="게시판명 또는 ID 검색"
              value={searchKeyword}
              onChange={(event) => {
                setSearchKeyword(event.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>

        <div className={styles.filterActions}>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => {
              setSearchField("bo_subject");
              setSearchKeyword("");
              setSortField("bo_table");
              setSortDirection("DESC");
              setPage(1);
            }}
          >
            초기화
          </button>
          <button type="button" className={styles.primaryButton} onClick={() => void fetchBoards()}>
            목록 새로고침
          </button>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <p className={styles.tableEyebrow}>BOARDS</p>
            <h4 className={styles.tableTitle}>게시판 목록</h4>
          </div>
        </div>

        {boardError && <p className={styles.errorMessage}>{boardError}</p>}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>게시판 ID</th>
                <th>게시판명</th>
                <th>그룹</th>
                <th>디바이스</th>
                <th>검색</th>
                <th>SNS</th>
                <th>정렬순서</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {isBoardLoading && (
                <tr>
                  <td colSpan={8} className={styles.emptyState}>
                    게시판 목록을 불러오는 중입니다.
                  </td>
                </tr>
              )}

              {!isBoardLoading && boards.length === 0 && (
                <tr>
                  <td colSpan={8} className={styles.emptyState}>
                    조회된 게시판이 없습니다.
                  </td>
                </tr>
              )}

              {!isBoardLoading &&
                boards.map((board) => (
                  <tr key={board.bo_table}>
                    <td>{board.bo_table}</td>
                    <td>{board.bo_subject || "-"}</td>
                    <td>{board.gr_id || "-"}</td>
                    <td>{formatDevice(board.bo_device)}</td>
                    <td>{formatYesNo(Number(board.bo_use_search ?? 0))}</td>
                    <td>{formatYesNo(Number(board.bo_use_sns ?? 0))}</td>
                    <td>{board.bo_order ?? 0}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.inlineButton}
                          onClick={() => void openEditBoardModal(board.bo_table)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className={styles.inlineDangerButton}
                          onClick={() => void handleDeleteBoard(board.bo_table)}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className={styles.tableFooter}>
          <p className={styles.resultText}>
            총 {boardPagination.total_count}건 / {boardPagination.current_page ?? 1}페이지
          </p>

          {boardPagination.total_pages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageButton}
                disabled={(boardPagination.current_page ?? 1) <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                이전
              </button>

              {paginationPages.map((paginationPage) => (
                <button
                  key={paginationPage}
                  type="button"
                  className={`${styles.pageButton} ${
                    paginationPage === (boardPagination.current_page ?? 1)
                      ? styles.pageActive
                      : ""
                  }`}
                  onClick={() => setPage(paginationPage)}
                >
                  {paginationPage}
                </button>
              ))}

              <button
                type="button"
                className={styles.pageButton}
                disabled={(boardPagination.current_page ?? 1) >= boardPagination.total_pages}
                onClick={() =>
                  setPage((prev) => Math.min(boardPagination.total_pages, prev + 1))
                }
              >
                다음
              </button>
            </div>
          )}
        </div>
      </section>

      {isBoardModalOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={handleOverlayMouseDown}
          onClick={handleOverlayClick}
        >
          <section className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.tableEyebrow}>
                  {boardModalMode === "create" ? "CREATE" : "EDIT"}
                </p>
                <h4 className={styles.tableTitle}>
                  {boardModalMode === "create" ? "게시판 등록" : "게시판 수정"}
                </h4>
              </div>
              <button type="button" className={styles.modalCloseButton} onClick={closeBoardModal}>
                닫기
              </button>
            </div>

            {boardFormError && <p className={styles.errorMessage}>{boardFormError}</p>}

            {isBoardFormLoading ? (
              <div className={styles.formLoading}>게시판 정보를 불러오는 중입니다.</div>
            ) : (
              <>
                <div className={styles.formGrid}>
                  <div className={`${styles.formNotice} ${styles.fullField}`}>
                    게시판 삭제 시 실제 글 테이블과 파일 폴더도 같이 제거됩니다. 운영 중인
                    게시판은 삭제보다 비노출/정렬 조정으로 관리하는 편이 안전합니다.
                  </div>

                  <label className={styles.field}>
                    <span>게시판 ID</span>
                    <input
                      type="text"
                      value={boardForm.bo_table}
                      disabled={boardModalMode === "edit"}
                      onChange={(event) =>
                        handleBoardFieldChange("bo_table", event.target.value)
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>게시판명</span>
                    <input
                      type="text"
                      value={boardForm.bo_subject}
                      onChange={(event) =>
                        handleBoardFieldChange("bo_subject", event.target.value)
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>그룹</span>
                    <select
                      value={boardForm.gr_id}
                      onChange={(event) => handleBoardFieldChange("gr_id", event.target.value)}
                    >
                      {groups.map((group) => (
                        <option key={group.gr_id} value={group.gr_id}>
                          {group.gr_subject} ({group.gr_id})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.field}>
                    <span>디바이스</span>
                    <select
                      value={boardForm.bo_device}
                      onChange={(event) =>
                        handleBoardFieldChange("bo_device", event.target.value)
                      }
                    >
                      {deviceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.field}>
                    <span>스킨</span>
                    <input
                      type="text"
                      value={boardForm.bo_skin}
                      onChange={(event) => handleBoardFieldChange("bo_skin", event.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span>모바일 스킨</span>
                    <input
                      type="text"
                      value={boardForm.bo_mobile_skin}
                      onChange={(event) =>
                        handleBoardFieldChange("bo_mobile_skin", event.target.value)
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>정렬순서</span>
                    <input
                      type="number"
                      value={boardForm.bo_order}
                      onChange={(event) =>
                        handleBoardFieldChange("bo_order", Number(event.target.value))
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>검색 사용</span>
                    <select
                      value={boardForm.bo_use_search}
                      onChange={(event) =>
                        handleBoardFieldChange("bo_use_search", Number(event.target.value))
                      }
                    >
                      {yesNoOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.field}>
                    <span>SNS 사용</span>
                    <select
                      value={boardForm.bo_use_sns}
                      onChange={(event) =>
                        handleBoardFieldChange("bo_use_sns", Number(event.target.value))
                      }
                    >
                      {yesNoOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.field}>
                    <span>목록 권한</span>
                    <input
                      type="number"
                      value={boardForm.bo_list_level}
                      onChange={(event) =>
                        handleBoardFieldChange("bo_list_level", Number(event.target.value))
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>읽기 권한</span>
                    <input
                      type="number"
                      value={boardForm.bo_read_level}
                      onChange={(event) =>
                        handleBoardFieldChange("bo_read_level", Number(event.target.value))
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>쓰기 권한</span>
                    <input
                      type="number"
                      value={boardForm.bo_write_level}
                      onChange={(event) =>
                        handleBoardFieldChange("bo_write_level", Number(event.target.value))
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>답글 권한</span>
                    <input
                      type="number"
                      value={boardForm.bo_reply_level}
                      onChange={(event) =>
                        handleBoardFieldChange("bo_reply_level", Number(event.target.value))
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>댓글 권한</span>
                    <input
                      type="number"
                      value={boardForm.bo_comment_level}
                      onChange={(event) =>
                        handleBoardFieldChange("bo_comment_level", Number(event.target.value))
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>업로드 권한</span>
                    <input
                      type="number"
                      value={boardForm.bo_upload_level}
                      onChange={(event) =>
                        handleBoardFieldChange("bo_upload_level", Number(event.target.value))
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>다운로드 권한</span>
                    <input
                      type="number"
                      value={boardForm.bo_download_level}
                      onChange={(event) =>
                        handleBoardFieldChange("bo_download_level", Number(event.target.value))
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>HTML 권한</span>
                    <input
                      type="number"
                      value={boardForm.bo_html_level}
                      onChange={(event) =>
                        handleBoardFieldChange("bo_html_level", Number(event.target.value))
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>링크 권한</span>
                    <input
                      type="number"
                      value={boardForm.bo_link_level}
                      onChange={(event) =>
                        handleBoardFieldChange("bo_link_level", Number(event.target.value))
                      }
                    />
                  </label>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.ghostButton} onClick={closeBoardModal}>
                    취소
                  </button>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => void handleBoardSave()}
                    disabled={isBoardSaving}
                  >
                    {isBoardSaving ? "저장 중..." : "저장"}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
