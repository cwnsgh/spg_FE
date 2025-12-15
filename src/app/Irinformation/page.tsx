"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import HeroBanner, { BreadcrumbItem } from "../components/HeroBanner";
import Breadcrumb from "../components/Breadcrumb";
import IRTabs from "./components/IRTabs";
import styles from "./page.module.css";
import aboutUsBanner from "../../assets/aboutus_banner.png";

function IRInformationContent() {
  const searchParams = useSearchParams();
  // IR정보 서브 탭 목록
  const irTabs = [
    { label: "공시정보", value: 0 },
    { label: "IR공고", value: 1 },
    { label: "IR콘텐츠", value: 2 },
    { label: "IR행사", value: 3 },
    { label: "IR 자료실", value: 4 },
  ];

  // 현재 활성 탭에 따라 breadcrumb 생성
  const breadcrumb = useMemo<BreadcrumbItem[]>(() => {
    const baseItems: BreadcrumbItem[] = [
      { label: "홈", href: "/" },
      { label: "IR정보", href: "/Irinformation" },
    ];

    const tabParam = searchParams.get("tab");
    const activeTab = tabParam ? parseInt(tabParam, 10) : 0;

    if (activeTab < irTabs.length) {
      return [...baseItems, { label: irTabs[activeTab].label }];
    }

    return baseItems;
  }, [searchParams]);

  return (
    <>
      {/* 상단 히어로 배너: 페이지 타이틀 + 서브 탭들 */}
      <HeroBanner
        title="IR정보"
        tabs={irTabs}
        useUrlParams={true}
        backgroundImage={aboutUsBanner.src}
        urlParamKey="tab"
        basePath="/Irinformation"
      />

      {/* 메인 콘텐츠 영역: 선택된 탭에 따른 섹션 표시 */}
      <div className={styles.content}>
        {/* Breadcrumb 영역 (content 안에 위치) */}
        <div className={styles.breadcrumbArea}>
          <Breadcrumb items={breadcrumb} />
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <IRTabs />
        </Suspense>
      </div>
    </>
  );
}

export default function IRInformation() {
  return (
    <main className={styles.main}>
      <Suspense fallback={<div>Loading...</div>}>
        <IRInformationContent />
      </Suspense>
    </main>
  );
}
