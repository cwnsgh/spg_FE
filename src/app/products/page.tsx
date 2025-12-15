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
import styles from "./page.module.css";

// HTML의 productData 구조에 맞춘 제품 데이터
const productData: Record<
  string,
  Array<{
    id: string;
    name: string;
    nameEn: string;
    image: string;
    detailUrl: string;
  }>
> = {
  "standard-ac": [
    {
      id: "product-1",
      name: "컴퍼넌트 컵형",
      nameEn: "Component Cup Type",
      image: "/images/products/prd_01.png",
      detailUrl: "#",
    },
    {
      id: "product-2",
      name: "유니트 컵형",
      nameEn: "Unit Cup Type",
      image: "/images/products/prd_02.png",
      detailUrl: "#",
    },
    {
      id: "product-3",
      name: "컴퍼넌트 실크햇형",
      nameEn: "Component Cup Type",
      image: "/images/products/prd_03.png",
      detailUrl: "#",
    },
    {
      id: "product-4",
      name: "간이유니트 실크햇형",
      nameEn: "Simple Unit Silk Hat Type",
      image: "/images/products/prd_04.png",
      detailUrl: "#",
    },
    {
      id: "product-5",
      name: "유니트 실크햇 중공형",
      nameEn: "Unit Silk Hat Hollow Shaft Type",
      image: "/images/products/prd_05.png",
      detailUrl: "#",
    },
    {
      id: "product-6",
      name: "유니크 실크햇 입력축형",
      nameEn: "Unit Silk Hat Input Shaft Type",
      image: "/images/products/prd_06.png",
      detailUrl: "#",
    },
    {
      id: "product-7",
      name: "제품 7",
      nameEn: "Product 7",
      image: "/images/products/prd_01.png",
      detailUrl: "#",
    },
    {
      id: "product-8",
      name: "제품 8",
      nameEn: "Product 8",
      image: "/images/products/prd_02.png",
      detailUrl: "#",
    },
    {
      id: "product-9",
      name: "제품 9",
      nameEn: "Product 9",
      image: "/images/products/prd_03.png",
      detailUrl: "#",
    },
    {
      id: "product-10",
      name: "제품 10",
      nameEn: "Product 10",
      image: "/images/products/prd_04.png",
      detailUrl: "#",
    },
    {
      id: "product-11",
      name: "제품 11",
      nameEn: "Product 11",
      image: "/images/products/prd_05.png",
      detailUrl: "#",
    },
    {
      id: "product-12",
      name: "제품 12",
      nameEn: "Product 12",
      image: "/images/products/prd_06.png",
      detailUrl: "#",
    },
  ],
  "industrial-ac": [
    {
      id: "product-9",
      name: "인더스트리얼 AC 1",
      nameEn: "Industrial AC 1",
      image: "/images/products/prd_03.png",
      detailUrl: "#",
    },
  ],
  "condenser-run": [
    {
      id: "product-10",
      name: "콘덴서 런 기어드 모터 1",
      nameEn: "Condenser Run Geared Motor 1",
      image: "/images/products/prd_04.png",
      detailUrl: "#",
    },
  ],
  "shaded-pole": [
    {
      id: "product-11",
      name: "셰이드 폴 기어드 모터 1",
      nameEn: "Shaded Pole Geared Motor 1",
      image: "/images/products/prd_05.png",
      detailUrl: "#",
    },
  ],
  "fan-ac": [
    {
      id: "product-12",
      name: "팬 AC 1",
      nameEn: "Fan AC 1",
      image: "/images/products/prd_06.png",
      detailUrl: "#",
    },
  ],
};

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

  // 선택된 서브 카테고리에 따라 제품 필터링
  const filteredProducts = useMemo(() => {
    return productData[activeSubCategory] || [];
  }, [activeSubCategory]);

  // 현재 서브 카테고리의 타이틀
  const currentTitle =
    subCategoryTitles[activeSubCategory] || subCategoryTitles["standard-ac"];

  // 현재 활성 탭에 따라 breadcrumb 생성
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const baseItems: BreadcrumbItem[] = [
      { label: "홈", href: "/" },
      { label: "제품소개", href: "/products" },
    ];

    const tabParam = searchParams.get("tab");
    const activeTab = tabParam ? parseInt(tabParam, 10) : 0;

    if (activeTab < productTabs.length) {
      return [...baseItems, { label: productTabs[activeTab].label }];
    }

    return [...baseItems, { label: currentTitle.korean }];
  }, [searchParams, currentTitle.korean]);

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
