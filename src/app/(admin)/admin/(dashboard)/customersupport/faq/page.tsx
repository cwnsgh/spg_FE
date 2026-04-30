/** Next.js 페이지: FAQ 마스터·항목 관리. URL `/admin/customersupport/faq` */
"use client";

import {
  ApiError,
  deleteAdminFaq,
  deleteAdminFaqMaster,
  getAdminFaqDetail,
  getAdminFaqList,
  getAdminFaqMasterDetail,
  getAdminFaqMasterList,
  saveAdminFaq,
  saveAdminFaqMaster,
} from "@/api";
import { useOverlayDismiss } from "@/hooks/useOverlayDismiss";
import type { AdminFaqItem, AdminFaqMasterItem } from "@/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

interface FaqMasterFormState {
  fm_subject: string;
  fm_order: number;
  fm_head_html: string;
  fm_tail_html: string;
  fm_mobile_head_html: string;
  fm_mobile_tail_html: string;
}

interface FaqFormState {
  fa_subject: string;
  fa_content: string;
  fa_order: number;
}

const initialFaqMasterForm: FaqMasterFormState = {
  fm_subject: "",
  fm_order: 0,
  fm_head_html: "",
  fm_tail_html: "",
  fm_mobile_head_html: "",
  fm_mobile_tail_html: "",
};

const initialFaqForm: FaqFormState = {
  fa_subject: "",
  fa_content: "",
  fa_order: 0,
};

export default function AdminFaqPage() {
  const [masters, setMasters] = useState<AdminFaqMasterItem[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<AdminFaqItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMasterLoading, setIsMasterLoading] = useState(true);
  const [isFaqLoading, setIsFaqLoading] = useState(false);
  const [masterError, setMasterError] = useState("");
  const [faqError, setFaqError] = useState("");

  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [masterModalMode, setMasterModalMode] = useState<"create" | "edit">("create");
  const [masterForm, setMasterForm] = useState<FaqMasterFormState>(initialFaqMasterForm);
  const [editingMasterId, setEditingMasterId] = useState<number | null>(null);
  const [masterHeadImage, setMasterHeadImage] = useState<File | null>(null);
  const [masterTailImage, setMasterTailImage] = useState<File | null>(null);
  const [existingHeadImageUrl, setExistingHeadImageUrl] = useState("");
  const [existingTailImageUrl, setExistingTailImageUrl] = useState("");
  const [isMasterSaving, setIsMasterSaving] = useState(false);
  const [masterFormError, setMasterFormError] = useState("");

  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [faqModalMode, setFaqModalMode] = useState<"create" | "edit">("create");
  const [faqForm, setFaqForm] = useState<FaqFormState>(initialFaqForm);
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [isFaqSaving, setIsFaqSaving] = useState(false);
  const [faqFormError, setFaqFormError] = useState("");

  const fetchMasters = useCallback(async () => {
    setIsMasterLoading(true);
    setMasterError("");

    try {
      const data = await getAdminFaqMasterList();
      setMasters(data);
      setSelectedMasterId((prev) => {
        if (data.length === 0) return null;
        if (prev && data.some((item) => item.fm_id === prev)) return prev;
        return data[0].fm_id;
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setMasterError(error.message);
      } else {
        setMasterError("FAQ 분류 목록을 불러오지 못했습니다.");
      }
    } finally {
      setIsMasterLoading(false);
    }
  }, []);

  const fetchFaqs = useCallback(async () => {
    if (!selectedMasterId) {
      setFaqs([]);
      return;
    }

    setIsFaqLoading(true);
    setFaqError("");

    try {
      const data = await getAdminFaqList(selectedMasterId);
      setFaqs(data);
    } catch (error) {
      if (error instanceof ApiError) {
        setFaqError(error.message);
      } else {
        setFaqError("FAQ 목록을 불러오지 못했습니다.");
      }
    } finally {
      setIsFaqLoading(false);
    }
  }, [selectedMasterId]);

  useEffect(() => {
    void fetchMasters();
  }, [fetchMasters]);

  useEffect(() => {
    void fetchFaqs();
  }, [fetchFaqs]);

  const filteredFaqs = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return faqs;

    return faqs.filter(
      (faq) =>
        faq.fa_subject.toLowerCase().includes(keyword) ||
        faq.fa_content.toLowerCase().includes(keyword)
    );
  }, [faqs, searchKeyword]);

  const selectedMaster = useMemo(
    () => masters.find((item) => item.fm_id === selectedMasterId) ?? null,
    [masters, selectedMasterId]
  );

  const openCreateMasterModal = () => {
    setMasterModalMode("create");
    setEditingMasterId(null);
    setMasterForm(initialFaqMasterForm);
    setMasterHeadImage(null);
    setMasterTailImage(null);
    setExistingHeadImageUrl("");
    setExistingTailImageUrl("");
    setMasterFormError("");
    setIsMasterModalOpen(true);
  };

  const openEditMasterModal = async (fmId: number) => {
    setMasterModalMode("edit");
    setEditingMasterId(fmId);
    setMasterFormError("");
    setMasterHeadImage(null);
    setMasterTailImage(null);
    setIsMasterModalOpen(true);

    try {
      const detail = await getAdminFaqMasterDetail(fmId);
      setMasterForm({
        fm_subject: detail.fm_subject ?? "",
        fm_order: Number(detail.fm_order ?? 0),
        fm_head_html: detail.fm_head_html ?? "",
        fm_tail_html: detail.fm_tail_html ?? "",
        fm_mobile_head_html: detail.fm_mobile_head_html ?? "",
        fm_mobile_tail_html: detail.fm_mobile_tail_html ?? "",
      });
      setExistingHeadImageUrl(detail.fm_himg_url ?? "");
      setExistingTailImageUrl(detail.fm_timg_url ?? "");
    } catch (error) {
      if (error instanceof ApiError) {
        setMasterFormError(error.message);
      } else {
        setMasterFormError("FAQ 분류 정보를 불러오지 못했습니다.");
      }
    }
  };

  const closeMasterModal = () => {
    setIsMasterModalOpen(false);
    setMasterFormError("");
    setIsMasterSaving(false);
  };

  const {
    handleOverlayMouseDown: handleMasterOverlayMouseDown,
    handleOverlayClick: handleMasterOverlayClick,
  } = useOverlayDismiss(closeMasterModal);

  const handleMasterFieldChange = (
    key: keyof FaqMasterFormState,
    value: string | number
  ) => {
    setMasterForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMasterSave = async () => {
    setMasterFormError("");
    setIsMasterSaving(true);

    try {
      const response = await saveAdminFaqMaster({
        fm_id: editingMasterId ?? undefined,
        fm_subject: masterForm.fm_subject.trim(),
        fm_order: masterForm.fm_order,
        fm_head_html: masterForm.fm_head_html,
        fm_tail_html: masterForm.fm_tail_html,
        fm_mobile_head_html: masterForm.fm_mobile_head_html,
        fm_mobile_tail_html: masterForm.fm_mobile_tail_html,
        fm_himg: masterHeadImage,
        fm_timg: masterTailImage,
      });

      closeMasterModal();
      await fetchMasters();

      if (!editingMasterId && response.fm_id) {
        setSelectedMasterId(response.fm_id);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setMasterFormError(error.message);
      } else {
        setMasterFormError("FAQ 분류 저장 중 오류가 발생했습니다.");
      }
    } finally {
      setIsMasterSaving(false);
    }
  };

  const handleDeleteMaster = async (fmId: number) => {
    if (!window.confirm("선택한 FAQ 분류와 소속 FAQ를 모두 삭제하시겠습니까?")) return;

    try {
      await deleteAdminFaqMaster(fmId);
      await fetchMasters();
    } catch (error) {
      if (error instanceof ApiError) {
        setMasterError(error.message);
      } else {
        setMasterError("FAQ 분류 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const openCreateFaqModal = () => {
    if (!selectedMasterId) {
      setFaqError("먼저 FAQ 분류를 선택해주세요.");
      return;
    }

    setFaqModalMode("create");
    setEditingFaqId(null);
    setFaqForm(initialFaqForm);
    setFaqFormError("");
    setIsFaqModalOpen(true);
  };

  const openEditFaqModal = async (faId: number) => {
    setFaqModalMode("edit");
    setEditingFaqId(faId);
    setFaqFormError("");
    setIsFaqModalOpen(true);

    try {
      const detail = await getAdminFaqDetail(faId);
      setFaqForm({
        fa_subject: detail.fa_subject ?? "",
        fa_content: detail.fa_content ?? "",
        fa_order: Number(detail.fa_order ?? 0),
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setFaqFormError(error.message);
      } else {
        setFaqFormError("FAQ 정보를 불러오지 못했습니다.");
      }
    }
  };

  const closeFaqModal = () => {
    setIsFaqModalOpen(false);
    setFaqFormError("");
    setIsFaqSaving(false);
  };

  const {
    handleOverlayMouseDown: handleFaqOverlayMouseDown,
    handleOverlayClick: handleFaqOverlayClick,
  } = useOverlayDismiss(closeFaqModal);

  const handleFaqFieldChange = (key: keyof FaqFormState, value: string | number) => {
    setFaqForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFaqSave = async () => {
    if (!selectedMasterId) {
      setFaqFormError("먼저 FAQ 분류를 선택해주세요.");
      return;
    }

    setFaqFormError("");
    setIsFaqSaving(true);

    try {
      await saveAdminFaq({
        fa_id: editingFaqId ?? undefined,
        fm_id: faqModalMode === "create" ? selectedMasterId : undefined,
        fa_subject: faqForm.fa_subject.trim(),
        fa_content: faqForm.fa_content,
        fa_order: faqForm.fa_order,
      });

      closeFaqModal();
      await fetchFaqs();
      await fetchMasters();
    } catch (error) {
      if (error instanceof ApiError) {
        setFaqFormError(error.message);
      } else {
        setFaqFormError("FAQ 저장 중 오류가 발생했습니다.");
      }
    } finally {
      setIsFaqSaving(false);
    }
  };

  const handleDeleteFaq = async (faId: number) => {
    if (!window.confirm("선택한 FAQ를 삭제하시겠습니까?")) return;

    try {
      await deleteAdminFaq(faId);
      await fetchFaqs();
      await fetchMasters();
    } catch (error) {
      if (error instanceof ApiError) {
        setFaqError(error.message);
      } else {
        setFaqError("FAQ 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.heroCard}>
        <div>
          <p className={styles.eyebrow}>CUSTOMER SUPPORT</p>
          <h3 className={styles.title}>FAQ 관리</h3>
          <p className={styles.description}>
            FAQ 분류와 항목을 한 번에 관리합니다. 분류를 선택하면 해당 분류에 속한 FAQ
            항목만 우측에 표시됩니다.
          </p>
        </div>

        <div className={styles.heroActions}>
          <button type="button" className={styles.secondaryButton} onClick={openCreateMasterModal}>
            분류 등록
          </button>
          <button type="button" className={styles.primaryButton} onClick={openCreateFaqModal}>
            FAQ 등록
          </button>
        </div>
      </section>

      <section className={styles.mainGrid}>
        <article className={styles.sideCard}>
          <div className={styles.tableHeader}>
            <div>
              <p className={styles.tableEyebrow}>MASTER</p>
              <h4 className={styles.tableTitle}>FAQ 분류</h4>
            </div>
          </div>

          {masterError && <p className={styles.errorMessage}>{masterError}</p>}

          <div className={styles.masterList}>
            {isMasterLoading && <div className={styles.emptyPanel}>분류 목록을 불러오는 중입니다.</div>}

            {!isMasterLoading && masters.length === 0 && (
              <div className={styles.emptyPanel}>등록된 FAQ 분류가 없습니다.</div>
            )}

            {!isMasterLoading &&
              masters.map((master) => (
                <button
                  key={master.fm_id}
                  type="button"
                  className={`${styles.masterCard} ${
                    selectedMasterId === master.fm_id ? styles.masterActive : ""
                  }`}
                  onClick={() => setSelectedMasterId(master.fm_id)}
                >
                  <div className={styles.masterCardHeader}>
                    <strong>{master.fm_subject}</strong>
                    <span>{master.faq_count ?? 0}개</span>
                  </div>
                  <p className={styles.masterMeta}>정렬순서 {master.fm_order ?? 0}</p>
                  <div className={styles.rowActions}>
                    <span
                      className={styles.inlineButton}
                      onClick={(event) => {
                        event.stopPropagation();
                        void openEditMasterModal(master.fm_id);
                      }}
                    >
                      수정
                    </span>
                    <span
                      className={styles.inlineDangerButton}
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleDeleteMaster(master.fm_id);
                      }}
                    >
                      삭제
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </article>

        <article className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div>
              <p className={styles.tableEyebrow}>FAQS</p>
              <h4 className={styles.tableTitle}>
                {selectedMaster ? `${selectedMaster.fm_subject} 항목` : "FAQ 항목"}
              </h4>
            </div>
            <div className={styles.filterActions}>
              <label className={`${styles.field} ${styles.searchField}`}>
                <span>검색</span>
                <input
                  type="text"
                  placeholder="질문 또는 내용 검색"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                />
              </label>
            </div>
          </div>

          {faqError && <p className={styles.errorMessage}>{faqError}</p>}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>질문</th>
                  <th>정렬순서</th>
                  <th>내용 요약</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {isFaqLoading && (
                  <tr>
                    <td colSpan={4} className={styles.emptyState}>
                      FAQ 목록을 불러오는 중입니다.
                    </td>
                  </tr>
                )}

                {!isFaqLoading && filteredFaqs.length === 0 && (
                  <tr>
                    <td colSpan={4} className={styles.emptyState}>
                      표시할 FAQ 항목이 없습니다.
                    </td>
                  </tr>
                )}

                {!isFaqLoading &&
                  filteredFaqs.map((faq) => (
                    <tr key={faq.fa_id}>
                      <td>{faq.fa_subject}</td>
                      <td>{faq.fa_order ?? 0}</td>
                      <td>{faq.fa_content.replace(/<[^>]+>/g, "").slice(0, 70) || "-"}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={styles.inlineButton}
                            onClick={() => void openEditFaqModal(faq.fa_id)}
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            className={styles.inlineDangerButton}
                            onClick={() => void handleDeleteFaq(faq.fa_id)}
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
        </article>
      </section>

      {isMasterModalOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={handleMasterOverlayMouseDown}
          onClick={handleMasterOverlayClick}
        >
          <section className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.tableEyebrow}>
                  {masterModalMode === "create" ? "CREATE" : "EDIT"}
                </p>
                <h4 className={styles.tableTitle}>
                  {masterModalMode === "create" ? "FAQ 분류 등록" : "FAQ 분류 수정"}
                </h4>
              </div>
              <button type="button" className={styles.modalCloseButton} onClick={closeMasterModal}>
                닫기
              </button>
            </div>

            {masterFormError && <p className={styles.errorMessage}>{masterFormError}</p>}

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>분류명</span>
                <input
                  type="text"
                  value={masterForm.fm_subject}
                  onChange={(event) =>
                    handleMasterFieldChange("fm_subject", event.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>정렬순서</span>
                <input
                  type="number"
                  value={masterForm.fm_order}
                  onChange={(event) =>
                    handleMasterFieldChange("fm_order", Number(event.target.value))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>상단 이미지</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setMasterHeadImage(event.target.files?.[0] ?? null)}
                />
                {existingHeadImageUrl && (
                  <a
                    href={existingHeadImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.fileLink}
                  >
                    기존 상단 이미지 보기
                  </a>
                )}
              </label>

              <label className={styles.field}>
                <span>하단 이미지</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setMasterTailImage(event.target.files?.[0] ?? null)}
                />
                {existingTailImageUrl && (
                  <a
                    href={existingTailImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.fileLink}
                  >
                    기존 하단 이미지 보기
                  </a>
                )}
              </label>

              <label className={`${styles.field} ${styles.fullField}`}>
                <span>PC 상단 HTML</span>
                <textarea
                  value={masterForm.fm_head_html}
                  onChange={(event) =>
                    handleMasterFieldChange("fm_head_html", event.target.value)
                  }
                />
              </label>

              <label className={`${styles.field} ${styles.fullField}`}>
                <span>PC 하단 HTML</span>
                <textarea
                  value={masterForm.fm_tail_html}
                  onChange={(event) =>
                    handleMasterFieldChange("fm_tail_html", event.target.value)
                  }
                />
              </label>

              <label className={`${styles.field} ${styles.fullField}`}>
                <span>모바일 상단 HTML</span>
                <textarea
                  value={masterForm.fm_mobile_head_html}
                  onChange={(event) =>
                    handleMasterFieldChange("fm_mobile_head_html", event.target.value)
                  }
                />
              </label>

              <label className={`${styles.field} ${styles.fullField}`}>
                <span>모바일 하단 HTML</span>
                <textarea
                  value={masterForm.fm_mobile_tail_html}
                  onChange={(event) =>
                    handleMasterFieldChange("fm_mobile_tail_html", event.target.value)
                  }
                />
              </label>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.ghostButton} onClick={closeMasterModal}>
                취소
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => void handleMasterSave()}
                disabled={isMasterSaving}
              >
                {isMasterSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </section>
        </div>
      )}

      {isFaqModalOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={handleFaqOverlayMouseDown}
          onClick={handleFaqOverlayClick}
        >
          <section className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.tableEyebrow}>
                  {faqModalMode === "create" ? "CREATE" : "EDIT"}
                </p>
                <h4 className={styles.tableTitle}>
                  {faqModalMode === "create" ? "FAQ 등록" : "FAQ 수정"}
                </h4>
              </div>
              <button type="button" className={styles.modalCloseButton} onClick={closeFaqModal}>
                닫기
              </button>
            </div>

            {faqFormError && <p className={styles.errorMessage}>{faqFormError}</p>}

            <div className={styles.formGrid}>
              <label className={`${styles.field} ${styles.fullField}`}>
                <span>질문</span>
                <input
                  type="text"
                  value={faqForm.fa_subject}
                  onChange={(event) => handleFaqFieldChange("fa_subject", event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span>정렬순서</span>
                <input
                  type="number"
                  value={faqForm.fa_order}
                  onChange={(event) =>
                    handleFaqFieldChange("fa_order", Number(event.target.value))
                  }
                />
              </label>

              <label className={`${styles.field} ${styles.fullField}`}>
                <span>답변 내용</span>
                <textarea
                  value={faqForm.fa_content}
                  onChange={(event) => handleFaqFieldChange("fa_content", event.target.value)}
                />
              </label>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.ghostButton} onClick={closeFaqModal}>
                취소
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => void handleFaqSave()}
                disabled={isFaqSaving}
              >
                {isFaqSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
