"use client";

import type { ProductCategoryFile } from "@/api/product";
import { toBackendAssetUrl } from "@/api/config";
import type { ProductSubCategory } from "../data/productData";
import styles from "./ProductNavigation.module.css";

function usableCategoryFiles(
  files: ProductCategoryFile[] | undefined
): ProductCategoryFile[] {
  return (files ?? []).filter((f) => {
    const ko = f.title_ko?.trim() ?? "";
    const en = f.title_en?.trim() ?? "";
    const path = f.file_path?.trim() ?? "";
    return path.length > 0 && (ko.length > 0 || en.length > 0);
  });
}

interface ProductNavigationProps {
  activeSubCategory: string;
  onSubCategoryChange: (category: string) => void;
  subCategories: ProductSubCategory[];
  /** 1뎁스(탭) 카테고리 공통 자료 — 표시 제목(`title_ko`/`title_en`)으로만 노출, 없으면 이 영역 자체를 숨김 */
  categoryFiles?: ProductCategoryFile[];
  /** 현재 선택된 2뎁스 전용 자료 — 대분류 블록 아래에 구분되어 표시 */
  subCategoryFiles?: ProductCategoryFile[];
}

export default function ProductNavigation({
  activeSubCategory,
  onSubCategoryChange,
  subCategories,
  categoryFiles = [],
  subCategoryFiles = [],
}: ProductNavigationProps) {
  const rootFileLinks = usableCategoryFiles(categoryFiles);
  const subFileLinks = usableCategoryFiles(subCategoryFiles);

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

      {rootFileLinks.length > 0 ? (
        <nav className={styles.commonNav} aria-label="대분류 자료">
          {rootFileLinks.map((f) => {
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

      {subFileLinks.length > 0 ? (
        <div className={styles.subFilesSection}>
          <p className={styles.subFilesLabel}>이 분류 자료</p>
          <nav className={styles.subFilesNav} aria-label="선택한 중분류 자료">
            {subFileLinks.map((f) => {
              const label = (f.title_ko?.trim() || f.title_en?.trim()) ?? "";
              return (
                <a
                  key={f.file_id}
                  className={styles.subFileItem}
                  href={toBackendAssetUrl(f.file_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label}
                </a>
              );
            })}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
