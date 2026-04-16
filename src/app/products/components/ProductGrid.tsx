"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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

/** API에서 name / nameEn이 동일 문자열로 내려올 때 회색 줄이 한 번 더 나오는 경우 제거 */
function pickCardSubtitle(name: string, nameEn: string): string | null {
  const a = name.trim().toLowerCase().replace(/\s+/g, " ");
  const b = nameEn.trim().toLowerCase().replace(/\s+/g, " ");
  if (!b) return null;
  if (a === b) return null;
  return nameEn.trim();
}

/**
 * 긴 영문 제목에서 말줄임으로 끝의 와트/규격이 사라지는 문제 방지.
 * 예: "… MOTOR 200W(□90㎜)" → 앞부분은 2줄 클램프, `200W(□90㎜)` 는 항상 다음 줄에 표시.
 */
function splitProductNameHeadTail(name: string): { head: string; tail: string | null } {
  const trimmed = name.trim();
  const m = trimmed.match(/^(.+?)(\s+\d+(?:\.\d+)?W[\s\S]*)$/i);
  if (!m) return { head: trimmed, tail: null };
  const head = m[1].trimEnd();
  const tail = m[2].trim();
  if (!head || !tail) return { head: trimmed, tail: null };
  return { head, tail };
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // 페이지네이션 계산
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

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
  }, [currentPage, handlePageChange, totalPages]);

  // 서브 카테고리 변경 시 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  return (
    <div className={styles.productMain}>
      {/* 제품 그리드 */}
      <div className={styles.productGrid}>
        {currentProducts.length === 0 && (
          <div className={styles.emptyState}>등록된 제품이 없습니다.</div>
        )}
        {currentProducts.map((product) => {
          const subtitle = pickCardSubtitle(product.name, product.nameEn);
          const { head: nameHead, tail: nameTail } = splitProductNameHeadTail(product.name);
          const fullLabel = subtitle
            ? `${product.name} — ${subtitle}`
            : product.name;
          return (
            <Link
              key={product.id}
              href={product.detailUrl}
              className={styles.productItem}
              title={fullLabel}
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
                  {nameTail ? (
                    <>
                      <div className={styles.productNameHead}>{nameHead}</div>
                      <div className={styles.productNameTail}>{nameTail}</div>
                    </>
                  ) : (
                    <div className={styles.productName}>{product.name}</div>
                  )}
                  {subtitle ? (
                    <div className={styles.productNameEn}>{subtitle}</div>
                  ) : null}
                </div>
                <div className={styles.productLinkBtn}></div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>{paginationButtons}</div>
      )}
    </div>
  );
}
