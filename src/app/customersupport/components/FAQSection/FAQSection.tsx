"use client";

/** 고객지원 FAQ 탭 본문. 사용처: `SupportTabs.tsx`. */
import { useCallback, useEffect, useState } from "react";
import { ApiError, FaqItem, FaqMaster, getFaq } from "@/api";
import styles from "./FAQSection.module.css";

function decodeHtmlEntities(value: string) {
  if (typeof window === "undefined") {
    return value;
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function normalizeFaqSubject(value: string) {
  const decodedValue = decodeHtmlEntities(value);

  return decodedValue
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function FAQSection() {
  const [searchType, setSearchType] = useState("subject");
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [categories, setCategories] = useState<FaqMaster[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadFaq = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getFaq({
        fm_id: selectedCategoryId || undefined,
        page: currentPage,
        stx: searchKeyword.trim() || undefined,
      });

      setCategories(data.master_list);
      setFaqItems(data.faq_list);
      setTotalPages(data.pagination.total_pages);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "FAQ 정보를 불러오지 못했습니다.";

      setErrorMessage(message);
      setFaqItems([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchKeyword, selectedCategoryId]);

  useEffect(() => {
    loadFaq();
  }, [loadFaq]);

  const handleSearch = () => {
    setSearchKeyword(searchInput);
    setCurrentPage(1);
    setExpandedItem(null);
  };

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
    setExpandedItem(null);
  };

  const toggleItem = (id: number) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  return (
    <section className={styles.faq}>
      <h2 className={styles.section_title}>FAQ</h2>
      <div className={styles.faqTop}>
        <h2>
          고객님의 궁금한 사항들을
          <br />
          간단하고 빠르게 해결하실 수 있습니다.
        </h2>
        <div className={styles.searchBox}>
          <select
            className={styles.searchSelect}
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="subject">제목</option>
            <option value="content">내용</option>
          </select>
          <div className={styles.searchInputWrap}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="검색어를 입력해 주세요"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
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

      {categories.length > 0 && (
        <div className={styles.categoryTabs}>
          <button
            type="button"
            className={`${styles.categoryTab} ${
              selectedCategoryId === 0 ? styles.activeCategoryTab : ""
            }`}
            onClick={() => handleCategoryChange(0)}
          >
            전체
          </button>
          {categories.map((category) => (
            <button
              key={category.fm_id}
              type="button"
              className={`${styles.categoryTab} ${
                selectedCategoryId === category.fm_id
                  ? styles.activeCategoryTab
                  : ""
              }`}
              onClick={() => handleCategoryChange(category.fm_id)}
            >
              {category.subject}
            </button>
          ))}
        </div>
      )}

      <div className={styles.faqList}>
        {isLoading ? (
          <div className={styles.emptyState}>FAQ를 불러오는 중입니다.</div>
        ) : errorMessage ? (
          <div className={styles.emptyState}>{errorMessage}</div>
        ) : faqItems.length === 0 ? (
          <div className={styles.emptyState}>검색 결과가 없습니다.</div>
        ) : (
          faqItems.map((item) => (
            <div
              key={item.fa_id}
              className={`${styles.faqItem} ${
                expandedItem === item.fa_id ? styles.active : ""
              }`}
            >
              <div
                className={styles.faqQuestion}
                onClick={() => toggleItem(item.fa_id)}
              >
                <div className={styles.questionText}>
                  <span className={styles.qLabel}>Q</span>
                  <span>{normalizeFaqSubject(item.subject)}</span>
                </div>
                <div className={styles.arrowIcon}></div>
              </div>
              <div className={styles.faqAnswer}>
                <div className={styles.answerContents}>
                  <span className={styles.aLabel}>A</span>
                  <div
                    className={styles.answerHtml}
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                </div>
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
            onClick={() => {
              setCurrentPage((prev) => Math.max(1, prev - 1));
              setExpandedItem(null);
            }}
            disabled={currentPage === 1}
          >
            <img src="/images/icon/prev_ico.png" alt="이전" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`${styles.paginationBtn} ${styles.pageNumber} ${
                currentPage === page ? styles.active : ""
              }`}
              onClick={() => {
                setCurrentPage(page);
                setExpandedItem(null);
              }}
            >
              {page}
            </button>
          ))}
          <button
            className={`${styles.paginationBtn} ${
              currentPage === totalPages ? styles.disabled : ""
            }`}
            onClick={() => {
              setCurrentPage((prev) => Math.min(totalPages, prev + 1));
              setExpandedItem(null);
            }}
            disabled={currentPage === totalPages}
          >
            <img src="/images/icon/next_ico.png" alt="다음" />
          </button>
        </div>
      )}
    </section>
  );
}
