/**
 * AboutTabs 컴포넌트
 * 
 * 회사소개 페이지의 탭 콘텐츠를 관리하는 컴포넌트입니다.
 * 기능:
 * - HeroBanner에서 선택된 탭에 따라 해당 섹션 표시
 * 
 * 탭 인덱스와 섹션 매핑:
 * - 0: 연혁 (History)
 * - 1: 경영이념 및 비전 (Vision)
 * - 2: 회사연혁 (CompanyHistory)
 * - 3: 채용정보 (Recruitment)
 * - 4: 찾아오시는 길 (Directions)
 * - 5: 윤리경영 (Ethics)
 * - default: 인사말 (Greeting)
 * 
 * 상태 관리:
 * - useState로 현재 선택된 탭 인덱스 관리
 * - switch 문으로 해당 섹션 컴포넌트만 렌더링
 */
"use client";

import { useState } from "react";
import Greeting from "./sections/Greeting";
import History from "./sections/History";
import Vision from "./sections/Vision";
import CompanyHistory from "./sections/CompanyHistory";
import Recruitment from "./sections/Recruitment";
import Directions from "./sections/Directions";
import Ethics from "./sections/Ethics";
import styles from "./AboutTabs.module.css";

interface AboutTabsProps {
  activeTab?: number;  // 외부에서 초기 탭 설정 가능 (선택적)
}

export default function AboutTabs({ activeTab = 0 }: AboutTabsProps) {
  // 탭 인덱스에 따라 해당 섹션 컴포넌트 반환
  // activeTab은 HeroBanner에서 관리되므로 props로 받아서 사용
  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <History />;  // 연혁
      case 1:
        return <Vision />;  // 경영이념 및 비전
      case 2:
        return <CompanyHistory />;  // 회사연혁
      case 3:
        return <Recruitment />;  // 채용정보
      case 4:
        return <Directions />;  // 찾아오시는 길
      case 5:
        return <Ethics />;  // 윤리경영
      default:
        return <Greeting />;  // 인사말 (기본값)
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>{renderContent()}</div>
    </div>
  );
}

