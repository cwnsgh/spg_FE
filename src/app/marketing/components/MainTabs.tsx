/**
 * MainTabs 컴포넌트 — `marketing/page.tsx` 전용. URL 쿼리 `tab`과 연동.
 *
 * 마케팅 페이지의 탭 콘텐츠를 관리하는 컴포넌트입니다.
 * 기능:
 * - URL 쿼리 파라미터에서 현재 탭 읽기
 * - HeroBanner에서 선택된 탭에 따라 해당 섹션 표시
 *
 * 탭 인덱스와 섹션 매핑:
 * - 0: 글로벌 네트워크 (GlobalNetwork)
 * - 1: 주요고객사 (Customers)
 * - default: 글로벌 네트워크 (GlobalNetwork)
 *
 * 상태 관리:
 * - useSearchParams로 URL 쿼리 파라미터에서 탭 인덱스 읽기
 * - switch 문으로 해당 섹션 컴포넌트만 렌더링
 */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./MainTabs.module.css";
import GlobalNetwork from "./GlobalNetwork/GlobalNetwork";
import Customers from "./Customers/Customers";
import {
  MARKETING_TAB_VALUES,
  resolveMarketingTab,
} from "../marketingTabs";

export default function MainTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  const initialTab = resolveMarketingTab(searchParams.get("tab"));
  const [activeTab, setActiveTab] = useState(initialTab);

  // 초기 로딩 시 URL에 tab 파라미터가 없으면 기본값 0으로 설정
  useEffect(() => {
    if (!isInitialized && !searchParams.get("tab")) {
      router.replace(`/marketing?tab=${MARKETING_TAB_VALUES.globalNetwork}`, {
        scroll: false,
      });
      setIsInitialized(true);
      setActiveTab(MARKETING_TAB_VALUES.globalNetwork);
    } else if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [searchParams, router, isInitialized]);

  // URL 쿼리 파라미터 변경 시 탭 상태 업데이트
  useEffect(() => {
    if (!isInitialized) return;

    setActiveTab(resolveMarketingTab(searchParams.get("tab")));
  }, [searchParams, isInitialized]);

  // 탭 인덱스에 따라 해당 섹션 컴포넌트 반환
  const renderContent = () => {
    switch (activeTab) {
      case MARKETING_TAB_VALUES.globalNetwork:
        return <GlobalNetwork />; // 글로벌 네트워크
      case MARKETING_TAB_VALUES.customers:
        return <Customers />; // 주요고객사
      default:
        return <GlobalNetwork />; // 글로벌 네트워크 (기본값)
    }
  };

  // 탭 텍스트 표시
  const getTabLabel = () => {
    switch (activeTab) {
      case MARKETING_TAB_VALUES.globalNetwork:
        return "글로벌 네트워크";
      case MARKETING_TAB_VALUES.customers:
        return "주요고객사";
      default:
        return "글로벌 네트워크";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 탭 텍스트 - 현재 활성 탭만 표시 */}
        <div className={styles.tabs}>
          <span className={`${styles.tab} ${styles.active}`}>
            {getTabLabel()}
          </span>
        </div>

        {/* 선택된 탭에 따른 콘텐츠 표시 */}
        <div className={styles.tabContent}>{renderContent()}</div>
      </div>
    </div>
  );
}
