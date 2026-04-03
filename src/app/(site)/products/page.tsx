"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import HeroBanner, { BreadcrumbItem } from "../../components/HeroBanner";
import Breadcrumb from "../../components/Breadcrumb";
import ProductNavigation from "../../products/components/ProductNavigation";
import ProductGrid from "../../products/components/ProductGrid";
import productBanner from "../../../assets/product_banner.png";
import {
  getDefaultSubCategoryId,
  getMainCategoryByTab,
  productTabs,
} from "../../products/data/productData";
import styles from "../../products/page.module.css";

function ProductsContent() {
  const searchParams = useSearchParams();
  const [searchKeyword, setSearchKeyword] = useState("");
  const tabParam = searchParams.get("tab");
  const parsedTab = tabParam ? parseInt(tabParam, 10) : 0;
  const activeTab = Number.isNaN(parsedTab) ? 0 : parsedTab;
  const currentCategory = getMainCategoryByTab(activeTab) ?? getMainCategoryByTab(0)!;
  const [activeSubCategory, setActiveSubCategory] = useState(() =>
    getDefaultSubCategoryId(activeTab)
  );

  useEffect(() => {
    const subCategoryExists = currentCategory.subCategories.some(
      (subCategory) => subCategory.id === activeSubCategory
    );

    if (!subCategoryExists) {
      setActiveSubCategory(currentCategory.subCategories[0]?.id ?? "");
    }
  }, [activeSubCategory, currentCategory]);

  const handleSearch = () => {
    console.log("검색어:", searchKeyword);
  };

  const currentSubCategory =
    currentCategory.subCategories.find(
      (subCategory) => subCategory.id === activeSubCategory
    ) ?? currentCategory.subCategories[0];

  const filteredProducts = useMemo(() => {
    let products = currentSubCategory?.products ?? [];

    if (searchKeyword.trim()) {
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          product.nameEn.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    return products;
  }, [currentSubCategory, searchKeyword]);

  const currentTitle = currentCategory.title;

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const baseItems: BreadcrumbItem[] = [
      { label: "홈", href: "/" },
      { label: "제품소개", href: "/products" },
    ];

    return [...baseItems, { label: currentCategory.label }];
  }, [currentCategory.label]);

  return (
    <>
      <HeroBanner
        title="제품소개"
        backgroundImage={productBanner.src}
        tabs={productTabs}
        useUrlParams={true}
        urlParamKey="tab"
        basePath="/products"
      />

      <div className={styles.breadcrumbArea}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <section className={styles.products}>
        <div className={styles.titleArea}>
          <h1>
            {currentTitle.korean}
            <span className={styles.egFont}>{currentTitle.english}</span>
          </h1>
        </div>

        <div className={styles.searchArea}>
          <div className={styles.searchInputWrap}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="검색어를 입력해 주세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <button
              className={styles.searchBtn}
              type="button"
              aria-label="검색"
              onClick={handleSearch}
            />
          </div>
        </div>
        <div className={styles.productContent}>
          <ProductNavigation
            activeSubCategory={activeSubCategory}
            onSubCategoryChange={setActiveSubCategory}
            subCategories={currentCategory.subCategories}
          />

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
