/**
 * 제품소개 왼쪽 사이드바(레거시 마크업). 현재 `(site)/products/page.tsx`에서 import되지 않음.
 *
 * 제품소개 페이지의 왼쪽 사이드바입니다.
 * 기능:
 * 1. 제품 카테고리 탭: KSH REDUCER / KSR REDUCER 전환
 * 2. 접을 수 있는 섹션들: 작동원리, 형식찾기, 기술자료
 *
 * 상태 관리:
 * - activeTab: 현재 선택된 제품 타입 (KSH 또는 KSR)
 * - expandedSections: 각 섹션의 열림/닫힘 상태
 */
"use client";

import { useState } from "react";
import styles from "./ProductSidebar.module.css";

export default function ProductSidebar() {
  // 현재 선택된 제품 타입 (KSH 또는 KSR)
  const [activeTab, setActiveTab] = useState<"ksh" | "ksr">("ksh");

  // 각 접을 수 있는 섹션의 열림/닫힘 상태
  const [expandedSections, setExpandedSections] = useState<{
    principle: boolean; // 작동원리
    findType: boolean; // 형식찾기
    technical: boolean; // 기술자료
  }>({
    principle: false,
    findType: false,
    technical: false,
  });

  // 섹션 열기/닫기 토글 함수
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.categoryTitle}>
        로봇감속기
        <span className={styles.categoryTitleEn}>ROBOT REDUCER</span>
      </h2>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "ksh" ? styles.active : ""}`}
          onClick={() => setActiveTab("ksh")}
        >
          KSH REDUCER
        </button>
        <button
          className={`${styles.tab} ${activeTab === "ksr" ? styles.active : ""}`}
          onClick={() => setActiveTab("ksr")}
        >
          KSR REDUCER
        </button>
      </div>

      <div className={styles.sections}>
        <div className={styles.section}>
          <button
            className={styles.sectionHeader}
            onClick={() => toggleSection("principle")}
          >
            작동원리
            <span
              className={`${styles.arrow} ${
                expandedSections.principle ? styles.expanded : ""
              }`}
            >
              ▼
            </span>
          </button>
          {expandedSections.principle && (
            <div className={styles.sectionContent}>
              작동원리 내용이 여기에 표시됩니다.
            </div>
          )}
        </div>

        <div className={styles.section}>
          <button
            className={styles.sectionHeader}
            onClick={() => toggleSection("findType")}
          >
            형식찾기
            <span
              className={`${styles.arrow} ${
                expandedSections.findType ? styles.expanded : ""
              }`}
            >
              ▼
            </span>
          </button>
          {expandedSections.findType && (
            <div className={styles.sectionContent}>
              형식찾기 내용이 여기에 표시됩니다.
            </div>
          )}
        </div>

        <div className={styles.section}>
          <button
            className={styles.sectionHeader}
            onClick={() => toggleSection("technical")}
          >
            기술자료
            <span
              className={`${styles.arrow} ${
                expandedSections.technical ? styles.expanded : ""
              }`}
            >
              ▼
            </span>
          </button>
          {expandedSections.technical && (
            <div className={styles.sectionContent}>
              기술자료 내용이 여기에 표시됩니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
