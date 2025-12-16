"use client";

import { useState, useMemo } from "react";
import styles from "./FAQSection.module.css";

// 임시 데이터 (HTML에서 가져옴)
const faqData = [
  {
    wr_id: 15,
    wr_subject: "자주 묻는 질문입니다.",
    wr_content: "자주 묻는 질문에 대한 답변입니다.",
  },
  {
    wr_id: 14,
    wr_subject: "자주 묻는 질문입니다.",
    wr_content: "자주 묻는 질문에 대한 답변입니다.",
  },
  {
    wr_id: 13,
    wr_subject: "자주 묻는 질문입니다.",
    wr_content: "자주 묻는 질문에 대한 답변입니다.",
  },
  {
    wr_id: 12,
    wr_subject: "자주 묻는 질문입니다.",
    wr_content: "자주 묻는 질문에 대한 답변입니다.",
  },
  {
    wr_id: 11,
    wr_subject: "자주 묻는 질문입니다.",
    wr_content: "자주 묻는 질문에 대한 답변입니다.",
  },
  {
    wr_id: 10,
    wr_subject: "자주 묻는 질문입니다.",
    wr_content: "자주 묻는 질문에 대한 답변입니다.",
  },
  {
    wr_id: 9,
    wr_subject: "자주 묻는 질문입니다.",
    wr_content: "자주 묻는 질문에 대한 답변입니다.",
  },
  {
    wr_id: 8,
    wr_subject: "자주 묻는 질문입니다.",
    wr_content: "자주 묻는 질문에 대한 답변입니다.",
  },
  {
    wr_id: 7,
    wr_subject: "자주 묻는 질문입니다.",
    wr_content: "자주 묻는 질문에 대한 답변입니다.",
  },
  {
    wr_id: 6,
    wr_subject: "자주 묻는 질문입니다.",
    wr_content: "자주 묻는 질문에 대한 답변입니다.",
  },
];

export default function FAQSection() {
  const [searchType, setSearchType] = useState("subject");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const itemsPerPage = 10;

  // 검색 필터링
  const filteredData = useMemo(() => {
    if (!searchKeyword.trim()) return faqData;

    return faqData.filter((item) => {
      const searchText =
        searchType === "subject" ? item.wr_subject : item.wr_content;
      return searchText.includes(searchKeyword);
    });
  }, [searchType, searchKeyword]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleSearch = () => {
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

      <div className={styles.faqList}>
        {paginatedData.length === 0 ? (
          <div className={styles.emptyState}>검색 결과가 없습니다.</div>
        ) : (
          paginatedData.map((item) => (
            <div
              key={item.wr_id}
              className={`${styles.faqItem} ${
                expandedItem === item.wr_id ? styles.active : ""
              }`}
            >
              <div
                className={styles.faqQuestion}
                onClick={() => toggleItem(item.wr_id)}
              >
                <div className={styles.questionText}>
                  <span className={styles.qLabel}>Q</span>
                  <span>{item.wr_subject}</span>
                </div>
                <div className={styles.arrowIcon}></div>
              </div>
              <div className={styles.faqAnswer}>
                <div className={styles.answerContents}>
                  <span className={styles.aLabel}>A</span>
                  <span>{item.wr_content}</span>
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
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
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
    </section>
  );
}
