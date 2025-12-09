/**
 * 햄버거 메뉴 컴포넌트
 * - 전체 화면 모바일 메뉴
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { hamburgerMenuData } from '../../../data/menuData';
import styles from './HamburgerMenu.module.css';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={`${styles.hamMenu} ${isOpen ? styles.active : ''}`} onClick={onClose}>
      <ul className={styles.hamInner} onClick={(e) => e.stopPropagation()}>
        {hamburgerMenuData.map((column, columnIndex) => (
          <li key={columnIndex} className={styles.menuColumn}>
            {/* 첫 번째 컬럼: 하나의 title과 하나의 menu에 여러 big-cate */}
            {column.title && column.bigCateGroups && (
              <>
                <h2>
                  {column.title}
                  <span>{column.titleEn}</span>
                </h2>
                <div className={styles.menu}>
                  {column.bigCateGroups.map((bigCateGroup, groupIndex) => (
                    <ul key={groupIndex} className={styles.bigCate}>
                      {bigCateGroup.map((bigCate, bigCateIndex) => (
                        <li key={bigCateIndex}>
                          <Link href={bigCate.href} prefetch={false}>
                            {bigCate.label}
                          </Link>
                          {bigCate.smallCategories && (
                            <ul className={styles.smallCate}>
                              {bigCate.smallCategories.map((smallCate, smallIndex) => (
                                <li key={smallIndex}>
                                  <Link href={smallCate.href} prefetch={false}>
                                    {smallCate.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </>
            )}
            {/* 나머지 컬럼: 여러 섹션 (각각 h2 + menu) */}
            {column.sections &&
              column.sections.map((section, sectionIndex) => (
                <React.Fragment key={sectionIndex}>
                  <h2>
                    {section.title}
                    <span>{section.titleEn}</span>
                  </h2>
                  <div className={styles.menu}>
                    {section.bigCateGroups.map((bigCateGroup, groupIndex) => (
                      <ul key={groupIndex} className={styles.bigCate}>
                        {bigCateGroup.map((bigCate, bigCateIndex) => (
                          <li key={bigCateIndex}>
                            <Link href={bigCate.href}>{bigCate.label}</Link>
                            {bigCate.smallCategories && (
                              <ul className={styles.smallCate}>
                                {bigCate.smallCategories.map((smallCate, smallIndex) => (
                                  <li key={smallIndex}>
                                    <Link href={smallCate.href}>{smallCate.label}</Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                </React.Fragment>
              ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HamburgerMenu;

