/**
 * AboutTabs 컴포넌트
 *
 * 회사소개 페이지의 탭 콘텐츠를 관리하는 컴포넌트입니다.
 * 기능:
 * - URL 쿼리 파라미터에서 현재 탭 읽기
 * - HeroBanner에서 선택된 탭에 따라 해당 섹션 표시
 *
 * 탭 인덱스와 섹션 매핑:
 * - 0: 인사말 (Greeting)
 * - 1: 경영이념 및 비전 (Vision)
 * - 2: 회사연혁 (CompanyHistory)
 * - 3: 채용정보 (Recruitment)
 * - 4: 찾아오시는 길 (Directions)
 * - 5: 윤리규정 (Ethics)
 * - default: 인사말 (Greeting)
 *
 * 상태 관리:
 * - useSearchParams로 URL 쿼리 파라미터에서 탭 인덱스 읽기
 * - switch 문으로 해당 섹션 컴포넌트만 렌더링
 */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Greeting from "./sections/Greeting";
import Vision from "./sections/Vision";
import CompanyHistory from "./sections/CompanyHistory";
import Recruitment from "./sections/Recruitment";
import Directions from "./sections/Directions";
import Ethics from "./sections/Ethics";
import styles from "./AboutTabs.module.css";

export default function AboutTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  // URL 쿼리 파라미터에서 탭 인덱스 읽기 (기본값: 0)
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<number>(
    initialTab ? parseInt(initialTab, 10) : 0
  );

  // 초기 로딩 시 URL에 tab 파라미터가 없으면 기본값 0으로 설정
  useEffect(() => {
    if (!isInitialized && !searchParams.get("tab")) {
      router.replace("/aboutUs?tab=0", { scroll: false });
      setIsInitialized(true);
      setActiveTab(0);
    } else if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [searchParams, router, isInitialized]);

  // URL 쿼리 파라미터 변경 시 탭 상태 업데이트
  useEffect(() => {
    if (!isInitialized) return;

    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const tab = parseInt(tabParam, 10);
      if (!isNaN(tab) && tab >= 0 && tab <= 5) {
        setActiveTab(tab);
      }
    } else {
      setActiveTab(0);
    }
  }, [searchParams, isInitialized]);

  // 탭 인덱스에 따라 해당 섹션 컴포넌트 반환
  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <Greeting />; // 인사말
      case 1:
        return <Vision />; // 경영이념 및 비전
      case 2:
        return <CompanyHistory />; // 회사연혁
      case 3:
        return <Recruitment />; // 채용정보
      case 4:
        return <Directions />; // 찾아오시는 길
      case 5:
        return <Ethics />; // 윤리규정
      default:
        return <Greeting />; // 인사말 (기본값)
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>{renderContent()}</div>
    </div>
  );
}
