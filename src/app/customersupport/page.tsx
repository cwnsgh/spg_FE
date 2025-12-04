/**
 * 고객지원 페이지 (/customersupport)
 *
 * 고객지원 관련 정보를 보여주는 페이지입니다.
 * 구조:
 * 1. HeroBanner: 페이지 상단 배너 + 서브 탭 (제품문의, FAQ, 다운로드)
 * 2. SupportTabs: 선택된 탭에 따른 콘텐츠 표시
 *    - "제품문의" 탭: 문의 유형 탭, 문의 테이블, 필터/검색
 *    - "FAQ" 탭: 자주 묻는 질문
 *    - "다운로드" 탭: 자료 다운로드
 *
 * URL 쿼리 파라미터 지원:
 * - /customersupport?tab=inquiry → 제품문의 탭으로 이동
 * - /customersupport?tab=faq → FAQ 탭으로 이동
 * - /customersupport?tab=download → 다운로드 탭으로 이동
 *
 * Suspense 사용 이유:
 * - HeroBanner에서 useSearchParams()를 사용하므로 Suspense로 감싸야 함
 */
import { Suspense } from "react";
import HeroBanner from "../components/HeroBanner";
import SupportTabs from "./components/SupportTabs";
import styles from "./page.module.css";

export default function CustomerSupport() {
  // 고객지원 서브 탭 목록
  const supportTabs = [
    { label: "제품문의", value: "inquiry" },
    { label: "FAQ", value: "faq" },
    { label: "다운로드", value: "download" },
  ];

  return (
    <main className={styles.main}>
      {/* 상단 히어로 배너: 페이지 타이틀 + 서브 탭 (제품문의, FAQ, 다운로드) */}
      {/* useSearchParams 사용으로 인해 Suspense 필요 */}
      <Suspense fallback={<div>Loading...</div>}>
        <HeroBanner
          title="고객지원"
          tabs={supportTabs}
          useUrlParams={true}
          urlParamKey="tab"
          basePath="/customersupport"
        />
      </Suspense>

      {/* 메인 콘텐츠 영역: 선택된 탭에 따른 콘텐츠 표시 */}
      <div className={styles.content}>
        <SupportTabs />
      </div>
    </main>
  );
}
