"use client";

import { ApiError, BoardPostItem, getBoardPosts } from "@/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./IRAnnouncement.module.css";

interface IRBoardListProps {
  title: string;
  boardTable: string;
  detailBasePath: string;
}

export default function IRBoardList({
  title,
  boardTable,
  detailBasePath,
}: IRBoardListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [searchType, setSearchType] = useState<"subject" | "content">("subject");
  const [items, setItems] = useState<BoardPostItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getBoardPosts({
        bo_table: boardTable,
        page: currentPage,
        stx: submittedKeyword.trim(),
      });

      setItems(data.list);
      setTotalPages(data.pagination.total_pages);
      setTotalCount(data.pagination.total_count);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(`${title} 목록을 불러오지 못했습니다.`);
      }
      setItems([]);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [boardTable, currentPage, submittedKeyword, title]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const handleSearch = () => {
    setCurrentPage(1);
    setSubmittedKeyword(searchKeyword);
  };

  const visiblePages = useMemo(() => {
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => {
      return startPage + index;
    });
  }, [currentPage, totalPages]);

  const sortedItems = useMemo(() => {
    const toTime = (value: string) => {
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    return [...items].sort((left, right) => {
      const noticePriority = Number(Boolean(right.is_notice)) - Number(Boolean(left.is_notice));

      if (noticePriority !== 0) {
        return noticePriority;
      }

      return toTime(right.datetime) - toTime(left.datetime);
    });
  }, [items]);

  return (
    <section className={styles.board}>
      <h2 className={styles.section_title}>{title}</h2>

      <div className={styles.searchArea}>
        <div className={styles.searchBox}>
          <select
            className={styles.searchSelect}
            value={searchType}
            onChange={(event) =>
              setSearchType(event.target.value as "subject" | "content")
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
              onChange={(event) => setSearchKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
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

      {!isLoading && totalCount > 0 && (
        <div className={styles.listMeta}>
          <span className={styles.listMetaItem}>전체 {totalCount}건</span>
          {submittedKeyword.trim() && (
            <span className={styles.listMetaItem}>
              검색어: <strong>{submittedKeyword}</strong>
            </span>
          )}
        </div>
      )}

      <div className={styles.boardList}>
        <div className={styles.boardHeader}>
          <div>번호</div>
          <div>제목</div>
          <div>작성자</div>
          <div>작성일</div>
          <div>조회수</div>
        </div>

        <div className={styles.boardItems}>
          {isLoading ? (
            <div className={`${styles.boardItem} ${styles.emptyState}`}>
              목록을 불러오는 중입니다.
            </div>
          ) : errorMessage ? (
            <div className={`${styles.boardItem} ${styles.emptyState}`}>
              {errorMessage}
            </div>
          ) : items.length === 0 ? (
            <div className={`${styles.boardItem} ${styles.emptyState}`}>
              등록된 게시글이 없습니다.
            </div>
          ) : (
            sortedItems.map((item) => (
              <div key={item.id} className={styles.boardItem}>
                <div className={styles.boardCell}>{item.num ?? item.id}</div>
                <div className={`${styles.boardCell} ${styles.title}`}>
                  <Link
                    href={`${detailBasePath}/${item.id}`}
                    className={styles.titleLink}
                  >
                    {item.is_notice && (
                      <span className={styles.noticeBadge}>공지</span>
                    )}
                    {item.subject}
                  </Link>
                </div>
                <div className={styles.boardCell}>{item.writer}</div>
                <div className={styles.boardCell}>{item.datetime}</div>
                <div className={styles.boardCell}>{item.hit}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={`${styles.paginationButton} ${
              currentPage === 1 ? styles.disabled : ""
            }`}
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
            className={`${styles.paginationButton} ${
              currentPage === 1 ? styles.disabled : ""
            }`}
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

          {visiblePages[0] && visiblePages[0] > 1 && (
            <>
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(1)}
              >
                1
              </button>
              {visiblePages[0] > 2 && (
                <span style={{ padding: "0 5px" }}>...</span>
              )}
            </>
          )}

          {visiblePages.map((page) => (
            <button
              key={page}
              className={`${styles.paginationButton} ${styles.pageNumber} ${
                currentPage === page ? styles.active : ""
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          {visiblePages.length > 0 &&
            visiblePages[visiblePages.length - 1] < totalPages && (
              <>
                {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                  <span style={{ padding: "0 5px" }}>...</span>
                )}
                <button
                  className={styles.paginationButton}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}

          <button
            className={`${styles.paginationButton} ${
              currentPage === totalPages ? styles.disabled : ""
            }`}
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
            className={`${styles.paginationButton} ${
              currentPage === totalPages ? styles.disabled : ""
            }`}
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
