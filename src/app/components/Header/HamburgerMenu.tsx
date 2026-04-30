/**
 * 햄버거 전체 화면 메뉴(모바일 아코디언). 사용처: `Header/Header.tsx`만.
 */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  hamburgerMenuData,
  type HamburgerMenuColumn,
} from "../../../data/menuData";
import styles from "./HamburgerMenu.module.css";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  /** API 1뎁스 기준으로 채운 제품 첫 컬럼 (없으면 `menuData` 정적 첫 컬럼) */
  productColumnOverride?: HamburgerMenuColumn | null;
}

const DEFAULT_OPEN_SECTION = "product";

const isExternalHref = (href: string) => /^https?:\/\//i.test(href);

const productSubKey = (groupIndex: number, bigCateIndex: number) =>
  `p${groupIndex}-${bigCateIndex}`;

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  productColumnOverride,
}) => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  /** 제품 1뎁스별 소분류(2뎁스) 펼침 — 태블릿·모바일·웹(데스크톱) 공통 */
  const [openProductSubKeys, setOpenProductSubKeys] = useState<Set<string>>(
    () => new Set()
  );

  const columns = React.useMemo(() => {
    if (productColumnOverride) {
      return [productColumnOverride, ...hamburgerMenuData.slice(1)];
    }
    return hamburgerMenuData;
  }, [productColumnOverride]);

  useEffect(() => {
    setOpenSection(isOpen ? DEFAULT_OPEN_SECTION : null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setOpenProductSubKeys(new Set());
  }, [isOpen]);

  const toggleProductSub = (key: string) => {
    setOpenProductSubKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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
        {columns.map((column, columnIndex) => (
          <li key={columnIndex} className={styles.menuColumn}>
            {/* 첫 번째 컬럼: 기본은 열림, 모바일에서 닫기/열기 가능 */}
            {column.title && column.bigCateGroups && (
              <>
                <h2
                  className={
                    openSection === DEFAULT_OPEN_SECTION ? styles.open : undefined
                  }
                  onClick={() => handleSectionToggle(DEFAULT_OPEN_SECTION)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSectionToggle(DEFAULT_OPEN_SECTION);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={openSection === DEFAULT_OPEN_SECTION}
                >
                  {column.title}
                  <span>{column.titleEn}</span>
                </h2>
                <div className={`${styles.menu} ${styles.productMenu}`}>
                  {column.bigCateGroups.map((bigCateGroup, groupIndex) => (
                    <ul
                      key={groupIndex}
                      className={`${styles.bigCate} ${styles.productGroup}`}
                    >
                      {bigCateGroup.map((bigCate, bigCateIndex) => {
                        const subKey = productSubKey(groupIndex, bigCateIndex);
                        const hasSmall = Boolean(
                          bigCate.smallCategories?.length
                        );
                        const subPanelOpen = openProductSubKeys.has(subKey);
                        const subPanelId = `ham-product-sub-${subKey}`;
                        return (
                          <li key={bigCateIndex}>
                            {hasSmall ? (
                              <div className={styles.productBigRow}>
                                <Link
                                  href={bigCate.href}
                                  prefetch={false}
                                  onClick={handleLinkClick}
                                >
                                  <span className={styles.hamKo}>{bigCate.label}</span>
                                  {bigCate.titleEn ? (
                                    <span className={styles.hamEn}>{bigCate.titleEn}</span>
                                  ) : null}
                                </Link>
                                <button
                                  type="button"
                                  className={`${styles.productSubToggle} ${
                                    subPanelOpen ? styles.productSubToggleOpen : ""
                                  }`}
                                  aria-expanded={subPanelOpen}
                                  aria-controls={subPanelId}
                                  aria-label={
                                    subPanelOpen
                                      ? `${bigCate.label} 하위 메뉴 접기`
                                      : `${bigCate.label} 하위 메뉴 펼치기`
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleProductSub(subKey);
                                  }}
                                />
                              </div>
                            ) : (
                              <Link
                                href={bigCate.href}
                                prefetch={false}
                                onClick={handleLinkClick}
                              >
                                <span className={styles.hamKo}>{bigCate.label}</span>
                                {bigCate.titleEn ? (
                                  <span className={styles.hamEn}>{bigCate.titleEn}</span>
                                ) : null}
                              </Link>
                            )}
                            {hasSmall && (
                              <ul
                                id={subPanelId}
                                className={`${styles.smallCate} ${styles.smallCateCollapsible} ${
                                  subPanelOpen
                                    ? styles.smallCateOpen
                                    : styles.smallCateClosed
                                }`}
                              >
                                {bigCate.smallCategories!.map(
                                  (smallCate, smallIndex) => (
                                    <li key={smallIndex}>
                                      <Link
                                        href={smallCate.href}
                                        prefetch={false}
                                        onClick={handleLinkClick}
                                      >
                                        <span className={styles.hamKo}>{smallCate.label}</span>
                                        {smallCate.titleEn ? (
                                          <span className={styles.hamEn}>{smallCate.titleEn}</span>
                                        ) : null}
                                      </Link>
                                    </li>
                                  )
                                )}
                              </ul>
                            )}
                          </li>
                        );
                      })}
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
                            {isExternalHref(bigCate.href) ? (
                              <a
                                href={bigCate.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleLinkClick}
                              >
                                <span className={styles.hamKo}>{bigCate.label}</span>
                                {bigCate.titleEn ? (
                                  <span className={styles.hamEn}>{bigCate.titleEn}</span>
                                ) : null}
                              </a>
                            ) : (
                              <Link
                                href={bigCate.href}
                                onClick={handleLinkClick}
                              >
                                <span className={styles.hamKo}>{bigCate.label}</span>
                                {bigCate.titleEn ? (
                                  <span className={styles.hamEn}>{bigCate.titleEn}</span>
                                ) : null}
                              </Link>
                            )}
                            {bigCate.smallCategories && (
                              <ul className={styles.smallCate}>
                                {bigCate.smallCategories.map(
                                  (smallCate, smallIndex) => (
                                    <li key={smallIndex}>
                                      <Link
                                        href={smallCate.href}
                                        onClick={handleLinkClick}
                                      >
                                        <span className={styles.hamKo}>{smallCate.label}</span>
                                        {smallCate.titleEn ? (
                                          <span className={styles.hamEn}>{smallCate.titleEn}</span>
                                        ) : null}
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
