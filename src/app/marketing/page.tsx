/**
 * 마케팅 페이지 (/marketing)
 *
 * 마케팅 관련 정보를 보여주는 페이지입니다.
 * 구조:
 * 1. HeroBanner: 페이지 상단 배너 + breadcrumb + 탭
 * 2. MainTabs: 메인 탭 컴포넌트
 *    - "글로벌 네트워크" 탭: 해외/국내 사업장, 지도, 사업장 리스트
 *    - "주요고객사" 탭: 주요 고객사 정보
 *
 * 상태 관리:
 * - useState를 사용하여 같은 페이지 내에서 탭 전환
 * - 페이지 리로드 없이 빠른 전환 가능
 */
"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import HeroBanner, { BreadcrumbItem } from "../components/HeroBanner";
import Breadcrumb from "../components/Breadcrumb";
import MainTabs from "./components/MainTabs";
import marketingBanner from "../../assets/marketing_banner.png";
import styles from "./page.module.css";

function MarketingContent() {
  const searchParams = useSearchParams();
  const aboutTabs = [
    { label: "글로벌 네트워크", value: 0 },
    { label: "주요고객사", value: 1 },
  ];

  // 현재 활성 탭에 따라 breadcrumb 생성
  const breadcrumb = useMemo<BreadcrumbItem[]>(() => {
    const baseItems: BreadcrumbItem[] = [
      { label: "홈", href: "/" },
      { label: "마케팅", href: "/marketing" },
    ];

    const tabParam = searchParams.get("tab");
    const activeTab = tabParam ? parseInt(tabParam, 10) : 0;

    switch (activeTab) {
      case 0:
        return [...baseItems, { label: "글로벌 네트워크" }];
      case 1:
        return [...baseItems, { label: "주요고객사" }];
      default:
        return [...baseItems, { label: "글로벌 네트워크" }];
    }
  }, [searchParams]);

  return (
    <>
      {/* 상단 히어로 배너: 페이지 타이틀 + 탭 */}
      <HeroBanner
        title="마케팅"
        backgroundImage={marketingBanner.src}
        tabs={aboutTabs}
        useUrlParams={true}
        urlParamKey="tab"
        basePath="/marketing"
      />

      {/* Breadcrumb 영역 */}
      <div className={styles.breadcrumbArea}>
        <Breadcrumb items={breadcrumb} />
      </div>

      {/* 메인 콘텐츠 영역: 탭 네비게이션 + 콘텐츠 */}
      <div className={styles.content}>
        {/* 메인 탭 컴포넌트 (글로벌 네트워크 / 주요고객사) */}
        {/* useSearchParams 사용으로 인해 Suspense 필요 */}
        <Suspense fallback={<div>Loading...</div>}>
          <MainTabs />
        </Suspense>
      </div>
    </>
  );
}

export default function Marketing() {
  return (
    <main className={styles.main}>
      <Suspense fallback={<div>Loading...</div>}>
        <MarketingContent />
      </Suspense>
    </main>
  );
}
