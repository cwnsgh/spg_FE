"use client";

import {
  ApiError,
  BoardInfo,
  BoardPostItem,
  authenticateBoardPost,
  createBoardPost,
  getBoardInfo,
  getBoardPosts,
} from "@/api";
import { useOverlayDismiss } from "@/hooks/useOverlayDismiss";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import styles from "./InquirySection.module.css";

const INQUIRY_BOARD_TABLE = {
  ko: "cus_res",
  en: "cus_res_en",
} as const;

const INQUIRY_CATEGORY_PRESETS: Record<InquiryLanguage, string[]> = {
  ko: ["영업지원", "기술지원", "품질 및 AS"],
  en: ["Sales Support", "Technical Support", "Quality & A/S"],
};

type InquiryLanguage = keyof typeof INQUIRY_BOARD_TABLE;
type SearchType = "subject" | "content";

interface SecretTarget {
  id: number;
  subject: string;
  boardTable: string;
  language: InquiryLanguage;
}

interface InquiryWriteFormState {
  category: string;
  subject: string;
  writer: string;
  isSecret: boolean;
  password: string;
  passwordConfirm: string;
  content: string;
  agree: boolean;
}

interface PendingAttachment {
  id: string;
  file: File;
}

function resolveInquiryLanguage(value: string | null): InquiryLanguage {
  return value === "en" ? "en" : "ko";
}

function getInquiryDetailPath(language: InquiryLanguage, id: number) {
  return `/customersupport/inquiry/${language}/${id}`;
}

function createInitialInquiryWriteForm(
  language: InquiryLanguage,
  categories: string[]
): InquiryWriteFormState {
  const nextCategories =
    categories.length > 0 ? categories : INQUIRY_CATEGORY_PRESETS[language];

  return {
    category: nextCategories[0] ?? "",
    subject: "",
    writer: "",
    isSecret: false,
    password: "",
    passwordConfirm: "",
    content: "",
    agree: false,
  };
}

function buildPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | string> = [1];
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  if (startPage > 2) {
    items.push("ellipsis-start");
  }

  for (let page = startPage; page <= endPage; page += 1) {
    items.push(page);
  }

  if (endPage < totalPages - 1) {
    items.push("ellipsis-end");
  }

  items.push(totalPages);

  return items;
}

export default function InquirySection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const queryLanguage = useMemo(
    () => resolveInquiryLanguage(searchParams.get("lang")),
    [searchParams]
  );
  const [activeLanguage, setActiveLanguage] =
    useState<InquiryLanguage>(queryLanguage);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchType, setSearchType] = useState<SearchType>("subject");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState<BoardPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [availableCategories, setAvailableCategories] = useState<string[]>(
    INQUIRY_CATEGORY_PRESETS.ko
  );
  const [boardInfo, setBoardInfo] = useState<BoardInfo | null>(null);
  const [isBoardInfoLoading, setIsBoardInfoLoading] = useState(true);
  const [secretTarget, setSecretTarget] = useState<SecretTarget | null>(null);
  const [secretPassword, setSecretPassword] = useState("");
  const [secretErrorMessage, setSecretErrorMessage] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [writeForm, setWriteForm] = useState<InquiryWriteFormState>(() =>
    createInitialInquiryWriteForm("ko", INQUIRY_CATEGORY_PRESETS.ko)
  );
  const [writeAttachments, setWriteAttachments] = useState<PendingAttachment[]>([]);
  const [writeFormErrorMessage, setWriteFormErrorMessage] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const currentBoardTable = INQUIRY_BOARD_TABLE[activeLanguage];
  const currentUserLevel = user?.mb_level ?? 1;
  const writeCategories = useMemo(
    () =>
      availableCategories.length > 0
        ? availableCategories
        : INQUIRY_CATEGORY_PRESETS[activeLanguage],
    [activeLanguage, availableCategories]
  );
  const canWriteInquiry = useMemo(() => {
    if (!boardInfo) {
      return false;
    }

    return isAdmin || currentUserLevel >= boardInfo.permissions.write;
  }, [boardInfo, currentUserLevel, isAdmin]);

  const closeSecretModal = useCallback(() => {
    setSecretTarget(null);
    setSecretPassword("");
    setSecretErrorMessage("");
    setIsAuthenticating(false);
  }, []);

  const closeWriteModal = useCallback(() => {
    setIsWriteModalOpen(false);
    setWriteForm(createInitialInquiryWriteForm(activeLanguage, writeCategories));
    setWriteAttachments([]);
    setWriteFormErrorMessage("");
    setIsWriting(false);
  }, [activeLanguage, writeCategories]);

  const { handleOverlayMouseDown, handleOverlayClick } =
    useOverlayDismiss(closeSecretModal);
  const {
    handleOverlayMouseDown: handleWriteOverlayMouseDown,
    handleOverlayClick: handleWriteOverlayClick,
  } = useOverlayDismiss(closeWriteModal);

  useEffect(() => {
    setActiveLanguage(queryLanguage);
  }, [queryLanguage]);

  useEffect(() => {
    setAvailableCategories(INQUIRY_CATEGORY_PRESETS[activeLanguage]);
    setActiveCategory("all");
    setSearchKeyword("");
    setSubmittedKeyword("");
    setCurrentPage(1);
    setWriteForm(
      createInitialInquiryWriteForm(activeLanguage, INQUIRY_CATEGORY_PRESETS[activeLanguage])
    );
    setWriteAttachments([]);
    setIsWriteModalOpen(false);
    setWriteFormErrorMessage("");
  }, [activeLanguage]);

  useEffect(() => {
    let isMounted = true;

    async function loadBoardMetadata() {
      setIsBoardInfoLoading(true);

      try {
        const data = await getBoardInfo(currentBoardTable);

        if (!isMounted) {
          return;
        }

        setBoardInfo(data);
      } catch {
        if (!isMounted) {
          return;
        }

        setBoardInfo(null);
      } finally {
        if (isMounted) {
          setIsBoardInfoLoading(false);
        }
      }
    }

    void loadBoardMetadata();

    return () => {
      isMounted = false;
    };
  }, [currentBoardTable]);

  useEffect(() => {
    let isMounted = true;

    async function loadBoardPosts() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getBoardPosts({
          bo_table: currentBoardTable,
          page: currentPage,
          sca: activeCategory === "all" ? undefined : activeCategory,
          stx: submittedKeyword.trim() || undefined,
        });

        if (!isMounted) {
          return;
        }

        setItems(data.list);
        setTotalPages(data.pagination.total_pages);

        if (activeCategory === "all" && !submittedKeyword.trim()) {
          const nextCategories = Array.from(
            new Set([
              ...INQUIRY_CATEGORY_PRESETS[activeLanguage],
              ...data.list.map((item) => item.category).filter(Boolean),
            ])
          ) as string[];
          setAvailableCategories(nextCategories);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof ApiError
            ? error.message
            : "제품문의 목록을 불러오지 못했습니다.";

        setErrorMessage(message);
        setItems([]);
        setTotalPages(0);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadBoardPosts();

    return () => {
      isMounted = false;
    };
  }, [activeCategory, activeLanguage, currentBoardTable, currentPage, submittedKeyword]);

  const categoryTabs = useMemo(
    () => ["all", ...availableCategories],
    [availableCategories]
  );
  const paginationItems = useMemo(
    () => buildPaginationItems(currentPage, totalPages),
    [currentPage, totalPages]
  );

  useEffect(() => {
    setWriteForm((prev) => {
      if (writeCategories.includes(prev.category)) {
        return prev;
      }

      return {
        ...prev,
        category: writeCategories[0] ?? "",
      };
    });
  }, [writeCategories]);

  const handleSearch = () => {
    setSubmittedKeyword(searchKeyword);
    setCurrentPage(1);
  };

  const ensureWritePermission = useCallback(() => {
    if (isAuthLoading || isBoardInfoLoading) {
      setWriteFormErrorMessage("권한 정보를 확인하는 중입니다.");
      return false;
    }

    if (!boardInfo) {
      setWriteFormErrorMessage("제품문의 권한 정보를 불러오지 못했습니다.");
      return false;
    }

    if (!(isAdmin || currentUserLevel >= boardInfo.permissions.write)) {
      setWriteFormErrorMessage("제품문의를 등록할 권한이 없습니다.");
      return false;
    }

    return true;
  }, [boardInfo, currentUserLevel, isAdmin, isAuthLoading, isBoardInfoLoading]);

  const openWriteModal = useCallback(() => {
    if (!ensureWritePermission()) {
      return;
    }

    setWriteForm(createInitialInquiryWriteForm(activeLanguage, writeCategories));
    setWriteAttachments([]);
    setWriteFormErrorMessage("");
    setIsWriteModalOpen(true);
  }, [activeLanguage, ensureWritePermission, writeCategories]);

  const handleWriteFieldChange = useCallback(
    (key: keyof InquiryWriteFormState, value: string | boolean) => {
      setWriteForm((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const handleWriteAttachmentChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextFiles = Array.from(event.target.files ?? []);

      if (nextFiles.length === 0) {
        return;
      }

      setWriteAttachments((prev) => [
        ...prev,
        ...nextFiles.map((file, index) => ({
          id: `${file.name}-${file.size}-${file.lastModified}-${prev.length + index}`,
          file,
        })),
      ]);

      event.target.value = "";
    },
    []
  );

  const handleRemoveWriteAttachment = useCallback((targetId: string) => {
    setWriteAttachments((prev) => prev.filter((attachment) => attachment.id !== targetId));
  }, []);

  const handlePostClick = useCallback(
    (item: BoardPostItem) => {
      if (item.is_secret && !isAdmin) {
        setSecretTarget({
          id: item.id,
          subject: item.subject,
          boardTable: currentBoardTable,
          language: activeLanguage,
        });
        setSecretPassword("");
        setSecretErrorMessage("");
        return;
      }

      router.push(getInquiryDetailPath(activeLanguage, item.id));
    },
    [activeLanguage, currentBoardTable, isAdmin, router]
  );

  const handleSecretSubmit = useCallback(async () => {
    if (!secretTarget) {
      return;
    }

    if (!secretPassword.trim()) {
      setSecretErrorMessage("비밀번호를 입력해 주세요.");
      return;
    }

    setIsAuthenticating(true);
    setSecretErrorMessage("");

    try {
      await authenticateBoardPost({
        bo_table: secretTarget.boardTable,
        wr_id: secretTarget.id,
        password: secretPassword,
      });

      closeSecretModal();
      router.push(getInquiryDetailPath(secretTarget.language, secretTarget.id));
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "비밀번호를 확인하지 못했습니다.";
      setSecretErrorMessage(message);
    } finally {
      setIsAuthenticating(false);
    }
  }, [closeSecretModal, router, secretPassword, secretTarget]);

  const handleWriteSubmit = useCallback(async () => {
    if (!ensureWritePermission()) {
      return;
    }

    const trimmedCategory = writeForm.category.trim();
    const trimmedSubject = writeForm.subject.trim();
    const trimmedWriter = writeForm.writer.trim();
    const trimmedPassword = writeForm.password.trim();
    const trimmedContent = writeForm.content.trim();

    if (!trimmedCategory) {
      setWriteFormErrorMessage("구분을 선택해 주세요.");
      return;
    }

    if (!trimmedSubject) {
      setWriteFormErrorMessage("제목을 입력해 주세요.");
      return;
    }

    if (!trimmedWriter) {
      setWriteFormErrorMessage("이름을 입력해 주세요.");
      return;
    }

    if (!trimmedPassword) {
      setWriteFormErrorMessage("비밀번호를 입력해 주세요.");
      return;
    }

    if (trimmedPassword !== writeForm.passwordConfirm.trim()) {
      setWriteFormErrorMessage("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (!trimmedContent) {
      setWriteFormErrorMessage("내용을 입력해 주세요.");
      return;
    }

    if (!writeForm.agree) {
      setWriteFormErrorMessage("개인정보 수집 및 이용에 동의해 주세요.");
      return;
    }

    setIsWriting(true);
    setWriteFormErrorMessage("");

    try {
      const formData = new FormData();
      formData.set("bo_table", currentBoardTable);
      formData.set("ca_name", trimmedCategory);
      formData.set("wr_subject", trimmedSubject);
      formData.set("wr_content", trimmedContent);
      formData.set("wr_name", trimmedWriter);
      formData.set("wr_password", trimmedPassword);
      formData.set("agree", "1");

      if (writeForm.isSecret) {
        formData.set("secret", "secret");
      }

      writeAttachments.forEach((attachment) => {
        formData.append("bf_file[]", attachment.file);
      });

      const response = await createBoardPost(formData);
      const nextPostId = Number(response.wr_id ?? response.id ?? 0);

      closeWriteModal();

      if (nextPostId > 0) {
        router.push(getInquiryDetailPath(activeLanguage, nextPostId));
        return;
      }

      setCurrentPage(1);
      setSubmittedKeyword("");
      setSearchKeyword("");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "제품문의를 등록하지 못했습니다.";
      setWriteFormErrorMessage(message);
    } finally {
      setIsWriting(false);
    }
  }, [
    activeLanguage,
    closeWriteModal,
    currentBoardTable,
    ensureWritePermission,
    router,
    writeAttachments,
    writeForm,
  ]);

  return (
    <section className={styles.productInquiry}>
      <h2 className={styles.section_title}>제품문의</h2>

      <div className={styles.languageTabs}>
        <button
          type="button"
          className={`${styles.languageTab} ${
            activeLanguage === "ko" ? styles.activeLanguageTab : ""
          }`}
          onClick={() => router.push("/customersupport?tab=inquiry&lang=ko")}
        >
          KR
        </button>
        <button
          type="button"
          className={`${styles.languageTab} ${
            activeLanguage === "en" ? styles.activeLanguageTab : ""
          }`}
          onClick={() => router.push("/customersupport?tab=inquiry&lang=en")}
        >
          EN
        </button>
      </div>

      {/* 카테고리 탭 */}
      <div className={styles.categoryWrap}>
        <div className={styles.categoryTabs}>
          {categoryTabs.map((category) => (
            <button
              key={category}
              type="button"
              className={`${styles.categoryTab} ${
                activeCategory === category ? styles.active : ""
              }`}
              onClick={() => {
                setActiveCategory(category);
                setCurrentPage(1);
              }}
            >
              {category === "all" ? (activeLanguage === "en" ? "ALL" : "전체") : category}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarInfo}>
          {!canWriteInquiry && !isBoardInfoLoading && (
            <p className={styles.toolbarMessage}>
              현재 설정에서는 제품문의 등록 권한이 없습니다.
            </p>
          )}
        </div>
        <button
          type="button"
          className={styles.writeButton}
          onClick={openWriteModal}
          disabled={!canWriteInquiry || isBoardInfoLoading}
        >
          문의하기
        </button>
      </div>

      {/* 검색 영역 */}
      <div className={styles.searchArea}>
        <div className={styles.searchBox}>
          <select
            className={styles.searchSelect}
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
          >
            <option value="subject">제목</option>
            <option value="content">내용</option>
          </select>
          <div className={styles.searchInputWrap}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="검색어를 입력해 주세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <button
              className={styles.searchBtn}
              type="button"
              aria-label="검색"
              onClick={handleSearch}
            ></button>
          </div>
        </div>
      </div>

      {/* 게시판 리스트 */}
      <div className={styles.boardList}>
        <div className={styles.boardHeader}>
          <div>번호</div>
          <div>구분</div>
          <div>제목</div>
          <div>작성자</div>
          <div>작성일</div>
          <div>답변유무</div>
        </div>

        {isLoading ? (
          <div className={`${styles.boardItem} ${styles.emptyState}`}>
            제품문의 목록을 불러오는 중입니다.
          </div>
        ) : errorMessage ? (
          <div className={`${styles.boardItem} ${styles.emptyState}`}>
            {errorMessage}
          </div>
        ) : items.length === 0 ? (
          <div className={`${styles.boardItem} ${styles.emptyState}`}>
            게시글이 없습니다.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className={styles.boardItem}>
              <div className={`${styles.boardCell} ${styles.cellNumber}`}>
                {item.num ?? item.id}
              </div>
              <div className={`${styles.boardCell} ${styles.category} ${styles.cellCategory}`}>
                {item.category || "-"}
              </div>
              <div className={`${styles.boardCell} ${styles.title} ${styles.cellTitle}`}>
                <button
                  type="button"
                  className={styles.titleButton}
                  onClick={() => handlePostClick(item)}
                >
                  {item.is_secret && (
                    <span className={styles.secretBadge}>비밀글</span>
                  )}
                  <span>{item.subject}</span>
                </button>
              </div>
              <div className={`${styles.boardCell} ${styles.cellAuthor}`}>
                <span className={styles.authorText}>{item.writer}</span>
              </div>
              <div className={`${styles.boardCell} ${styles.cellDate}`}>{item.datetime}</div>
              <div className={`${styles.boardCell} ${styles.cellStatus}`}>
                <span
                  className={`${styles.statusBtn} ${
                    item.status === "답변완료" ? styles.completed : styles.pending
                  }`}
                >
                  {item.status ?? "-"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 0 && (
        <div className={styles.pagination}>
          <button
            className={`${styles.paginationBtn} ${
              currentPage === 1 ? styles.disabled : ""
            }`}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <img src="/images/icon/prev_ico.png" alt="이전" />
          </button>
          {paginationItems.map((page) =>
            typeof page === "number" ? (
              <button
                key={page}
                className={`${styles.paginationBtn} ${styles.pageNumber} ${
                  currentPage === page ? styles.active : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ) : (
              <span
                key={page}
                className={`${styles.paginationBtn} ${styles.paginationEllipsis}`}
              >
                ...
              </span>
            )
          )}
          <button
            className={`${styles.paginationBtn} ${
              currentPage === totalPages ? styles.disabled : ""
            }`}
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            <img src="/images/icon/next_ico.png" alt="다음" />
          </button>
        </div>
      )}

      {secretTarget && (
        <div
          className={styles.modalOverlay}
          onMouseDown={handleOverlayMouseDown}
          onClick={handleOverlayClick}
        >
          <div
            className={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>비밀글 확인</h3>
            <p className={styles.modalDescription}>
              <strong>{secretTarget.subject}</strong>
              게시글은 비밀글입니다. 비밀번호를 입력하면 상세 내용을 볼 수 있습니다.
            </p>
            <input
              type="password"
              className={styles.passwordInput}
              placeholder="비밀번호를 입력해 주세요"
              value={secretPassword}
              onChange={(event) => setSecretPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleSecretSubmit();
                }
              }}
              autoFocus
            />
            {secretErrorMessage && (
              <p className={styles.modalError}>{secretErrorMessage}</p>
            )}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalSecondaryButton}
                onClick={closeSecretModal}
                disabled={isAuthenticating}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.modalPrimaryButton}
                onClick={() => void handleSecretSubmit()}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? "확인 중..." : "확인"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isWriteModalOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={handleWriteOverlayMouseDown}
          onClick={handleWriteOverlayClick}
        >
          <div
            className={`${styles.modalContent} ${styles.writeModalContent}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.writeModalHeader}>
              <div>
                <h3 className={styles.modalTitle}>제품문의 작성</h3>
                <p className={styles.modalDescription}>
                  비회원도 문의를 등록할 수 있으며, 입력한 비밀번호로 수정/삭제가 가능합니다.
                </p>
              </div>
              <button
                type="button"
                className={styles.writeModalCloseButton}
                onClick={closeWriteModal}
              >
                닫기
              </button>
            </div>

            <div className={styles.writeFormGrid}>
              <label className={styles.writeField}>
                <span>구분</span>
                <select
                  value={writeForm.category}
                  onChange={(event) =>
                    handleWriteFieldChange("category", event.target.value)
                  }
                >
                  {writeCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className={`${styles.writeField} ${styles.fullField}`}>
                <span>제목</span>
                <input
                  type="text"
                  value={writeForm.subject}
                  onChange={(event) =>
                    handleWriteFieldChange("subject", event.target.value)
                  }
                  placeholder="제목을 입력해 주세요"
                />
              </label>

              <label className={styles.writeField}>
                <span>이름</span>
                <input
                  type="text"
                  value={writeForm.writer}
                  onChange={(event) =>
                    handleWriteFieldChange("writer", event.target.value)
                  }
                  placeholder="이름을 입력해 주세요"
                />
              </label>

              <div className={`${styles.writeField} ${styles.checkField}`}>
                <span>비밀글 여부</span>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={writeForm.isSecret}
                    onChange={(event) =>
                      handleWriteFieldChange("isSecret", event.target.checked)
                    }
                  />
                  <span>비밀글로 등록</span>
                </label>
              </div>

              <label className={styles.writeField}>
                <span>비밀번호</span>
                <input
                  type="password"
                  value={writeForm.password}
                  onChange={(event) =>
                    handleWriteFieldChange("password", event.target.value)
                  }
                  placeholder="수정/삭제에 사용할 비밀번호"
                />
              </label>

              <label className={styles.writeField}>
                <span>비밀번호 확인</span>
                <input
                  type="password"
                  value={writeForm.passwordConfirm}
                  onChange={(event) =>
                    handleWriteFieldChange("passwordConfirm", event.target.value)
                  }
                  placeholder="비밀번호를 다시 입력해 주세요"
                />
              </label>

              <label className={`${styles.writeField} ${styles.fullField}`}>
                <span>내용</span>
                <textarea
                  value={writeForm.content}
                  onChange={(event) =>
                    handleWriteFieldChange("content", event.target.value)
                  }
                  placeholder="문의 내용을 입력해 주세요"
                />
              </label>

              <div className={`${styles.writeField} ${styles.fullField}`}>
                <span>첨부파일</span>
                <div className={styles.fileField}>
                  <label className={styles.fileSelectButton}>
                    파일 선택
                    <input
                      type="file"
                      multiple
                      className={styles.hiddenFileInput}
                      onChange={handleWriteAttachmentChange}
                    />
                  </label>
                  <p className={styles.fileFieldHint}>
                    필요한 경우 문의 관련 파일을 함께 첨부해 주세요.
                  </p>
                </div>
                {writeAttachments.length > 0 && (
                  <ul className={styles.pendingFileList}>
                    {writeAttachments.map((attachment) => (
                      <li key={attachment.id}>
                        <span>{attachment.file.name}</span>
                        <button
                          type="button"
                          className={styles.fileRemoveButton}
                          onClick={() => handleRemoveWriteAttachment(attachment.id)}
                        >
                          제거
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div
                className={`${styles.writeField} ${styles.fullField} ${styles.checkField}`}
              >
                <span>개인정보 수집 동의</span>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={writeForm.agree}
                    onChange={(event) =>
                      handleWriteFieldChange("agree", event.target.checked)
                    }
                  />
                  <span>개인정보 수집 및 이용에 동의합니다.</span>
                </label>
              </div>
            </div>

            {writeFormErrorMessage && (
              <p className={styles.modalError}>{writeFormErrorMessage}</p>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalSecondaryButton}
                onClick={closeWriteModal}
                disabled={isWriting}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.modalPrimaryButton}
                onClick={() => void handleWriteSubmit()}
                disabled={isWriting}
              >
                {isWriting ? "등록 중..." : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
