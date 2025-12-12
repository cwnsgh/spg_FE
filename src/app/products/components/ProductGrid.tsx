"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./ProductGrid.module.css";

interface Product {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  detailUrl: string;
}

interface ProductGridProps {
  products: Product[];
}

const itemsPerPage = 6;

export default function ProductGrid({ products }: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // 페이지네이션 계산
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 페이지네이션 버튼 생성
  const paginationButtons = useMemo(() => {
    if (totalPages <= 1) return null;

    const buttons = [];

    // 첫 페이지 버튼
    buttons.push(
      <button
        key="first"
        className={`${styles.paginationBtn} ${
          currentPage === 1 ? styles.disabled : ""
        }`}
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
      >
        <Image
          src="/images/icon/first_ico.png"
          alt="맨 앞으로"
          width={16}
          height={13}
        />
      </button>
    );

    // 이전 페이지 버튼
    buttons.push(
      <button
        key="prev"
        className={`${styles.paginationBtn} ${
          currentPage === 1 ? styles.disabled : ""
        }`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Image
          src="/images/icon/prev_ico.png"
          alt="앞으로"
          width={16}
          height={13}
        />
      </button>
    );

    // 페이지 번호 버튼
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      buttons.push(
        <button
          key="page-1"
          className={`${styles.paginationBtn} ${styles.pageNumber} ${
            currentPage === 1 ? styles.active : ""
          }`}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );

      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis-1" style={{ padding: "0 5px" }}>
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={`page-${i}`}
          className={`${styles.paginationBtn} ${styles.pageNumber} ${
            currentPage === i ? styles.active : ""
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis-2" style={{ padding: "0 5px" }}>
            ...
          </span>
        );
      }

      buttons.push(
        <button
          key={`page-${totalPages}`}
          className={`${styles.paginationBtn} ${styles.pageNumber} ${
            currentPage === totalPages ? styles.active : ""
          }`}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    // 다음 페이지 버튼
    buttons.push(
      <button
        key="next"
        className={`${styles.paginationBtn} ${
          currentPage === totalPages ? styles.disabled : ""
        }`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Image
          src="/images/icon/next_ico.png"
          alt="뒤로"
          width={16}
          height={13}
        />
      </button>
    );

    // 마지막 페이지 버튼
    buttons.push(
      <button
        key="last"
        className={`${styles.paginationBtn} ${
          currentPage === totalPages ? styles.disabled : ""
        }`}
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <Image
          src="/images/icon/last_ico.png"
          alt="맨 뒤로"
          width={16}
          height={13}
        />
      </button>
    );

    return buttons;
  }, [currentPage, totalPages]);

  // 서브 카테고리 변경 시 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  return (
    <div className={styles.productMain}>
      {/* 제품 그리드 */}
      <div className={styles.productGrid}>
        {currentProducts.map((product) => (
          <Link
            key={product.id}
            href={product.detailUrl}
            className={styles.productItem}
          >
            <div className={styles.productImageWrap}>
              <Image
                src={product.image}
                alt={product.name}
                className={styles.productImage}
                width={400}
                height={300}
              />
            </div>
            <div className={styles.productBottom}>
              <div className={styles.productInfo}>
                <div className={styles.productName}>{product.name}</div>
                <div className={styles.productNameEn}>{product.nameEn}</div>
              </div>
              <div className={styles.productLinkBtn}></div>
            </div>
          </Link>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>{paginationButtons}</div>
      )}
    </div>
  );
}
