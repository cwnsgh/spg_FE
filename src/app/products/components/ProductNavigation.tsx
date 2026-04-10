"use client";

import type { ProductCategoryFile } from "@/api/product";
import { toBackendAssetUrl } from "@/api/config";
import type { ProductSubCategory } from "../data/productData";
import styles from "./ProductNavigation.module.css";

interface ProductNavigationProps {
  activeSubCategory: string;
  onSubCategoryChange: (category: string) => void;
  subCategories: ProductSubCategory[];
  /** 1뎁스(탭) 카테고리 공통 자료 — 표시 제목(`title_ko`/`title_en`)으로만 노출, 없으면 이 영역 자체를 숨김 */
  categoryFiles?: ProductCategoryFile[];
}

export default function ProductNavigation({
  activeSubCategory,
  onSubCategoryChange,
  subCategories,
  categoryFiles = [],
}: ProductNavigationProps) {
  const fileLinks = categoryFiles.filter((f) => {
    const ko = f.title_ko?.trim() ?? "";
    const en = f.title_en?.trim() ?? "";
    const path = f.file_path?.trim() ?? "";
    return path.length > 0 && (ko.length > 0 || en.length > 0);
  });

  return (
    <div className={styles.navWrap}>
      <div className={styles.subCategoryNavWrap}>
        <nav className={styles.subCategoryNav} aria-label="중 카테고리 선택">
          {subCategories.map((category) => (
            <div
              key={category.id}
              className={`${styles.subCategoryItem} ${
                activeSubCategory === category.id ? styles.active : ""
              }`}
              data-sub-category={category.id}
              onClick={() => onSubCategoryChange(category.id)}
            >
              {category.label}
            </div>
          ))}
        </nav>
      </div>

      {fileLinks.length > 0 ? (
        <nav className={styles.commonNav} aria-label="대분류 자료">
          {fileLinks.map((f) => {
            const label = (f.title_ko?.trim() || f.title_en?.trim()) ?? "";
            return (
              <a
                key={f.file_id}
                className={styles.commonItem}
                href={toBackendAssetUrl(f.file_path)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
              </a>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
