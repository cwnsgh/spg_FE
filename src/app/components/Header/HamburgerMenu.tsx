/**
 * 햄버거 메뉴 컴포넌트
 * - 전체 화면 모바일 메뉴 (모바일에서 h2 클릭 시 아코디언)
 */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { hamburgerMenuData } from "../../../data/menuData";
import styles from "./HamburgerMenu.module.css";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose }) => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) setOpenSection(null);
  }, [isOpen]);

  const handleSectionToggle = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const handleLinkClick = () => {
    onClose();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.hamMenu} ${isOpen ? styles.active : ""}`}
      onClick={onClose}
    >
      <ul className={styles.hamInner} onClick={(e) => e.stopPropagation()}>
        {hamburgerMenuData.map((column, columnIndex) => (
          <li key={columnIndex} className={styles.menuColumn}>
            {/* 첫 번째 컬럼: 하나의 title과 하나의 menu에 여러 big-cate (모바일에서 항상 펼침) */}
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
                          <Link
                            href={bigCate.href}
                            prefetch={false}
                            onClick={handleLinkClick}
                          >
                            {bigCate.label}
                          </Link>
                          {bigCate.smallCategories && (
                            <ul className={styles.smallCate}>
                              {bigCate.smallCategories.map(
                                (smallCate, smallIndex) => (
                                  <li key={smallIndex}>
                                    <Link
                                      href={smallCate.href}
                                      prefetch={false}
                                      onClick={handleLinkClick}
                                    >
                                      {smallCate.label}
                                    </Link>
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </>
            )}
            {/* 나머지 컬럼: 여러 섹션 (모바일에서 h2 클릭 시 아코디언) */}
            {column.sections &&
              column.sections.map((section, sectionIndex) => {
                const sectionKey = `${columnIndex}-s${sectionIndex}`;
                const isOpenAccordion = openSection === sectionKey;
                return (
                  <React.Fragment key={sectionIndex}>
                    <h2
                      className={isOpenAccordion ? styles.open : undefined}
                      onClick={() => handleSectionToggle(sectionKey)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSectionToggle(sectionKey);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isOpenAccordion}
                    >
                      {section.title}
                      <span>{section.titleEn}</span>
                    </h2>
                  <div className={styles.menu}>
                    {section.bigCateGroups.map((bigCateGroup, groupIndex) => (
                      <ul key={groupIndex} className={styles.bigCate}>
                        {bigCateGroup.map((bigCate, bigCateIndex) => (
                          <li key={bigCateIndex}>
                            <Link href={bigCate.href} onClick={handleLinkClick}>
                              {bigCate.label}
                            </Link>
                            {bigCate.smallCategories && (
                              <ul className={styles.smallCate}>
                                {bigCate.smallCategories.map(
                                  (smallCate, smallIndex) => (
                                    <li key={smallIndex}>
                                      <Link
                                        href={smallCate.href}
                                        onClick={handleLinkClick}
                                      >
                                        {smallCate.label}
                                      </Link>
                                    </li>
                                  )
                                )}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>
                </React.Fragment>
              );
              })}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HamburgerMenu;
