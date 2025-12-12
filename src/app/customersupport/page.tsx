/**
 * 고객지원 페이지 (/customersupport)
 *
 * 고객지원 관련 정보를 보여주는 페이지입니다.
 * 구조:
 * 1. HeroBanner: 페이지 상단 배너 + 서브 탭 (제품문의, FAQ, 다운로드)
 * 2. breadcrumb: 브레드크럼 (별도 영역)
 * 3. content: 선택된 탭에 따른 콘텐츠 표시
 *    - "제품문의" 탭: 문의 유형 탭, 문의 테이블, 필터/검색
 *    - "FAQ" 탭: 자주 묻는 질문
 *    - "다운로드" 탭: 자료 다운로드
 *
 * URL 쿼리 파라미터 지원:
 * - /customersupport?tab=inquiry → 제품문의 탭으로 이동 (기본값)
 * - /customersupport?tab=faq → FAQ 탭으로 이동
 * - /customersupport?tab=download → 다운로드 탭으로 이동
 */
"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import HeroBanner, { BreadcrumbItem } from "../components/HeroBanner";
import Breadcrumb from "../components/Breadcrumb";
import SupportTabs from "./components/SupportTabs";
import customerSupportBanner from "../../assets/customersupport_banner.png";
import styles from "./page.module.css";

function CustomerSupportContent() {
  const searchParams = useSearchParams();
  const supportTabs = [
    { label: "제품문의", value: "inquiry" },
    { label: "FAQ", value: "faq" },
    { label: "다운로드", value: "download" },
  ];

  // 현재 활성 탭에 따라 breadcrumb 생성
  const breadcrumb = useMemo<BreadcrumbItem[]>(() => {
    const baseItems: BreadcrumbItem[] = [
      { label: "홈", href: "/" },
      { label: "고객지원", href: "/customersupport" },
    ];

    const tabParam = searchParams.get("tab") || "inquiry";

    switch (tabParam) {
      case "inquiry":
        return [...baseItems, { label: "제품문의" }];
      case "faq":
        return [...baseItems, { label: "FAQ" }];
      case "download":
        return [...baseItems, { label: "다운로드" }];
      default:
        return [...baseItems, { label: "제품문의" }];
    }
  }, [searchParams]);

  return (
    <>
      {/* 상단 히어로 배너: 페이지 타이틀 + 서브 탭 */}
      <HeroBanner
        title="고객지원"
        backgroundImage={customerSupportBanner.src}
        tabs={supportTabs}
        useUrlParams={true}
        urlParamKey="tab"
        basePath="/customersupport"
      />

      {/* Breadcrumb 영역 */}
      <div className={styles.breadcrumbArea}>
        <Breadcrumb items={breadcrumb} />
      </div>

      {/* 메인 콘텐츠 영역: 선택된 탭에 따른 콘텐츠 표시 */}
      <div className={styles.content}>
        <Suspense fallback={<div>Loading...</div>}>
          <SupportTabs />
        </Suspense>
      </div>
    </>
  );
}

export default function CustomerSupport() {
  return (
    <main className={styles.main}>
      <Suspense fallback={<div>Loading...</div>}>
        <CustomerSupportContent />
      </Suspense>
    </main>
  );
}
