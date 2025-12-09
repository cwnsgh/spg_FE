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
 * URL 쿼리 파라미터 지원:
 * - /aboutUs?tab=0 → 인사말 탭으로 이동
 * - /aboutUs?tab=1 → 경영이념 및 비전 탭으로 이동
 * - /aboutUs?tab=2 → 회사연혁 탭으로 이동
 * - /aboutUs?tab=3 → 채용정보 탭으로 이동
 * - /aboutUs?tab=4 → 찾아오시는 길 탭으로 이동
 * - /aboutUs?tab=5 → 윤리경영 탭으로 이동
 *
 * Suspense 사용 이유:
 * - HeroBanner에서 useSearchParams()를 사용하므로 Suspense로 감싸야 함
 */
import { Suspense } from "react";
import HeroBanner from "../components/HeroBanner";
import AboutTabs from "./components/AboutTabs";
import aboutUsBanner from "../../assets/aboutus_banner.png";
import styles from "./page.module.css";

export default function AboutUs() {
  // 회사소개 서브 탭 목록
  const aboutTabs = [
    { label: "인사말", value: 0 },
    { label: "경영이념 및 비전", value: 1 },
    { label: "회사연혁", value: 2 },
    { label: "채용정보", value: 3 },
    { label: "찾아오시는 길", value: 4 },
    { label: "윤리경영", value: 5 },
  ];

  return (
    <main className={styles.main}>
      {/* 상단 히어로 배너: 페이지 타이틀 + 서브 탭들 */}
      {/* useSearchParams 사용으로 인해 Suspense 필요 */}
      <Suspense fallback={<div>Loading...</div>}>
        <HeroBanner
          title="회사소개"
          backgroundImage={aboutUsBanner.src}
          tabs={aboutTabs}
          useUrlParams={true}
          urlParamKey="tab"
          basePath="/aboutUs"
        />
      </Suspense>

      {/* 메인 콘텐츠 영역: 선택된 탭에 따른 섹션 표시 */}
      <div className={styles.content}>
        <Suspense fallback={<div>Loading...</div>}>
          <AboutTabs />
        </Suspense>
      </div>
    </main>
  );
}
