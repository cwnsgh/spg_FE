/**
 * 제품소개 페이지 (/products)
 *
 * HTML 구조에 맞춘 제품 목록 페이지입니다.
 * 구조:
 * 1. HeroBanner: 페이지 상단 배너 + 탭
 * 2. section.products: 제품 콘텐츠 영역
 *    - ProductNavigation: 왼쪽 네비게이션 (서브 카테고리 + 공통 기능)
 *    - ProductGrid: 오른쪽 제품 그리드 (3열 그리드 + 페이지네이션)
 */
"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HeroBanner, { BreadcrumbItem } from "../components/HeroBanner";
import Breadcrumb from "../components/Breadcrumb";
import ProductNavigation from "./components/ProductNavigation";
import ProductGrid from "./components/ProductGrid";
import productBanner from "../../assets/product_banner.png";
import { productData } from "./data/productData";
import styles from "./page.module.css";

// 서브 카테고리별 타이틀 매핑
const subCategoryTitles: Record<string, { korean: string; english: string }> = {
  "standard-ac": { korean: "표준AC 기어드모터", english: "STANDARD AC MOTOR" },
  "industrial-ac": {
    korean: "산업용AC 기어드모터",
    english: "INDUSTRIAL AC MOTOR",
  },
  "condenser-run": {
    korean: "콘덴서 런 기어드모터",
    english: "CONDENSER RUN GEARED MOTOR",
  },
  "shaded-pole": {
    korean: "셰이드 폴 기어드모터",
    english: "SHADED POLE GEARED MOTOR",
  },
  "fan-ac": { korean: "팬 AC 모터", english: "FAN AC MOTOR" },
};

// 메인 탭별 타이틀 매핑
const mainTabTitles: Record<number, { korean: string; english: string }> = {
  0: { korean: "로봇감속기", english: "ROBOT REDUCER" },
  1: { korean: "표준AC 기어드모터", english: "STANDARD AC GEARED MOTOR" },
  2: { korean: "표준BLDC 기어드모터", english: "STANDARD BLDC GEARED MOTOR" },
  3: { korean: "DC기어드모터", english: "DC GEARED MOTOR" },
  4: { korean: "동력용모터", english: "POWER MOTOR" },
  5: { korean: "유성감속기", english: "PLANETARY REDUCER" },
  6: { korean: "기타", english: "ETC" },
  7: { korean: "보안경계", english: "SECURITY BOUNDARY" },
  8: { korean: "음식물처리기", english: "FOOD WASTE DISPOSER" },
};

function ProductsContent() {
  const searchParams = useSearchParams();
  // 제품소개 메인 탭 목록
  const productTabs = [
    { label: "로봇감속기", value: 0 },
    { label: "표준AC 기어드모터", value: 1 },
    { label: "표준BLDC 기어드모터", value: 2 },
    { label: "DC기어드모터", value: 3 },
    { label: "동력용모터", value: 4 },
    { label: "유성감속기", value: 5 },
    { label: "기타", value: 6 },
    { label: "보안경계", value: 7 },
    { label: "음식물처리기", value: 8 },
  ];

  // 현재 선택된 서브 카테고리 (기본값: standard-ac)
  const [activeSubCategory, setActiveSubCategory] = useState("standard-ac");

  // 현재 활성 메인 탭
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam ? parseInt(tabParam, 10) : 0;

  // 선택된 서브 카테고리에 따라 제품 필터링
  const filteredProducts = useMemo(() => {
    return productData[activeSubCategory] || [];
  }, [activeSubCategory]);

  // 현재 메인 탭의 타이틀
  const currentTitle = mainTabTitles[activeTab] || mainTabTitles[0];

  // 현재 활성 탭에 따라 breadcrumb 생성
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const baseItems: BreadcrumbItem[] = [
      { label: "홈", href: "/" },
      { label: "제품소개", href: "/products" },
    ];

    if (activeTab < productTabs.length) {
      return [...baseItems, { label: productTabs[activeTab].label }];
    }

    return [...baseItems, { label: currentTitle.korean }];
  }, [searchParams, activeTab, currentTitle.korean, productTabs]);

  return (
    <>
      {/* 상단 히어로 배너: 페이지 타이틀 + 탭 */}
      <HeroBanner
        title="제품소개"
        backgroundImage={productBanner.src}
        tabs={productTabs}
        useUrlParams={true}
        urlParamKey="tab"
        basePath="/products"
      />

      {/* Breadcrumb 영역 */}
      <div className={styles.breadcrumbArea}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* 제품 콘텐츠 영역 (HTML의 section.products와 동일) */}
      <section className={styles.products}>
        {/* 제목 영역 */}
        <div className={styles.titleArea}>
          <h1>
            {currentTitle.korean}
            <span className={styles.egFont}>{currentTitle.english}</span>
          </h1>
        </div>
        <div className={styles.productContent}>
          {/* 왼쪽: 네비게이션 (서브 카테고리 + 공통 기능) */}
          <ProductNavigation
            activeSubCategory={activeSubCategory}
            onSubCategoryChange={setActiveSubCategory}
          />

          {/* 오른쪽: 제품 그리드 */}
          <ProductGrid products={filteredProducts} />
        </div>
      </section>
    </>
  );
}

export default function Products() {
  return (
    <main className={styles.main}>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductsContent />
      </Suspense>
    </main>
  );
}
