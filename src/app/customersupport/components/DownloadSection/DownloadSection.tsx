"use client";

/** 고객지원 다운로드 탭(목업·정적 목록). 사용처: `SupportTabs.tsx`. */
import { useState, useMemo } from "react";
import Image from "next/image";
import styles from "./DownloadSection.module.css";

// 임시 데이터 (HTML에서 가져옴)
const downloadData = [
  {
    id: 1,
    title: "Component Cup Type",
    category: "manual",
    productType1: "robot",
    productType2: "all",
    fileUrl: "#",
  },
  {
    id: 2,
    title: "Unit Cup Type",
    category: "manual",
    productType1: "robot",
    productType2: "all",
    fileUrl: "#",
  },
  {
    id: 7,
    title: "G-net Software & Manual",
    category: "manual2",
    productType1: "robot",
    productType2: "all",
    fileUrl: "#",
    thumbnail: "/images/manual_01.png",
    tag: "STEP",
  },
  {
    id: 8,
    title: "G-STEP C Type Manual (통신편)",
    category: "manual2",
    productType1: "robot",
    productType2: "all",
    fileUrl: "#",
    thumbnail: "/images/manual_02.png",
    tag: "STEP",
  },
  {
    id: 11,
    title: "Unit Silk Hat Hollow Shaft Type",
    category: "technical",
    productType1: "ksh",
    productType2: "all",
    fileUrl: "#",
  },
  {
    id: 12,
    title: "Unit Silk Hat Input Shaft Type",
    category: "technical",
    productType1: "ksh",
    productType2: "all",
    fileUrl: "#",
  },
];

type CategoryType = "manual" | "manual2" | "technical";

export default function DownloadSection() {
  const [activeCategory, setActiveCategory] =
    useState<CategoryType>("manual");
  const [productType1, setProductType1] = useState("all");
  const [productType2, setProductType2] = useState("all");
  const [searchType, setSearchType] = useState("subject");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    let filtered = downloadData.filter(
      (item) => item.category === activeCategory
    );

    // 제품 타입 필터
    if (productType1 !== "all") {
      filtered = filtered.filter(
        (item) => item.productType1 === productType1
      );
    }
    if (productType2 !== "all") {
      filtered = filtered.filter(
        (item) => item.productType2 === productType2
      );
    }

    // 검색 필터
    if (searchKeyword.trim()) {
      filtered = filtered.filter((item) =>
        item.title.includes(searchKeyword)
      );
    }

    return filtered;
  }, [activeCategory, productType1, productType2, searchKeyword]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const isManualStyle = activeCategory === "manual2";

  return (
    <section className={styles.download}>
      <h2 className={styles.section_title}>다운로드</h2>
      <div className={styles.downloadWrapper}>
        {/* 왼쪽 카테고리 네비게이션 */}
        <div className={styles.categoryNav}>
        <button
          className={`${styles.categoryBtn} ${
            activeCategory === "manual" ? styles.active : ""
          }`}
          onClick={() => {
            setActiveCategory("manual");
            setCurrentPage(1);
          }}
        >
          제품 설명서
        </button>
        <button
          className={`${styles.categoryBtn} ${
            activeCategory === "manual2" ? styles.active : ""
          }`}
          onClick={() => {
            setActiveCategory("manual2");
            setCurrentPage(1);
          }}
        >
          매뉴얼
        </button>
        <button
          className={`${styles.categoryBtn} ${
            activeCategory === "technical" ? styles.active : ""
          }`}
          onClick={() => {
            setActiveCategory("technical");
            setCurrentPage(1);
          }}
        >
          기술자료
        </button>
      </div>

      {/* 오른쪽 메인 콘텐츠 */}
      <div className={styles.downloadContent}>
        {/* 필터 및 검색 영역 */}
        <div className={styles.filterArea}>
          <div className={styles.productFilters}>
            <div className={styles.selectWrapper}>
              <select
                value={productType1}
                onChange={(e) => {
                  setProductType1(e.target.value);
                  setCurrentPage(1);
                }}
                className={styles.egFont}
              >
                <option value="all">전체</option>
                <option value="robot">ROBOT REDUCER</option>
                <option value="ksh">KSH REDUCER</option>
              </select>
            </div>
            <div className={styles.selectWrapper}>
              <select
                value={productType2}
                onChange={(e) => {
                  setProductType2(e.target.value);
                  setCurrentPage(1);
                }}
                className={styles.egFont}
              >
                <option value="all">전체</option>
                <option value="robot">ROBOT REDUCER</option>
                <option value="ksh">KSH REDUCER</option>
              </select>
            </div>
          </div>
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

        {/* 다운로드 리스트 */}
        <div className={styles.downloadList}>
          {paginatedData.length === 0 ? (
            <div className={`${styles.downloadItem} ${styles.emptyState}`}>
              등록된 자료가 없습니다.
            </div>
          ) : (
            paginatedData.map((item) => (
              <div
                key={item.id}
                className={`${styles.downloadItem} ${
                  isManualStyle ? styles.manual : ""
                }`}
              >
                {isManualStyle && item.thumbnail ? (
                  <>
                    <div className={styles.itemThumbnail}>
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        width={163}
                        height={231}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className={styles.itemRightWrapper}>
                      <div className={styles.itemContent}>
                        {item.tag && (
                          <span className={styles.itemTag}>{item.tag}</span>
                        )}
                        <div className={`${styles.itemTitle} ${styles.egFont}`}>
                          {item.title}
                        </div>
                      </div>
                      <button className={styles.downloadBtn}>
                        <Image
                          src="/images/icon/download_ico.png"
                          alt="다운로드"
                          width={20}
                          height={20}
                        />
                        <span>다운로드</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.itemTitle}>{item.title}</div>
                    <button className={styles.downloadBtn}>
                      <Image
                        src="/images/icon/download_ico.png"
                        alt="다운로드"
                        width={20}
                        height={20}
                      />
                      <span>다운로드</span>
                    </button>
                  </>
                )}
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
              <Image
                src="/images/icon/prev_ico.png"
                alt="이전"
                width={13}
                height={13}
              />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  className={`${styles.paginationBtn} ${styles.pageNumber} ${
                    currentPage === page ? styles.active : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
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
              <Image
                src="/images/icon/next_ico.png"
                alt="다음"
                width={13}
                height={13}
              />
            </button>
          </div>
        )}
      </div>
      </div>
    </section>
  );
}
