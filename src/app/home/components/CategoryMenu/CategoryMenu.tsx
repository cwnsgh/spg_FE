/**
 * 카테고리 메뉴 섹션 — `(site)/page.tsx` 메인 홈.
 * - 메인 고객지원 바로가기 4개 (PC 한 줄, 좁은 화면은 2×2)
 */
"use client";

import React from "react";
import Link from "next/link";
import { categoryData } from "@/data/categoryData";
import styles from "./CategoryMenu.module.css";

const isExternalHref = (href: string) => /^https?:\/\//i.test(href);

const CategoryMenu: React.FC = () => {
  return (
    <section className={`${styles.cateMenu} section-03 cate-menu`}>
      <ul className={styles.cateList}>
        {categoryData.map((category, index) => (
          <li key={index} className={styles.cateItem}>
            {isExternalHref(category.href) ? (
              <a
                href={category.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className={styles.cateName}>
                  <h2 className={styles.nameKr}>
                    {category.nameKr}
                    <span className={styles.moreView}>
                      <img src={category.iconPath} alt="" />
                    </span>
                  </h2>
                  <p className={`${styles.nameEg} eg-font`}>
                    {category.nameEg}
                  </p>
                </div>
              </a>
            ) : (
              <Link href={category.href} prefetch={false}>
                <div className={styles.cateName}>
                  <h2 className={styles.nameKr}>
                    {category.nameKr}
                    <span className={styles.moreView}>
                      <img src={category.iconPath} alt="" />
                    </span>
                  </h2>
                  <p className={`${styles.nameEg} eg-font`}>
                    {category.nameEg}
                  </p>
                </div>
              </Link>
            )}
          </li>
        ))}
      </ul>
      <div className={styles.btmTxt}>
        <img src="/images/section03_bg.png" alt="SMART FACTORY NEEDS SPG" />
      </div>
    </section>
  );
};

export default CategoryMenu;

