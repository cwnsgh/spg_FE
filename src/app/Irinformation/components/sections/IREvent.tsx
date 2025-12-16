"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import styles from "./IREvent.module.css";

interface EventItem {
  id: number;
  eventName: string;
  time: string;
  fileUrl: string;
  detailUrl: string;
}

export default function IREvent() {
  // 임시 데이터
  const eventData: EventItem[] = [
    {
      id: 1,
      eventName: "행사명 01",
      time: "2025-12-09",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 2,
      eventName: "행사명 02",
      time: "2025-09-17",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 3,
      eventName: "행사명 03",
      time: "2025-08-25",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 4,
      eventName: "행사명 04",
      time: "2025-07-29",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 5,
      eventName: "행사명 05",
      time: "2025-03-26",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 6,
      eventName: "행사명 06",
      time: "2025-03-18",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 7,
      eventName: "행사명 07",
      time: "2025-03-18",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 8,
      eventName: "행사명 08",
      time: "2025-03-11",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 9,
      eventName: "행사명 09",
      time: "2025-03-04",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 10,
      eventName: "행사명 10",
      time: "2025-12-09",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 11,
      eventName: "행사명 11 행사명 11 행사명 11",
      time: "2025-09-17",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 12,
      eventName: "행사명 12",
      time: "2025-08-25",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 13,
      eventName: "행사명 13",
      time: "2025-07-29",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 14,
      eventName: "행사명 14",
      time: "2025-03-26",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 15,
      eventName:
        "행사명 15 입니다 행사명 15 입니다 행사명 15 입니다 행사명 15 입니다 행사명 15 입니다 행사명 15 입니다 행사명 15 입니다 행사명 15 입니다 행사명 15 입니다 행사명 15 입니다 행사명 15 입니다 행사명 15 입니다",
      time: "2025-03-18",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 16,
      eventName: "행사명 16 행사명 16 행사명 16 행사명 16",
      time: "2025-03-18",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 17,
      eventName: "행사명 17",
      time: "2025-03-11",
      fileUrl: "#",
      detailUrl: "#",
    },
    {
      id: 18,
      eventName: "행사명 18",
      time: "2025-03-04",
      fileUrl: "#",
      detailUrl: "#",
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchType, setSearchType] = useState<"subject" | "content">(
    "subject"
  );
  const itemsPerPage = 15;
  const isAdmin = true;

  const filteredData = useMemo(() => {
    if (!searchKeyword.trim()) {
      return eventData;
    }

    return eventData.filter((item) => {
      if (searchType === "subject") {
        return item.eventName.includes(searchKeyword);
      } else {
        return (
          item.eventName.includes(searchKeyword) ||
          item.time.includes(searchKeyword)
        );
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
        pages.push(
          <span key="ellipsis1" style={{ padding: "0 5px" }}>
            ...
          </span>
        );
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
        pages.push(
          <span key="ellipsis2" style={{ padding: "0 5px" }}>
            ...
          </span>
        );
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
      <h2 className={styles.section_title}>IR행사</h2>
      <div className={styles.searchArea}>
        <div className={styles.searchBox}>
          <select
            className={styles.searchSelect}
            value={searchType}
            onChange={(e) =>
              setSearchType(e.target.value as "subject" | "content")
            }
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
        <div
          className={`${styles.boardHeader} ${isAdmin ? styles.adminMode : ""}`}
        >
          {isAdmin && (
            <div className={styles.checkboxHeader}>
              <input type="checkbox" id="selectAll" />
            </div>
          )}
          {!isAdmin && <div className={styles.checkboxHeader}></div>}
          <div>행사명</div>
          <div>시간</div>
          <div>자료받기</div>
        </div>
        <div className={styles.boardItems}>
          {pageData.length === 0 ? (
            <div className={`${styles.boardItem} ${styles.emptyState}`}>
              등록된 게시글이 없습니다.
            </div>
          ) : (
            pageData.map((item) => (
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
                <div className={`${styles.boardCell} ${styles.title}`}>
                  <span
                    className={styles.eventTitleLink}
                    onClick={() => {
                      if (item.detailUrl && item.detailUrl !== "#") {
                        window.location.href = item.detailUrl;
                      }
                    }}
                  >
                    {item.eventName}
                  </span>
                </div>
                <div className={styles.boardCell}>{item.time}</div>
                <div className={styles.boardCell}>
                  <button
                    className={styles.downloadBtn}
                    onClick={() => {
                      if (item.fileUrl && item.fileUrl !== "#") {
                        window.location.href = item.fileUrl;
                      }
                    }}
                  >
                    <Image
                      src="/images/icon/download_ico.png"
                      alt="다운로드"
                      width={20}
                      height={20}
                    />
                    <span>자료받기</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isAdmin && (
        <div className={`${styles.adminActions} ${styles.show}`}>
          <button className={styles.adminBtn} id="adminPageBtn">
            관리자{" "}
            <Image
              src="/images/icon/arrow_01.png"
              alt=""
              width={14}
              height={14}
            />
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
            <Image
              src="/images/icon/first_ico.png"
              alt="맨 앞으로"
              width={13}
              height={13}
            />
          </button>
          <button
            className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ""}`}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <Image
              src="/images/icon/prev_ico.png"
              alt="앞으로"
              width={13}
              height={13}
            />
          </button>
          {renderPagination()}
          <button
            className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ""}`}
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            <Image
              src="/images/icon/next_ico.png"
              alt="뒤로"
              width={13}
              height={13}
            />
          </button>
          <button
            className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ""}`}
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <Image
              src="/images/icon/last_ico.png"
              alt="맨 뒤로"
              width={13}
              height={13}
            />
          </button>
        </div>
      )}
    </section>
  );
}
