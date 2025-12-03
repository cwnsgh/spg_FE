/**
 * MainTabs 컴포넌트
 * 
 * 마케팅 페이지의 메인 탭 네비게이션입니다.
 * 기능:
 * - "글로벌 네트워크" 탭: 해외/국내 사업장 정보, 지도, 사업장 리스트
 * - "주요고객사" 탭: 주요 고객사 정보
 * 
 * 상태 관리:
 * - useState로 현재 선택된 탭 관리
 * - 탭 변경 시 해당 컴포넌트만 렌더링 (조건부 렌더링)
 */
"use client";

import { useState } from "react";
import styles from "./MainTabs.module.css";
import GlobalNetwork from "./GlobalNetwork/GlobalNetwork";
import Customers from "./Customers/Customers";

export default function MainTabs() {
  // 현재 선택된 메인 탭 상태
  const [activeTab, setActiveTab] = useState<"global-network" | "customers">(
    "global-network"  // 기본값: 글로벌 네트워크
  );

  return (
    <div className={styles.container}>
      {/* 탭 버튼들 */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "global-network" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("global-network")}
        >
          글로벌 네트워크
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "customers" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("customers")}
        >
          주요고객사
        </button>
      </div>

      {/* 선택된 탭에 따른 콘텐츠 표시 */}
      <div className={styles.content}>
        {activeTab === "global-network" && <GlobalNetwork />}
        {activeTab === "customers" && <Customers />}
      </div>
    </div>
  );
}

