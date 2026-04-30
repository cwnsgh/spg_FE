"use client";

/**
 * 제품문의 탭(게시판 목록·글쓰기·비밀글 등). 사용처: `SupportTabs.tsx`, 문의 작성 페이지에서 일부 재사용 가능.
 */
import {
  ApiError,
  BoardInfo,
  BoardPostItem,
  authenticateBoardPost,
  getBoardInfo,
  getBoardPosts,
} from "@/api";
import { useOverlayDismiss } from "@/hooks/useOverlayDismiss";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./InquirySection.module.css";
import {
  INQUIRY_BOARD_TABLE,
  INQUIRY_CATEGORY_PRESETS,
  INQUIRY_COPY,
  type InquiryLanguage,
  getInquiryDetailPath,
  resolveInquiryLanguage,
} from "./inquiryShared";

type SearchType = "subject" | "content";

interface SecretTarget {
  id: number;
  subject: string;
  boardTable: string;
  language: InquiryLanguage;
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
  const { user, isAdmin } = useAuth();
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
  const currentBoardTable = INQUIRY_BOARD_TABLE[activeLanguage];
  const currentUserLevel = user?.mb_level ?? 1;
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

  const { handleOverlayMouseDown, handleOverlayClick } =
    useOverlayDismiss(closeSecretModal);

  useEffect(() => {
    setActiveLanguage(queryLanguage);
  }, [queryLanguage]);

  useEffect(() => {
    setAvailableCategories(INQUIRY_CATEGORY_PRESETS[activeLanguage]);
    setActiveCategory("all");
    setSearchKeyword("");
    setSubmittedKeyword("");
    setCurrentPage(1);
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

        if (process.env.NODE_ENV === "development") {
          console.log("[제품문의 목록]", {
            lang: activeLanguage,
            bo_table: currentBoardTable,
            page: currentPage,
            category: activeCategory,
            keyword: submittedKeyword.trim() || undefined,
            pagination: data.pagination,
            count: data.list.length,
            list: data.list,
          });
        }

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

  const handleSearch = () => {
    setSubmittedKeyword(searchKeyword);
    setCurrentPage(1);
  };

  const selectInquiryLanguage = useCallback(
    (lang: InquiryLanguage) => {
      setActiveLanguage(lang);
      const next = new URLSearchParams(searchParams.toString());
      next.set("tab", next.get("tab") ?? "inquiry");
      if (lang === "ko") {
        next.delete("lang");
      } else {
        next.set("lang", "en");
      }
      const qs = next.toString();
      router.replace(qs ? `/customersupport?${qs}` : "/customersupport", {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  const goToWritePage = useCallback(() => {
    router.push(`/customersupport/inquiry/write?lang=${activeLanguage}`);
  }, [activeLanguage, router]);

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

  const inquiryCopy = INQUIRY_COPY[activeLanguage];

  return (
    <section className={styles.productInquiry}>
      <h2 className={styles.section_title}>제품문의</h2>

      <div className={styles.langSwitch} role="tablist" aria-label="언어 선택">
        <div className={styles.langSwitchTrack}>
          <span
            className={styles.langSwitchThumb}
            data-active={activeLanguage}
            aria-hidden
          />
          <button
            type="button"
            role="tab"
            aria-selected={activeLanguage === "ko"}
            className={`${styles.langSwitchBtn} ${
              activeLanguage === "ko" ? styles.langSwitchBtnOn : ""
            }`}
            onClick={() => selectInquiryLanguage("ko")}
          >
            KR
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeLanguage === "en"}
            className={`${styles.langSwitchBtn} ${
              activeLanguage === "en" ? styles.langSwitchBtnOn : ""
            }`}
            onClick={() => selectInquiryLanguage("en")}
          >
            EN
          </button>
        </div>
      </div>

      <div
        key={activeLanguage}
        className={styles.inquiryContent}
      >
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

      {!canWriteInquiry && !isBoardInfoLoading ? (
        <div className={styles.toolbar}>
          <p className={styles.toolbarMessage}>{inquiryCopy.toolbarNoWrite}</p>
        </div>
      ) : null}

      {/* 검색 + 문의하기 */}
      <div className={styles.searchRow}>
        <div className={styles.searchBox}>
          <select
            className={styles.searchSelect}
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
          >
            <option value="subject">
              {activeLanguage === "en" ? "Subject" : "제목"}
            </option>
            <option value="content">
              {activeLanguage === "en" ? "Content" : "내용"}
            </option>
          </select>
          <div className={styles.searchInputWrap}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={
                activeLanguage === "en"
                  ? "Enter a search keyword"
                  : "검색어를 입력해 주세요"
              }
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <button
              className={styles.searchBtn}
              type="button"
              aria-label={activeLanguage === "en" ? "Search" : "검색"}
              onClick={handleSearch}
            ></button>
          </div>
        </div>
        <button
          type="button"
          className={styles.writeButton}
          onClick={goToWritePage}
          disabled={!canWriteInquiry || isBoardInfoLoading}
        >
          {inquiryCopy.writeButton}
        </button>
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
      </div>

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
    </section>
  );
}
