/**
 * 마케팅 페이지 (/marketing)
 *
 * 마케팅 관련 정보를 보여주는 페이지입니다.
 * 구조:
 * 1. HeroBanner: 페이지 상단 배너 + 브레드크럼
 * 2. MainTabs: 메인 탭 컴포넌트
 *    - "글로벌 네트워크" 탭: 해외/국내 사업장, 지도, 사업장 리스트
 *    - "주요고객사" 탭: 주요 고객사 정보
 *
 * 상태 관리:
 * - useState를 사용하여 같은 페이지 내에서 탭 전환
 * - 페이지 리로드 없이 빠른 전환 가능
 */
import { Suspense } from "react";
import HeroBanner from "../components/HeroBanner";
import MainTabs from "./components/MainTabs";
import marketingBanner from "../../assets/marketing_banner.png";
import styles from "./page.module.css";

export default function Marketing() {
  // 브레드크럼 데이터
  return (
    <main className={styles.main}>
      {/* 상단 히어로 배너: 페이지 타이틀 + 브레드크럼 */}
      {/* useSearchParams 사용으로 인해 Suspense 필요 */}
      <Suspense fallback={<div>Loading...</div>}>
        <HeroBanner title="마케팅" backgroundImage={marketingBanner.src} />
      </Suspense>

      {/* 메인 콘텐츠 영역: 탭 네비게이션 + 콘텐츠 */}
      <div className={styles.content}>
        {/* 메인 탭 컴포넌트 (글로벌 네트워크 / 주요고객사) */}
        <MainTabs />
      </div>
    </main>
  );
}
