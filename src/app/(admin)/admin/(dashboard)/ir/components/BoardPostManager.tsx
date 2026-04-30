"use client";

/**
 * 관리자 IR·고객지원 게시판 글 목록·에디터. 사용처: `ir/announcement|content|event`, `customersupport/boards` page.
 */
import {
  ApiError,
  BoardFile,
  BoardPostItem,
  createBoardPost,
  deleteBoardPost,
  getBoardPostDetail,
  getBoardPosts,
  updateBoardPost,
} from "@/api";
import { useOverlayDismiss } from "@/hooks/useOverlayDismiss";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import styles from "./BoardPostManager.module.css";

interface ExistingFileState {
  file: BoardFile;
  remove: boolean;
}

interface BoardPostManagerProps {
  title: string;
  description: string;
  boardTable: string;
  publicListPath: string;
  publicDetailBasePath: string;
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)}KB`;
  }

  return `${size}B`;
}

export default function BoardPostManager({
  title,
  description,
  boardTable,
  publicListPath,
  publicDetailBasePath,
}: BoardPostManagerProps) {
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<BoardPostItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [subject, setSubject] = useState("");
  const [writer, setWriter] = useState("");
  const [content, setContent] = useState("");
  const [isNotice, setIsNotice] = useState(false);
  const [existingFiles, setExistingFiles] = useState<ExistingFileState[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getBoardPosts({
        bo_table: boardTable,
        page,
      });

      setItems(data.list);
      setTotalPages(data.pagination.total_pages);
      setTotalCount(data.pagination.total_count);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("게시글 목록을 불러오지 못했습니다.");
      }
      setItems([]);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [boardTable, page]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const paginationPages = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  );

  const resetForm = useCallback(() => {
    setEditingId(null);
    setSubject("");
    setWriter(user?.mb_name ?? "");
    setContent("");
    setIsNotice(false);
    setExistingFiles([]);
    setNewFiles([]);
    setFormError("");
  }, [user?.mb_name]);

  const openCreateModal = () => {
    setModalMode("create");
    resetForm();
    setIsFormLoading(false);
    setIsModalOpen(true);
  };

  const openEditModal = async (postId: number) => {
    setModalMode("edit");
    resetForm();
    setEditingId(postId);
    setIsFormLoading(true);
    setIsModalOpen(true);

    try {
      const detail = await getBoardPostDetail(boardTable, postId);
      setSubject(detail.subject ?? "");
      setWriter(detail.writer ?? user?.mb_name ?? "");
      setContent(detail.content.replace(/<br\s*\/?>/gi, "\n"));
      setIsNotice(Boolean(detail.is_notice));
      setExistingFiles(
        detail.files.map((file) => ({
          file,
          remove: false,
        }))
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("게시글 상세 정보를 불러오지 못했습니다.");
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsFormLoading(false);
    setIsSaving(false);
    resetForm();
  };

  const { handleOverlayMouseDown, handleOverlayClick } = useOverlayDismiss(closeModal);

  const toggleExistingFileRemoval = (index: number) => {
    setExistingFiles((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, remove: !item.remove } : item
      )
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(event.target.files ?? []);
    setNewFiles(fileList);
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("bo_table", boardTable);
    formData.append("wr_subject", subject.trim());
    formData.append("wr_content", content);
    formData.append("wr_name", writer.trim());
    formData.append("agree", "1");

    if (isNotice) {
      formData.append("notice", "1");
    }

    if (modalMode === "edit" && editingId) {
      formData.append("_method", "PUT");
      formData.append("wr_id", String(editingId));

      existingFiles.forEach((item, index) => {
        if (item.remove) {
          formData.append(`bf_file_del[${index}]`, "1");
        }
      });

      newFiles.forEach((file, index) => {
        formData.append(`bf_file[${existingFiles.length + index}]`, file);
      });
    } else {
      newFiles.forEach((file, index) => {
        formData.append(`bf_file[${index}]`, file);
      });
    }

    return formData;
  };

  const handleSave = async () => {
    if (!subject.trim()) {
      setFormError("제목을 입력해주세요.");
      return;
    }

    if (!writer.trim()) {
      setFormError("작성자를 입력해주세요.");
      return;
    }

    setFormError("");
    setIsSaving(true);

    try {
      const formData = buildFormData();

      if (modalMode === "create") {
        await createBoardPost(formData);
      } else {
        await updateBoardPost(formData);
      }

      closeModal();
      await fetchList();
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("저장 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (postId: number) => {
    const confirmed = window.confirm("선택한 게시글을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await deleteBoardPost({
        bo_table: boardTable,
        wr_id: postId,
      });
      await fetchList();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.heroCard}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>IR INFORMATION</p>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>게시판 ID</span>
              <strong className={styles.summaryValue}>{boardTable}</strong>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>전체 게시글</span>
              <strong className={styles.summaryValue}>{totalCount}건</strong>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>현재 페이지</span>
              <strong className={styles.summaryValue}>{page} / {Math.max(totalPages, 1)}</strong>
            </div>
          </div>
        </div>

        <div className={styles.heroActions}>
          <a
            href={publicListPath}
            target="_blank"
            rel="noreferrer"
            className={styles.previewButton}
          >
            공개 화면 보기
          </a>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => void fetchList()}
          >
            새로고침
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={openCreateModal}
          >
            글쓰기
          </button>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <p className={styles.tableEyebrow}>POSTS</p>
            <h4 className={styles.tableTitle}>게시글 목록</h4>
          </div>
          <p className={styles.tableMeta}>
            총 {totalCount}건 / {page}페이지
          </p>
        </div>

        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "8rem" }}>번호</th>
                <th>제목</th>
                <th style={{ width: "12rem" }}>작성자</th>
                <th style={{ width: "12rem" }}>작성일</th>
                <th style={{ width: "9rem" }}>조회수</th>
                <th style={{ width: "21rem" }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    게시글 목록을 불러오는 중입니다.
                  </td>
                </tr>
              )}

              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    등록된 게시글이 없습니다.
                  </td>
                </tr>
              )}

              {!isLoading &&
                items.map((item) => (
                  <tr key={item.id}>
                    <td className={styles.numberCell}>{item.num ?? item.id}</td>
                    <td className={styles.subjectCell}>
                      <div className={styles.subjectWrap}>
                        {item.is_notice && (
                          <span className={styles.noticeBadge}>공지</span>
                        )}
                        <div className={styles.subjectText}>{item.subject}</div>
                      </div>
                    </td>
                    <td className={styles.metaCell}>{item.writer}</td>
                    <td className={styles.metaCell}>{item.datetime}</td>
                    <td className={styles.metaCell}>{item.hit}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <a
                          href={`${publicDetailBasePath}/${item.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.previewButton}
                        >
                          미리보기
                        </a>
                        <button
                          type="button"
                          className={styles.inlineButton}
                          onClick={() => void openEditModal(item.id)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className={styles.inlineDangerButton}
                          onClick={() => void handleDelete(item.id)}
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
          <p className={styles.resultText}>게시판 ID: {boardTable}</p>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageButton}
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                이전
              </button>
              {paginationPages.map((paginationPage) => (
                <button
                  key={paginationPage}
                  type="button"
                  className={`${styles.pageButton} ${
                    paginationPage === page ? styles.pageActive : ""
                  }`}
                  onClick={() => setPage(paginationPage)}
                >
                  {paginationPage}
                </button>
              ))}
              <button
                type="button"
                className={styles.pageButton}
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                다음
              </button>
            </div>
          )}
        </div>
      </section>

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={handleOverlayMouseDown}
          onClick={handleOverlayClick}
        >
          <section
            className={styles.modalCard}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.tableEyebrow}>
                  {modalMode === "create" ? "CREATE" : "EDIT"}
                </p>
                <h4 className={styles.tableTitle}>
                  {modalMode === "create" ? "게시글 등록" : "게시글 수정"}
                </h4>
              </div>
              <div className={styles.headerActions}>
                {editingId && (
                  <a
                    href={`${publicDetailBasePath}/${editingId}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.previewButton}
                  >
                    공개 상세 보기
                  </a>
                )}
                <button
                  type="button"
                  className={styles.modalCloseButton}
                  onClick={closeModal}
                >
                  닫기
                </button>
              </div>
            </div>

            {formError && <p className={styles.errorMessage}>{formError}</p>}

            {isFormLoading ? (
              <div className={styles.formLoading}>
                게시글 정보를 불러오는 중입니다.
              </div>
            ) : (
              <>
                <div className={styles.formGrid}>
                  <div className={`${styles.formNotice} ${styles.fullField}`}>
                    공개 IR 페이지에 바로 노출되는 데이터입니다. 제목과 본문,
                    첨부파일을 저장하면 사용자 화면에 즉시 반영됩니다.
                  </div>

                  <label className={styles.field}>
                    <span>제목</span>
                    <input
                      type="text"
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      placeholder="공개 화면에 보여질 제목을 입력하세요"
                    />
                  </label>

                  <label className={styles.field}>
                    <span>작성자</span>
                    <input
                      type="text"
                      value={writer}
                      onChange={(event) => setWriter(event.target.value)}
                      placeholder="예: 관리자"
                    />
                  </label>

                  <div className={`${styles.field} ${styles.fullField}`}>
                    <span>옵션</span>
                    <div className={styles.toggleRow}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={isNotice}
                          onChange={(event) => setIsNotice(event.target.checked)}
                        />
                        공지글로 고정
                      </label>
                    </div>
                  </div>

                  <label className={`${styles.field} ${styles.fullField}`}>
                    <span>본문</span>
                    <textarea
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      placeholder="본문 내용을 입력하세요. 줄바꿈은 공개 화면에도 그대로 반영됩니다."
                    />
                  </label>

                  {modalMode === "edit" && existingFiles.length > 0 && (
                    <div className={`${styles.field} ${styles.fullField}`}>
                      <span>기존 첨부파일</span>
                      <div className={styles.fileList}>
                        {existingFiles.map((item, index) => (
                          <div key={`${item.file.bf_file}-${index}`} className={styles.fileItem}>
                            <div className={styles.fileName}>
                              {item.file.bf_source}
                              <div className={styles.fileHint}>
                                {formatFileSize(item.file.bf_filesize)} · 삭제 체크 후 저장하면 파일이 제거됩니다.
                              </div>
                            </div>
                            <label className={styles.checkboxLabel}>
                              <input
                                type="checkbox"
                                checked={item.remove}
                                onChange={() => toggleExistingFileRemoval(index)}
                              />
                              삭제
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <label className={`${styles.field} ${styles.fullField}`}>
                    <span>새 첨부파일</span>
                    <input
                      type="file"
                      multiple
                      className={styles.fileInput}
                      onChange={handleFileChange}
                    />
                    {newFiles.length > 0 && (
                      <div className={styles.fileList}>
                        {newFiles.map((file) => (
                          <div key={`${file.name}-${file.size}`} className={styles.fileItem}>
                            <div className={styles.fileName}>
                              {file.name}
                              <div className={styles.fileHint}>
                                {formatFileSize(file.size)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </label>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.ghostButton}
                    onClick={closeModal}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => void handleSave()}
                    disabled={isSaving}
                  >
                    {isSaving ? "저장 중..." : "저장"}
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
