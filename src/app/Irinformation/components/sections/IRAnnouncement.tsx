"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import styles from "./Disclosure.module.css";

interface BoardItem {
  id: number;
  title: string;
  author: string;
  date: string;
  views: number;
  detailUrl: string;
}

export default function IRAnnouncement() {
  // 임시 데이터
  const boardData: BoardItem[] = [
    { id: 1, title: "주주명부 폐쇄기간 또는 기준일 설정", author: "최고관리자", date: "2025-12-09", views: 39, detailUrl: "#" },
    { id: 2, title: "중간배당을 위한 주주명부폐쇄(기준일)설정", author: "최고관리자", date: "2025-09-17", views: 555, detailUrl: "#" },
    { id: 3, title: "제35기 임시주주총회 소집공고", author: "최고관리자", date: "2025-08-25", views: 558, detailUrl: "#" },
    { id: 4, title: "주주명부 폐쇄기간 또는 기준일 설정", author: "최고관리자", date: "2025-07-29", views: 599, detailUrl: "#" },
    { id: 5, title: "제34기(2024사업연도)결산공고", author: "최고관리자", date: "2025-03-26", views: 1502, detailUrl: "#" },
    { id: 6, title: "제34기(2024사업연도) 사업보고서 및 첨부서류", author: "최고관리자", date: "2025-03-18", views: 1621, detailUrl: "#" },
    { id: 7, title: "제34기(2024사업연도)감사보고서(연결, 별도)", author: "최고관리자", date: "2025-03-18", views: 1191, detailUrl: "#" },
    { id: 8, title: "제34기 정기주주총회 소집공고", author: "최고관리자", date: "2025-03-11", views: 1077, detailUrl: "#" },
    { id: 9, title: "제34기 정기주주총회 소집결의", author: "최고관리자", date: "2025-03-04", views: 1115, detailUrl: "#" },
    { id: 10, title: "주주명부 폐쇄기간 또는 기준일 설정", author: "최고관리자", date: "2025-12-09", views: 39, detailUrl: "#" },
    { id: 11, title: "중간배당을 위한 주주명부폐쇄(기준일)설정", author: "최고관리자", date: "2025-09-17", views: 555, detailUrl: "#" },
    { id: 12, title: "제35기 임시주주총회 소집공고", author: "최고관리자", date: "2025-08-25", views: 558, detailUrl: "#" },
    { id: 13, title: "주주명부 폐쇄기간 또는 기준일 설정", author: "최고관리자", date: "2025-07-29", views: 599, detailUrl: "#" },
    { id: 14, title: "제34기(2024사업연도)결산공고", author: "최고관리자", date: "2025-03-26", views: 1502, detailUrl: "#" },
    { id: 15, title: "제34기(2024사업연도) 사업보고서 및 첨부서류 제34기(2024사업연도) 사업보고서 및 첨부서류 제34기(2024사업연도) 사업보고서 및 첨부서류", author: "최고관리자", date: "2025-03-18", views: 1621, detailUrl: "#" },
    { id: 16, title: "제34기(2024사업연도)감사보고서(연결, 별도)", author: "최고관리자", date: "2025-03-18", views: 1191, detailUrl: "#" },
    { id: 17, title: "제34기 정기주주총회 소집공고", author: "최고관리자", date: "2025-03-11", views: 1077, detailUrl: "#" },
    { id: 18, title: "제34기 정기주주총회 소집결의", author: "최고관리자", date: "2025-03-04", views: 1115, detailUrl: "#" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchType, setSearchType] = useState<"subject" | "content">("subject");
  const itemsPerPage = 15;
  const isAdmin = true;

  const filteredData = useMemo(() => {
    if (!searchKeyword.trim()) {
      return boardData;
    }

    return boardData.filter((item) => {
      if (searchType === "subject") {
        return item.title.includes(searchKeyword);
      } else {
        return item.title.includes(searchKeyword) || item.author.includes(searchKeyword);
      }
    });
  }, [searchKeyword, searchType]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => b.id - a.id);
  }, [filteredData]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = sortedData.slice(startIndex, endIndex);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const renderPagination = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className={styles.paginationButton}
          onClick={() => setCurrentPage(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" style={{ padding: "0 5px" }}>...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles.paginationButton} ${styles.pageNumber} ${
            currentPage === i ? styles.active : ""
          }`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" style={{ padding: "0 5px" }}>...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          className={styles.paginationButton}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <section className={styles.board}>
      <h2 className={styles.section_title}>IR공고</h2>
      <div className={styles.searchArea}>
        <div className={styles.searchBox}>
          <select
            className={styles.searchSelect}
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as "subject" | "content")}
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
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <button
              className={styles.searchBtn}
              type="button"
              aria-label="검색"
              onClick={handleSearch}
            />
          </div>
        </div>
      </div>

      <div className={styles.boardList}>
        <div className={`${styles.boardHeader} ${isAdmin ? styles.adminMode : ""}`}>
          {isAdmin && (
            <div className={styles.checkboxHeader}>
              <input type="checkbox" id="selectAll" />
            </div>
          )}
          {!isAdmin && <div className={styles.checkboxHeader}></div>}
          <div>번호</div>
          <div>제목</div>
          <div>작성자</div>
          <div>작성일</div>
          <div>조회수</div>
        </div>
        <div className={styles.boardItems}>
          {pageData.length === 0 ? (
            <div className={`${styles.boardItem} ${styles.emptyState}`}>
              등록된 게시글이 없습니다.
            </div>
          ) : (
            pageData.map((item, index) => {
              const displayNum = sortedData.length - (startIndex + index);
              return (
                <div key={item.id} className={styles.boardItem}>
                  {isAdmin && (
                    <div className={styles.checkboxCell}>
                      <input
                        type="checkbox"
                        className={styles.itemCheckbox}
                        value={item.id}
                      />
                    </div>
                  )}
                  {!isAdmin && <div className={styles.checkboxCell}></div>}
                  <div className={styles.boardCell}>{displayNum}</div>
                  <div className={`${styles.boardCell} ${styles.title}`}>
                    <span
                      className={styles.titleLink}
                      onClick={() => {
                        if (item.detailUrl && item.detailUrl !== "#") {
                          window.location.href = item.detailUrl;
                        }
                      }}
                    >
                      {item.title}
                    </span>
                  </div>
                  <div className={styles.boardCell}>{item.author}</div>
                  <div className={styles.boardCell}>{item.date}</div>
                  <div className={styles.boardCell}>{item.views}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isAdmin && (
        <div className={`${styles.adminActions} ${styles.show}`}>
          <button className={styles.adminBtn} id="adminPageBtn">
            관리자 <Image src="/images/icon/arrow_01.png" alt="" width={14} height={14} />
          </button>
          <button className={styles.adminBtn} id="selectDelete">
            선택삭제
          </button>
          <button className={styles.adminBtn} id="selectCopy">
            선택복사
          </button>
          <button className={styles.adminBtn} id="selectMove">
            선택이동
          </button>
          <button className={styles.adminBtn} id="writeBtn">
            글쓰기
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ""}`}
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <Image src="/images/icon/first_ico.png" alt="맨 앞으로" width={13} height={13} />
          </button>
          <button
            className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ""}`}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <Image src="/images/icon/prev_ico.png" alt="앞으로" width={13} height={13} />
          </button>
          {renderPagination()}
          <button
            className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ""}`}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <Image src="/images/icon/next_ico.png" alt="뒤로" width={13} height={13} />
          </button>
          <button
            className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ""}`}
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <Image src="/images/icon/last_ico.png" alt="맨 뒤로" width={13} height={13} />
          </button>
        </div>
      )}
    </section>
  );
}

