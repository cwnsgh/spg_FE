"use client";

import { useState, useMemo } from "react";
import styles from "./InquirySection.module.css";

// 임시 데이터 (HTML에서 가져옴)
const boardData = [
  {
    wr_id: 15,
    ca_name: "영업지원",
    wr_subject: "감속기에 대한 문의 입니다.",
    mb_name: "홍길동",
    wr_datetime: "2025-08-14",
    wr_comment: 1,
  },
  {
    wr_id: 14,
    ca_name: "기술지원",
    wr_subject: "DC모터 컨트롤러 문의",
    mb_name: "홍길동",
    wr_datetime: "2025-08-14",
    wr_comment: 0,
  },
  {
    wr_id: 13,
    ca_name: "품질 및 AS",
    wr_subject: "점검 및 수리 문의",
    mb_name: "홍길동",
    wr_datetime: "2025-08-14",
    wr_comment: 1,
  },
  {
    wr_id: 12,
    ca_name: "영업지원",
    wr_subject: "제품 견적 문의",
    mb_name: "홍길동",
    wr_datetime: "2025-08-14",
    wr_comment: 0,
  },
  {
    wr_id: 11,
    ca_name: "기술지원",
    wr_subject: "모터 사양 문의",
    mb_name: "홍길동",
    wr_datetime: "2025-08-14",
    wr_comment: 1,
  },
  {
    wr_id: 10,
    ca_name: "품질 및 AS",
    wr_subject: "A/S 신청",
    mb_name: "홍길동",
    wr_datetime: "2025-08-14",
    wr_comment: 0,
  },
  {
    wr_id: 9,
    ca_name: "영업지원",
    wr_subject: "대량 주문 문의",
    mb_name: "홍길동",
    wr_datetime: "2025-08-14",
    wr_comment: 1,
  },
  {
    wr_id: 8,
    ca_name: "기술지원",
    wr_subject: "설치 방법 문의",
    mb_name: "홍길동",
    wr_datetime: "2025-08-14",
    wr_comment: 1,
  },
  {
    wr_id: 7,
    ca_name: "품질 및 AS",
    wr_subject: "품질 보증 기간 문의",
    mb_name: "홍길동",
    wr_datetime: "2025-08-14",
    wr_comment: 0,
  },
  {
    wr_id: 6,
    ca_name: "영업지원",
    wr_subject: "배송 일정 문의",
    mb_name: "홍길동",
    wr_datetime: "2025-08-14",
    wr_comment: 1,
  },
];

type CategoryType = "all" | "sales" | "technical" | "quality";

export default function InquirySection() {
  const [activeCategory, setActiveCategory] =
    useState<CategoryType>("all");
  const [searchType, setSearchType] = useState("subject");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 카테고리 필터링
  const filteredData = useMemo(() => {
    if (activeCategory === "all") {
      return boardData;
    }
    const categoryMap: Record<CategoryType, string> = {
      all: "전체",
      sales: "영업지원",
      technical: "기술지원",
      quality: "품질 및 AS",
    };
    return boardData.filter(
      (item) => item.ca_name === categoryMap[activeCategory]
    );
  }, [activeCategory]);

  // 검색 필터링
  const searchedData = useMemo(() => {
    if (!searchKeyword.trim()) return filteredData;

    return filteredData.filter((item) => {
      if (searchType === "subject") {
        return item.wr_subject.includes(searchKeyword);
      } else if (searchType === "content") {
        // 내용 검색은 실제 데이터에 없으므로 제목으로 대체
        return item.wr_subject.includes(searchKeyword);
      } else if (searchType === "author") {
        return item.mb_name.includes(searchKeyword);
      }
      return true;
    });
  }, [filteredData, searchType, searchKeyword]);

  // 페이지네이션
  const totalPages = Math.ceil(searchedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return searchedData.slice(start, start + itemsPerPage);
  }, [searchedData, currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  return (
    <section className={styles.productInquiry}>
      <h2 className={styles.section_title}>제품문의</h2>
      {/* 카테고리 탭 */}
      <div className={styles.categoryTabs}>
        <div
          className={`${styles.categoryTab} ${
            activeCategory === "all" ? styles.active : ""
          }`}
          onClick={() => setActiveCategory("all")}
        >
          전체
        </div>
        <div
          className={`${styles.categoryTab} ${
            activeCategory === "sales" ? styles.active : ""
          }`}
          onClick={() => setActiveCategory("sales")}
        >
          영업지원
        </div>
        <div
          className={`${styles.categoryTab} ${
            activeCategory === "technical" ? styles.active : ""
          }`}
          onClick={() => setActiveCategory("technical")}
        >
          기술지원
        </div>
        <div
          className={`${styles.categoryTab} ${
            activeCategory === "quality" ? styles.active : ""
          }`}
          onClick={() => setActiveCategory("quality")}
        >
          품질 및 AS
        </div>
      </div>

      {/* 검색 영역 */}
      <div className={styles.searchArea}>
        <div className={styles.searchBox}>
          <select
            className={styles.searchSelect}
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="subject">제목</option>
            <option value="content">내용</option>
            <option value="author">작성자</option>
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
        {paginatedData.length === 0 ? (
          <div className={`${styles.boardItem} ${styles.emptyState}`}>
            게시글이 없습니다.
          </div>
        ) : (
          paginatedData.map((item) => (
            <div key={item.wr_id} className={styles.boardItem}>
              <div className={styles.boardCell}>{item.wr_id}</div>
              <div className={`${styles.boardCell} ${styles.category}`}>
                {item.ca_name}
              </div>
              <div className={`${styles.boardCell} ${styles.title}`}>
                <span>{item.wr_subject}</span>
              </div>
              <div className={styles.boardCell}>{item.mb_name}</div>
              <div className={styles.boardCell}>{item.wr_datetime}</div>
              <div className={styles.boardCell}>
                <span
                  className={`${styles.statusBtn} ${
                    item.wr_comment ? styles.completed : styles.pending
                  }`}
                >
                  {item.wr_comment ? "답변완료" : "답변대기"}
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
