"use client";

import { ProductSubCategory } from "../data/productData";
import styles from "./ProductNavigation.module.css";

interface ProductNavigationProps {
  activeSubCategory: string;
  onSubCategoryChange: (category: string) => void;
  subCategories: ProductSubCategory[];
}

const commonNavItems = [
  { id: "principle", label: "작동원리" },
  { id: "notation", label: "형식표기" },
  { id: "tech", label: "기술자료" },
];

export default function ProductNavigation({
  activeSubCategory,
  onSubCategoryChange,
  subCategories,
}: ProductNavigationProps) {
  return (
    <div className={styles.navWrap}>
      {/* 서브 카테고리 네비게이션 */}
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

      {/* 공통 네비게이션 */}
      <nav className={styles.commonNav} aria-label="공통 기능">
        {commonNavItems.map((item) => (
          <div key={item.id} className={styles.commonItem}>
            {item.label}
          </div>
        ))}
      </nav>
    </div>
  );
}
