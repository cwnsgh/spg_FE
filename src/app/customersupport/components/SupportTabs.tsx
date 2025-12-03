/**
 * SupportTabs 컴포넌트
 * 
 * 고객지원 페이지의 탭 콘텐츠를 관리하는 컴포넌트입니다.
 * 기능:
 * - HeroBanner에서 선택된 탭에 따라 해당 섹션 표시
 * - URL 쿼리 파라미터와 동기화 (예: ?tab=inquiry)
 * 
 * 탭 종류:
 * - "inquiry": 제품문의 섹션 (문의 유형 탭, 테이블, 필터)
 * - "faq": FAQ 섹션
 * - "download": 다운로드 섹션
 * 
 * 상태 관리:
 * - URL 쿼리 파라미터를 읽어서 초기 탭 설정
 * - 쿼리 파라미터 변경 시 자동으로 탭 업데이트 (useEffect)
 */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import InquirySection from "./InquirySection/InquirySection";
import FAQSection from "./FAQSection/FAQSection";
import DownloadSection from "./DownloadSection/DownloadSection";
import styles from "./SupportTabs.module.css";

export default function SupportTabs() {
  const searchParams = useSearchParams();
  
  // URL 쿼리 파라미터에서 탭 정보 읽기 (없으면 기본값 "inquiry")
  const initialTab = searchParams.get("tab") || "inquiry";
  const [activeTab, setActiveTab] = useState<"inquiry" | "faq" | "download">(
    initialTab as "inquiry" | "faq" | "download"
  );

  // URL 쿼리 파라미터 변경 시 탭 상태 업데이트
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["inquiry", "faq", "download"].includes(tab)) {
      setActiveTab(tab as "inquiry" | "faq" | "download");
    }
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 선택된 탭에 따라 해당 섹션만 렌더링 */}
        {activeTab === "inquiry" && <InquirySection />}
        {activeTab === "faq" && <FAQSection />}
        {activeTab === "download" && <DownloadSection />}
      </div>
    </div>
  );
}

