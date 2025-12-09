/**
 * 카테고리 메뉴 섹션 컴포넌트
 * - 5개의 카테고리 아이템 표시
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { categoryData } from '@/data/categoryData';
import styles from './CategoryMenu.module.css';

const CategoryMenu: React.FC = () => {
  return (
    <section className={styles.cateMenu}>
      <ul className={styles.cateList}>
        {categoryData.map((category, index) => (
          <li key={index} className={styles.cateItem}>
            <Link href={category.href}>
              <div className={styles.cateName}>
                <h2 className={styles.nameKr}>
                  {category.nameKr}
                  <span className={styles.moreView}>
                    <img src={category.iconPath} alt="" />
                  </span>
                </h2>
                <p className={`${styles.nameEg} eg-font`}>{category.nameEg}</p>
              </div>
            </Link>
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

