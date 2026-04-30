"use client";

/**
 * 관리자 재무·손익·현금흐름표 편집 UI. 사용처: `ir/financial-statement`, `income-statement`, `cash-flow` page.
 */
import {
  ApiError,
  AdminIrListData,
  AdminIrListItem,
  AdminIrSavePayload,
  AdminIrStatementDetail,
} from "@/api";
import { useOverlayDismiss } from "@/hooks/useOverlayDismiss";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./IrStatementManager.module.css";

type QuarterRow = [string, string, string, string];

interface IrStatementManagerProps {
  eyebrow: string;
  title: string;
  description: string;
  rowLabels: string[];
  statementUnit?: string;
  getList: (params?: { page?: number; limit?: number }) => Promise<AdminIrListData>;
  getDetail: (giId: number) => Promise<AdminIrStatementDetail>;
  createItem: (payload: AdminIrSavePayload) => Promise<{ message?: string }>;
  updateItem: (payload: AdminIrSavePayload) => Promise<{ message?: string }>;
  deleteItem: (giId: number) => Promise<{ message?: string }>;
}

const INITIAL_PAGINATION: AdminIrListData["pagination"] = {
  total_count: 0,
  total_pages: 0,
  current_page: 1,
  limit: 20,
};

function createEmptyRows(length: number): QuarterRow[] {
  return Array.from({ length }, () => ["", "", "", ""]);
}

function buildRowsFromDetail(
  detail: AdminIrStatementDetail,
  rowCount: number
): QuarterRow[] {
  return Array.from({ length: rowCount }, (_, index) => {
    const row = detail[`gi_${index}`] ?? ["", "", "", ""];
    return [
      row[0] ?? "",
      row[1] ?? "",
      row[2] ?? "",
      row[3] ?? "",
    ];
  });
}

function buildPayload(
  giYear: string,
  rows: QuarterRow[],
  giId?: number
): AdminIrSavePayload {
  const payload: AdminIrSavePayload = {
    gi_year: giYear.trim(),
  };

  if (giId) {
    payload.gi_id = giId;
  }

  rows.forEach((row, index) => {
    payload[`gi_${index}`] = row;
  });

  return payload;
}

export default function IrStatementManager({
  eyebrow,
  title,
  description,
  rowLabels,
  statementUnit = "단위 : 백만원, %",
  getList,
  getDetail,
  createItem,
  updateItem,
  deleteItem,
}: IrStatementManagerProps) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminIrListItem[]>([]);
  const [pagination, setPagination] =
    useState<AdminIrListData["pagination"]>(INITIAL_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formYear, setFormYear] = useState("");
  const [formRows, setFormRows] = useState<QuarterRow[]>(() =>
    createEmptyRows(rowLabels.length)
  );
  const [formError, setFormError] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getList({ page, limit: 20 });
      setItems(data.items);
      setPagination(data.pagination);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("목록을 불러오지 못했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [getList, page]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const paginationPages = useMemo(
    () => Array.from({ length: pagination.total_pages }, (_, index) => index + 1),
    [pagination.total_pages]
  );

  const openCreateModal = () => {
    setModalMode("create");
    setEditingId(null);
    setFormYear("");
    setFormRows(createEmptyRows(rowLabels.length));
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = async (giId: number) => {
    setModalMode("edit");
    setEditingId(giId);
    setFormError("");
    setIsFormLoading(true);
    setIsModalOpen(true);

    try {
      const detail = await getDetail(giId);
      setFormYear(detail.gi_year ?? "");
      setFormRows(buildRowsFromDetail(detail, rowLabels.length));
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("상세 데이터를 불러오지 못했습니다.");
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsFormLoading(false);
    setIsSaving(false);
    setFormError("");
  };

  const { handleOverlayMouseDown, handleOverlayClick } = useOverlayDismiss(closeModal);

  const handleQuarterChange = (
    rowIndex: number,
    quarterIndex: number,
    value: string
  ) => {
    setFormRows((prev) =>
      prev.map((row, index) => {
        if (index !== rowIndex) return row;
        const nextRow: QuarterRow = [...row] as QuarterRow;
        nextRow[quarterIndex] = value;
        return nextRow;
      })
    );
  };

  const handleSave = async () => {
    if (!formYear.trim()) {
      setFormError("연도를 입력해주세요.");
      return;
    }

    setFormError("");
    setIsSaving(true);

    try {
      const payload = buildPayload(formYear, formRows, editingId ?? undefined);

      if (modalMode === "create") {
        await createItem(payload);
      } else if (editingId) {
        await updateItem(payload);
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

  const handleDelete = async (giId: number) => {
    const confirmed = window.confirm("선택한 데이터를 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await deleteItem(giId);
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
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={styles.heroActions}>
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
            데이터 등록
          </button>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <p className={styles.tableEyebrow}>LIST</p>
            <h4 className={styles.tableTitle}>{title} 목록</h4>
          </div>
          <p className={styles.tableMeta}>
            항목 수 {rowLabels.length}개 / {statementUnit}
          </p>
        </div>

        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>연도</th>
                <th>구성</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    목록을 불러오는 중입니다.
                  </td>
                </tr>
              )}

              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    등록된 데이터가 없습니다.
                  </td>
                </tr>
              )}

              {!isLoading &&
                items.map((item) => (
                  <tr key={item.gi_id}>
                    <td>{item.gi_id}</td>
                    <td>{item.gi_year}</td>
                    <td>{rowLabels.length}개 항목</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.inlineButton}
                          onClick={() => void openEditModal(item.gi_id)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className={styles.inlineDangerButton}
                          onClick={() => void handleDelete(item.gi_id)}
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
            총 {pagination.total_count}건 / {pagination.current_page ?? 1}페이지
          </p>

          {pagination.total_pages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageButton}
                disabled={(pagination.current_page ?? 1) <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                이전
              </button>

              {paginationPages.map((paginationPage) => (
                <button
                  key={paginationPage}
                  type="button"
                  className={`${styles.pageButton} ${
                    paginationPage === (pagination.current_page ?? 1)
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
                disabled={(pagination.current_page ?? 1) >= pagination.total_pages}
                onClick={() =>
                  setPage((prev) => Math.min(pagination.total_pages, prev + 1))
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
                  {modalMode === "create" ? `${title} 등록` : `${title} 수정`}
                </h4>
              </div>
              <button
                type="button"
                className={styles.modalCloseButton}
                onClick={closeModal}
              >
                닫기
              </button>
            </div>

            {formError && <p className={styles.errorMessage}>{formError}</p>}

            {isFormLoading ? (
              <div className={styles.formLoading}>상세 데이터를 불러오는 중입니다.</div>
            ) : (
              <>
                <div className={styles.formTopRow}>
                  <label className={styles.field}>
                    <span>연도</span>
                    <input
                      type="text"
                      value={formYear}
                      placeholder="예: 2025"
                      onChange={(event) => setFormYear(event.target.value)}
                    />
                  </label>
                  <div className={styles.formNotice}>
                    분기 데이터는 빈 값으로 저장할 수 있습니다. 숫자 외 문자가 필요한
                    경우에도 그대로 입력 가능합니다.
                  </div>
                </div>

                <div className={styles.statementTableWrap}>
                  <div className={styles.statementHeader}>
                    <div className={styles.statementLabelCell}>항목</div>
                    <div className={styles.statementQuarterCell}>1분기</div>
                    <div className={styles.statementQuarterCell}>2분기</div>
                    <div className={styles.statementQuarterCell}>3분기</div>
                    <div className={styles.statementQuarterCell}>4분기</div>
                  </div>

                  <div className={styles.statementBody}>
                    {rowLabels.map((label, rowIndex) => (
                      <div key={label} className={styles.statementRow}>
                        <div className={styles.statementLabelCell}>{label}</div>
                        {formRows[rowIndex].map((value, quarterIndex) => (
                          <input
                            key={`${label}-${quarterIndex}`}
                            type="text"
                            className={styles.statementInput}
                            value={value}
                            onChange={(event) =>
                              handleQuarterChange(
                                rowIndex,
                                quarterIndex,
                                event.target.value
                              )
                            }
                          />
                        ))}
                      </div>
                    ))}
                  </div>
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
