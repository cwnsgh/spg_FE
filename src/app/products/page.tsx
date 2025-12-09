/**
 * 제품소개 페이지 (/products)
 *
 * 제품 목록을 보여주는 메인 페이지입니다.
 * 구조:
 * 1. HeroBanner: 페이지 상단 배너 + 제품 카테고리 탭 (회사소개와 동일한 방식)
 * 2. ProductSidebar: 왼쪽 사이드바 (KSH/KSR 탭, 접을 수 있는 섹션들)
 * 3. ProductGrid: 오른쪽 제품 그리드 (제품 카드들 + 페이지네이션)
 *
 * 상태 관리:
 * - useState로 현재 선택된 카테고리 관리
 * - 카테고리 변경 시 제품 필터링 (나중에 API 연동 시)
 */
"use client";

import { useState, useMemo, Suspense } from "react";
import HeroBanner from "../components/HeroBanner";
import ProductSidebar from "./components/ProductSidebar";
import ProductGrid from "./components/ProductGrid";
import productBanner from "../../assets/product_banner.png";
import styles from "./page.module.css";

// TODO: 실제 API에서 데이터를 가져오도록 변경 필요
// 임시 제품 데이터 (나중에 API 연동 시 제거)
// category 필드 추가 (나중에 API에서 받아올 데이터 구조)
const mockProducts = [
  {
    id: "1",
    koreanTitle: "컴파운드 컵형",
    englishTitle: "Compound Cup Type",
    category: "로봇감속기", // 카테고리 필드 추가
  },
  {
    id: "2",
    koreanTitle: "유닛 컵형",
    englishTitle: "Unit Cup Type",
    category: "로봇감속기",
  },
  {
    id: "3",
    koreanTitle: "정밀형 컵형",
    englishTitle: "Compound Cup Type",
    category: "로봇감속기",
  },
  {
    id: "4",
    koreanTitle: "간이유닛 실크형",
    englishTitle: "Simple Unit Silk Hat Type",
    category: "유성감속기",
  },
  {
    id: "5",
    koreanTitle: "유닛 실크 중공형",
    englishTitle: "Unit Silk Hollow Shaft Type",
    category: "유성감속기",
  },
  {
    id: "6",
    koreanTitle: "유닛 실크 입력축형",
    englishTitle: "Unit Silk Input Shaft Type",
    category: "BLDC/DC모터",
  },
];

export default function Products() {
  // 제품 카테고리 목록
  const categories = [
    "로봇감속기",
    "유성감속기",
    "BLDC/DC모터",
    "DC기어드모터",
    "유성감속모터",
    "기어드모터",
    "브레이크",
  ];

  // 현재 선택된 카테고리 상태 (기본값: 첫 번째 카테고리)
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  // 선택된 카테고리에 따라 제품 필터링
  // TODO: 나중에 API 연동 시 이 부분을 API 호출로 변경
  const filteredProducts = useMemo(() => {
    // 현재는 mockProducts에서 필터링
    // 나중에 API 연동 시: activeCategory에 따라 API 호출
    return mockProducts.filter(
      (product) => product.category === activeCategory
    );
  }, [activeCategory]);

  // 카테고리를 탭 형식으로 변환
  const categoryTabs = categories.map((category) => ({
    label: category,
    value: category,
  }));

  // 탭 변경 핸들러 (타입 호환성을 위해)
  const handleCategoryChange = (tab: string | number) => {
    setActiveCategory(String(tab));
  };

  return (
    <main className={styles.main}>
      {/* 상단 히어로 배너: 페이지 타이틀 + 제품 카테고리 탭 */}
      {/* useSearchParams 사용으로 인해 Suspense 필요 */}
      <Suspense fallback={<div>Loading...</div>}>
        <HeroBanner
          title="제품소개"
          backgroundImage={productBanner.src}
          tabs={categoryTabs}
          activeTab={activeCategory}
          onTabChange={handleCategoryChange}
        />
      </Suspense>

      {/* 메인 콘텐츠 영역: 사이드바 + 제품 그리드 */}
      <div className={styles.content}>
        {/* 왼쪽: 제품 카테고리 사이드바 (KSH/KSR 탭, 접을 수 있는 섹션) */}
        <ProductSidebar />

        {/* 오른쪽: 제품 그리드 (필터링된 제품 카드들 + 페이지네이션) */}
        <ProductGrid products={filteredProducts} />
      </div>
    </main>
  );
}
