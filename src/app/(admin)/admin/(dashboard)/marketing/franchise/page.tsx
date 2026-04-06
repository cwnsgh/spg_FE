"use client";

import Script from "next/script";
import {
  ApiError,
  createAdminFranchise,
  deleteAdminFranchise,
  getAdminFranchiseDetail,
  getAdminFranchiseList,
  updateAdminFranchise,
} from "@/api";
import { useOverlayDismiss } from "@/hooks/useOverlayDismiss";
import type { AdminFranchiseListData, AdminFranchiseSavePayload, FranchiseItem } from "@/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

interface DaumPostcodeData {
  address: string;
  roadAddress: string;
  jibunAddress: string;
  sido: string;
  sigungu: string;
  zonecode: string;
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
      }) => {
        open: () => void;
      };
    };
  }
}

const franchiseTypeOptions = [
  { value: 1, label: "해외지사" },
  { value: 2, label: "국내대리점" },
  { value: 3, label: "해외대리점" },
  { value: 4, label: "전문특판점" },
  { value: 5, label: "국방 전문대리점" },
];

const sortOptions = [
  { value: "date-desc", label: "등록일 최신순" },
  { value: "date-asc", label: "등록일 오래된순" },
  { value: "name-asc", label: "업체명 가나다순" },
  { value: "name-desc", label: "업체명 역순" },
] as const;

type SortOption = (typeof sortOptions)[number]["value"];

function getTypeLabel(gfType: number) {
  return (
    franchiseTypeOptions.find((option) => option.value === gfType)?.label ??
    `타입 ${gfType}`
  );
}

function getRegionLabel(item: FranchiseItem) {
  if (item.gf_type === 1 || item.gf_type === 3) return "해외";
  return "국내";
}

function formatDate(dateTime: string) {
  if (!dateTime) return "-";
  return dateTime.slice(0, 10);
}

interface FranchiseFormState {
  gf_type: number;
  gf_subject: string;
  gf_continent: string;
  gf_nation: string;
  gf_area: string;
  gf_addr: string;
  gf_contact: string;
  gf_tel: string;
  gf_fax: string;
  gf_email: string;
  gf_url: string;
  gf_map_url: string;
}

const initialFormState: FranchiseFormState = {
  gf_type: 2,
  gf_subject: "",
  gf_continent: "",
  gf_nation: "",
  gf_area: "",
  gf_addr: "",
  gf_contact: "",
  gf_tel: "",
  gf_fax: "",
  gf_email: "",
  gf_url: "",
  gf_map_url: "",
};

const initialPagination: AdminFranchiseListData["pagination"] = {
  total_count: 0,
  total_pages: 0,
  current_page: 1,
  limit: 50,
};

export default function AdminFranchisePage() {
  const [gfType, setGfType] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [items, setItems] = useState<FranchiseItem[]>([]);
  const [pagination, setPagination] =
    useState<AdminFranchiseListData["pagination"]>(initialPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formValues, setFormValues] = useState<FranchiseFormState>(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [certFile, setCertFile] = useState<File | null>(null);
  const [existingCertUrl, setExistingCertUrl] = useState("");
  const [deleteExistingCert, setDeleteExistingCert] = useState(false);
  const [isAddressScriptLoaded, setIsAddressScriptLoaded] = useState(false);

  const fetchFranchiseList = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getAdminFranchiseList({
        gf_type: gfType,
        page: currentPage,
        limit: 50,
      });

      setItems(data.items);
      setPagination(data.pagination);
      setSelectedIds([]);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("프랜차이즈 목록을 불러오지 못했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, gfType]);

  useEffect(() => {
    void fetchFranchiseList();
  }, [fetchFranchiseList]);

  const filteredItems = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) => {
      const searchTargets = [
        item.gf_subject,
        item.gf_area,
        item.gf_contact,
        item.gf_nation,
        item.gf_addr,
      ];

      return searchTargets.some((target) =>
        target?.toLowerCase().includes(keyword)
      );
    });
  }, [items, searchKeyword]);

  const sortedItems = useMemo(() => {
    const nextItems = [...filteredItems];

    nextItems.sort((a, b) => {
      if (sortOption === "name-asc") {
        return a.gf_subject.localeCompare(b.gf_subject, "ko");
      }

      if (sortOption === "name-desc") {
        return b.gf_subject.localeCompare(a.gf_subject, "ko");
      }

      const timeA = new Date(a.gf_datetime).getTime();
      const timeB = new Date(b.gf_datetime).getTime();

      return sortOption === "date-asc" ? timeA - timeB : timeB - timeA;
    });

    return nextItems;
  }, [filteredItems, sortOption]);

  const isAllSelected =
    sortedItems.length > 0 &&
    sortedItems.every((item) => selectedIds.includes(item.gf_id));

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(sortedItems.map((item) => item.gf_id));
  };

  const handleToggleRow = (gfId: number) => {
    setSelectedIds((prev) =>
      prev.includes(gfId) ? prev.filter((id) => id !== gfId) : [...prev, gfId]
    );
  };

  const handleDelete = async (gfId: number) => {
    if (!window.confirm("선택한 프랜차이즈 업체를 삭제하시겠습니까?")) return;

    try {
      await deleteAdminFranchise(gfId);
      setSelectedIds((prev) => prev.filter((id) => id !== gfId));
      await fetchFranchiseList();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm("선택한 프랜차이즈 업체를 삭제하시겠습니까?")) return;

    try {
      await Promise.all(selectedIds.map((gfId) => deleteAdminFranchise(gfId)));
      await fetchFranchiseList();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("선택 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleReset = () => {
    setGfType(2);
    setCurrentPage(1);
    setSearchKeyword("");
    setSortOption("date-desc");
    setSelectedIds([]);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingId(null);
    setFormValues({
      ...initialFormState,
      gf_type: gfType,
    });
    setCertFile(null);
    setExistingCertUrl("");
    setDeleteExistingCert(false);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = async (gfId: number) => {
    setModalMode("edit");
    setEditingId(gfId);
    setFormError("");
    setCertFile(null);
    setDeleteExistingCert(false);
    setIsModalOpen(true);
    setIsFormLoading(true);

    try {
      const detail = await getAdminFranchiseDetail(gfId);
      setFormValues({
        gf_type: detail.gf_type,
        gf_subject: detail.gf_subject ?? "",
        gf_continent: detail.gf_continent ?? "",
        gf_nation: detail.gf_nation ?? "",
        gf_area: detail.gf_area ?? "",
        gf_addr: detail.gf_addr ?? "",
        gf_contact: detail.gf_contact ?? "",
        gf_tel: detail.gf_tel ?? "",
        gf_fax: detail.gf_fax ?? "",
        gf_email: detail.gf_email ?? "",
        gf_url: detail.gf_url ?? "",
        gf_map_url: detail.gf_map_url ?? "",
      });
      setExistingCertUrl(detail.gf_certi_url ?? "");
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("상세 정보를 불러오지 못했습니다.");
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

  const handleFormChange = (
    key: keyof FranchiseFormState,
    value: string | number
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleTypeChange = (nextType: number) => {
    setFormValues((prev) => ({
      ...prev,
      gf_type: nextType,
      gf_continent:
        nextType === 2 || nextType === 4 || nextType === 5 ? "아시아" : prev.gf_continent,
      gf_nation:
        nextType === 2 || nextType === 4 || nextType === 5
          ? "대한민국"
          : prev.gf_nation,
      gf_contact: nextType === 5 ? "" : prev.gf_contact,
    }));
    setCertFile(null);
    setDeleteExistingCert(false);
  };

  const handleSave = async () => {
    setFormError("");
    setIsSaving(true);

    const payload: AdminFranchiseSavePayload = {
      gf_type: formValues.gf_type,
      gf_subject: formValues.gf_subject,
      gf_continent: formValues.gf_continent,
      gf_nation: formValues.gf_nation,
      gf_area: formValues.gf_area,
      gf_addr: formValues.gf_addr,
      gf_contact: formValues.gf_contact,
      gf_tel: formValues.gf_tel,
      gf_fax: formValues.gf_fax,
      gf_email: formValues.gf_email,
      gf_url: formValues.gf_url,
      gf_map_url: formValues.gf_map_url,
      gf_certi: certFile,
      gf_certi_del: deleteExistingCert,
    };

    try {
      if (modalMode === "create") {
        await createAdminFranchise(payload);
      } else if (editingId) {
        await updateAdminFranchise({
          ...payload,
          gf_id: editingId,
        });
      }

      closeModal();
      await fetchFranchiseList();
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

  const showLocationFields = formValues.gf_type === 1 || formValues.gf_type === 3;
  const showContactFields = formValues.gf_type !== 1 && formValues.gf_type !== 5;
  const showMapField = formValues.gf_type === 1;
  const showCertField = formValues.gf_type === 5;
  const canSearchAddress =
    formValues.gf_type === 2 || formValues.gf_type === 4 || formValues.gf_type === 5;
  const paginationPages = Array.from(
    { length: pagination.total_pages },
    (_, index) => index + 1
  );

  const handleSearchAddress = () => {
    if (!canSearchAddress) {
      setFormError("해외 유형은 주소를 직접 입력해주세요.");
      return;
    }

    if (!window.daum?.Postcode) {
      setFormError("주소 검색 스크립트가 아직 로드되지 않았습니다.");
      return;
    }

    setFormError("");

    new window.daum.Postcode({
      oncomplete: (data) => {
        const nextAddress = data.roadAddress || data.jibunAddress || data.address;
        const nextArea = data.sigungu || data.sido || formValues.gf_area;

        setFormValues((prev) => ({
          ...prev,
          gf_addr: nextAddress,
          gf_area: prev.gf_area || nextArea,
          gf_continent:
            prev.gf_type === 2 || prev.gf_type === 4 || prev.gf_type === 5
              ? "아시아"
              : prev.gf_continent,
          gf_nation:
            prev.gf_type === 2 || prev.gf_type === 4 || prev.gf_type === 5
              ? "대한민국"
              : prev.gf_nation,
        }));
      },
    }).open();
  };

  return (
    <main className={styles.page}>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="afterInteractive"
        onLoad={() => setIsAddressScriptLoaded(true)}
      />

      <section className={styles.heroCard}>
        <div>
          <p className={styles.eyebrow}>MARKETING</p>
          <h3 className={styles.title}>프랜차이즈 관리</h3>
          <p className={styles.description}>
            대리점, 지사, 특약점 데이터를 등록, 수정, 삭제하기 위한 관리자 화면
            뼈대입니다. 실제 API 연결 전에 작업 흐름과 화면 구성을 먼저 정리합니다.
          </p>
        </div>

        <div className={styles.heroActions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={openCreateModal}
          >
            업체 등록
          </button>
        </div>
      </section>

      <section className={styles.filterCard}>
        <div className={styles.filterGrid}>
          <label className={styles.field}>
            <span>유형</span>
            <select
              value={gfType}
              onChange={(event) => {
                setGfType(Number(event.target.value));
                setCurrentPage(1);
                setSelectedIds([]);
              }}
            >
              {franchiseTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>정렬</span>
            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as SortOption)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={`${styles.field} ${styles.searchField}`}>
            <span>검색</span>
            <input
              type="text"
              placeholder="업체명 또는 담당자 검색"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
            />
          </label>
        </div>

        <div className={styles.filterActions}>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={handleReset}
          >
            초기화
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => void fetchFranchiseList()}
          >
            검색
          </button>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <p className={styles.tableEyebrow}>LIST</p>
            <h4 className={styles.tableTitle}>프랜차이즈 업체 목록</h4>
          </div>

          <div className={styles.tableActions}>
            <button
              type="button"
              className={styles.ghostButton}
              onClick={() => void handleDeleteSelected()}
              disabled={selectedIds.length === 0}
            >
              선택 삭제
            </button>
          </div>
        </div>

        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="전체 선택"
                    checked={isAllSelected}
                    onChange={handleToggleAll}
                  />
                </th>
                <th>업체명</th>
                <th>구분</th>
                <th>유형</th>
                <th>담당자</th>
                <th>연락처</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} className={styles.emptyState}>
                    목록을 불러오는 중입니다.
                  </td>
                </tr>
              )}

              {!isLoading && filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className={styles.emptyState}>
                    조회된 프랜차이즈 데이터가 없습니다.
                  </td>
                </tr>
              )}

              {!isLoading &&
                sortedItems.map((row) => (
                  <tr key={row.gf_id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`${row.gf_subject} 선택`}
                        checked={selectedIds.includes(row.gf_id)}
                        onChange={() => handleToggleRow(row.gf_id)}
                      />
                    </td>
                    <td>{row.gf_subject}</td>
                    <td>{getRegionLabel(row)}</td>
                    <td>
                      <span className={`${styles.statusChip} ${styles.active}`}>
                        {getTypeLabel(row.gf_type)}
                      </span>
                    </td>
                    <td>{row.gf_contact || "-"}</td>
                    <td>{row.gf_tel || row.gf_email || "-"}</td>
                    <td>{formatDate(row.gf_datetime)}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.inlineButton}
                          onClick={() => void openEditModal(row.gf_id)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className={styles.inlineDangerButton}
                          onClick={() => void handleDelete(row.gf_id)}
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
                onClick={() =>
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }
              >
                이전
              </button>

              {paginationPages.map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`${styles.pageButton} ${
                    page === (pagination.current_page ?? 1) ? styles.pageActive : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                className={styles.pageButton}
                disabled={(pagination.current_page ?? 1) >= pagination.total_pages}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(pagination.total_pages, prev + 1)
                  )
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
                  {modalMode === "create"
                    ? "프랜차이즈 업체 등록"
                    : "프랜차이즈 업체 수정"}
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
              <div className={styles.formLoading}>상세 정보를 불러오는 중입니다.</div>
            ) : (
              <>
                <div className={styles.formGrid}>
                  <div className={`${styles.formNotice} ${styles.fullField}`}>
                    유형에 따라 필수 입력 항목이 달라집니다. 해외지사는 구글맵 링크,
                    국방 전문대리점은 인증서 이미지 업로드를 확인해주세요.
                  </div>

                  <label className={styles.field}>
                    <span>유형</span>
                    <select
                      value={formValues.gf_type}
                      onChange={(event) => handleTypeChange(Number(event.target.value))}
                    >
                      {franchiseTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.field}>
                    <span>업체명</span>
                    <input
                      type="text"
                      value={formValues.gf_subject}
                      onChange={(event) =>
                        handleFormChange("gf_subject", event.target.value)
                      }
                    />
                  </label>

                  <label className={styles.field}>
                    <span>지역명</span>
                    <input
                      type="text"
                      value={formValues.gf_area}
                      onChange={(event) =>
                        handleFormChange("gf_area", event.target.value)
                      }
                    />
                  </label>

                  <label className={`${styles.field} ${styles.fullField}`}>
                    <span>주소</span>
                    <div className={styles.addressRow}>
                      <input
                        type="text"
                        value={formValues.gf_addr}
                        onChange={(event) =>
                          handleFormChange("gf_addr", event.target.value)
                        }
                        placeholder={
                          canSearchAddress
                            ? "주소 검색 또는 직접 입력"
                            : "해외 주소를 직접 입력해주세요"
                        }
                      />
                      <button
                        type="button"
                        className={styles.addressSearchButton}
                        onClick={handleSearchAddress}
                        disabled={!canSearchAddress || !isAddressScriptLoaded}
                      >
                        주소 검색
                      </button>
                    </div>
                    {canSearchAddress ? (
                      <p className={styles.fieldHelp}>
                        국내 유형은 다음 주소검색으로 기본 주소를 입력할 수 있습니다.
                      </p>
                    ) : (
                      <p className={styles.fieldHelp}>
                        해외 유형은 주소 검색을 지원하지 않아 직접 입력합니다.
                      </p>
                    )}
                  </label>

                  {showLocationFields && (
                    <>
                      <label className={styles.field}>
                        <span>대륙</span>
                        <input
                          type="text"
                          value={formValues.gf_continent}
                          onChange={(event) =>
                            handleFormChange("gf_continent", event.target.value)
                          }
                        />
                      </label>

                      <label className={styles.field}>
                        <span>국가</span>
                        <input
                          type="text"
                          value={formValues.gf_nation}
                          onChange={(event) =>
                            handleFormChange("gf_nation", event.target.value)
                          }
                        />
                      </label>
                    </>
                  )}

                  {showContactFields && (
                    <>
                      <label className={styles.field}>
                        <span>담당자</span>
                        <input
                          type="text"
                          value={formValues.gf_contact}
                          onChange={(event) =>
                            handleFormChange("gf_contact", event.target.value)
                          }
                        />
                      </label>

                      <label className={styles.field}>
                        <span>전화번호</span>
                        <input
                          type="text"
                          value={formValues.gf_tel}
                          onChange={(event) =>
                            handleFormChange("gf_tel", event.target.value)
                          }
                        />
                      </label>

                      <label className={styles.field}>
                        <span>팩스</span>
                        <input
                          type="text"
                          value={formValues.gf_fax}
                          onChange={(event) =>
                            handleFormChange("gf_fax", event.target.value)
                          }
                        />
                      </label>

                      <label className={styles.field}>
                        <span>이메일</span>
                        <input
                          type="text"
                          value={formValues.gf_email}
                          onChange={(event) =>
                            handleFormChange("gf_email", event.target.value)
                          }
                        />
                      </label>

                      <label className={`${styles.field} ${styles.fullField}`}>
                        <span>웹사이트</span>
                        <input
                          type="text"
                          value={formValues.gf_url}
                          onChange={(event) =>
                            handleFormChange("gf_url", event.target.value)
                          }
                        />
                      </label>
                    </>
                  )}

                  {showMapField && (
                    <label className={`${styles.field} ${styles.fullField}`}>
                      <span>구글맵 링크</span>
                      <input
                        type="text"
                        value={formValues.gf_map_url}
                        onChange={(event) =>
                          handleFormChange("gf_map_url", event.target.value)
                        }
                      />
                    </label>
                  )}

                  {showCertField && (
                    <div className={`${styles.field} ${styles.fullField}`}>
                      <span>인증서 이미지</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif"
                        onChange={(event) =>
                          setCertFile(event.target.files?.[0] ?? null)
                        }
                      />

                      {existingCertUrl && (
                        <div className={styles.certPreviewBox}>
                          <a
                            href={existingCertUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.certLink}
                          >
                            기존 인증서 이미지 보기
                          </a>
                          <label className={styles.checkLabel}>
                            <input
                              type="checkbox"
                              checked={deleteExistingCert}
                              onChange={(event) =>
                                setDeleteExistingCert(event.target.checked)
                              }
                            />
                            기존 인증서 이미지 삭제
                          </label>
                        </div>
                      )}

                      {certFile && (
                        <p className={styles.fileName}>
                          새 파일: {certFile.name}
                        </p>
                      )}
                    </div>
                  )}
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
