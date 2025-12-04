/**
 * 회사소개 페이지 (/aboutUs)
 *
 * 회사 정보를 보여주는 페이지입니다.
 * 구조:
 * 1. HeroBanner: 페이지 상단 배너 + 서브 탭 (연혁, 경영이념, 회사연혁, 채용정보, 찾아오시는 길, 윤리경영)
 * 2. AboutTabs: 선택된 탭에 따른 콘텐츠 표시
 *    - 각 탭별로 별도의 섹션 컴포넌트가 있음
 *    - 예: Greeting (인사말), History (연혁), Vision (경영이념) 등
 *
 * 상태 관리:
 * - useState를 사용하여 같은 페이지 내에서 탭 전환
 * - 탭 변경 시 해당 섹션 컴포넌트만 렌더링
 */
"use client";

import { useState } from "react";
import HeroBanner from "../components/HeroBanner";
import AboutTabs from "./components/AboutTabs";
import styles from "./page.module.css";

export default function AboutUs() {
  // 회사소개 서브 탭 목록
  const aboutTabs = [
    { label: "연혁", value: 0 },
    { label: "경영이념 및 비전", value: 1 },
    { label: "회사연혁", value: 2 },
    { label: "채용정보", value: 3 },
    { label: "찾아오시는 길", value: 4 },
    { label: "윤리경영", value: 5 },
  ];

  // 현재 선택된 탭 상태
  const [activeTab, setActiveTab] = useState(0);

  return (
    <main className={styles.main}>
      {/* 상단 히어로 배너: 페이지 타이틀 + 서브 탭들 */}
      <HeroBanner
        title="회사소개"
        tabs={aboutTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 메인 콘텐츠 영역: 선택된 탭에 따른 섹션 표시 */}
      <div className={styles.content}>
        <AboutTabs activeTab={activeTab} />
      </div>
    </main>
  );
}
