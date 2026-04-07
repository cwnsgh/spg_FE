/**
 * HeroBanner 컴포넌트
 *
 * 모든 페이지에서 사용하는 공통 히어로 배너입니다.
 * Props로 페이지별 차이점을 전달받아 렌더링합니다.
 *
 * 지원하는 기능:
 * - title: 페이지 제목 (필수)
 * - categoryLinks: 제품 카테고리 링크 (제품소개 페이지용)
 * - breadcrumb: 브레드크럼 (마케팅 페이지용)
 * - tabs: 서브 탭 (고객지원, 회사소개 페이지용)
 * - activeTab: 현재 활성 탭
 * - onTabChange: 탭 변경 핸들러
 */
"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  useSearchParams,
  useRouter,
  type ReadonlyURLSearchParams,
} from "next/navigation";
import Breadcrumb, { BreadcrumbItem } from "./Breadcrumb";
import styles from "./HeroBanner.module.css";

// BreadcrumbItem 타입은 Breadcrumb 컴포넌트에서 export하는 것을 사용
export type { BreadcrumbItem };

export interface TabItem {
  label: string;
  value: string | number;
}

interface HeroBannerProps {
  title: string; // 페이지 제목 (필수)
  backgroundImage?: string; // 배경 이미지 경로 (선택적, 없으면 기본 그라데이션)
  categoryLinks?: string[]; // 제품 카테고리 링크 (제품소개 페이지용)
  breadcrumb?: BreadcrumbItem[]; // 브레드크럼 (마케팅 페이지용)
  tabs?: TabItem[]; // 서브 탭 (고객지원, 회사소개 페이지용)
  activeTab?: string | number; // 현재 활성 탭
  onTabChange?: (tab: string | number) => void; // 탭 변경 핸들러
  useUrlParams?: boolean; // URL 쿼리 파라미터 사용 여부 (고객지원 페이지용)
  urlParamKey?: string; // URL 쿼리 파라미터 키 (기본값: "tab")
  basePath?: string; // 탭 변경 시 이동할 경로 (useUrlParams가 true일 때 필요)
}

/** `useSearchParams` 없이 렌더 (정적 export·프리렌더용). URL 동기화는 `useUrlParams`일 때만 내부 래퍼에서 처리 */
function HeroBannerBody({
  title,
  backgroundImage,
  categoryLinks,
  breadcrumb,
  tabs,
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
  useUrlParams = false,
  urlParamKey = "tab",
  basePath,
  urlParams,
}: HeroBannerProps & {
  urlParams: ReadonlyURLSearchParams | null;
}) {
  const router = useRouter();
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [isTabsOverflowing, setIsTabsOverflowing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // URL 파라미터 사용 시 내부 상태 관리
  const [internalActiveTab, setInternalActiveTab] = useState<string | number>(
    () => {
      if (useUrlParams && urlParams) {
        return urlParams.get(urlParamKey) || tabs?.[0]?.value || "";
      }
      return tabs?.[0]?.value || "";
    }
  );

  // 외부에서 activeTab을 제어하는지, 내부에서 제어하는지 결정
  const activeTab =
    externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;

  const updateScrollState = useCallback(() => {
    const container = tabsScrollRef.current;

    if (!container) return;

    const hasOverflow = container.scrollWidth > container.clientWidth + 1;
    const nextCanScrollLeft = container.scrollLeft > 2;
    const nextCanScrollRight =
      container.scrollLeft + container.clientWidth < container.scrollWidth - 2;

    setIsTabsOverflowing(hasOverflow);
    setCanScrollLeft(hasOverflow && nextCanScrollLeft);
    setCanScrollRight(hasOverflow && nextCanScrollRight);
  }, []);

  // URL 파라미터 동기화
  useEffect(() => {
    if (useUrlParams && urlParams && tabs) {
      const tab = urlParams.get(urlParamKey);
      if (tab) {
        const foundTab = tabs.find((t) => String(t.value) === tab);
        if (foundTab) {
          setInternalActiveTab(foundTab.value);
        }
      } else if (tabs.length > 0) {
        // URL에 tab 파라미터가 없으면 첫 번째 탭을 기본값으로 설정
        setInternalActiveTab(tabs[0].value);
      }
    }
  }, [urlParams, useUrlParams, urlParamKey, tabs]);

  useEffect(() => {
    updateScrollState();

    const container = tabsScrollRef.current;
    if (!container) return;

    const handleResize = () => updateScrollState();

    window.addEventListener("resize", handleResize);
    container.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("scroll", updateScrollState);
    };
  }, [tabs, updateScrollState]);

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });

    const timer = window.setTimeout(() => {
      updateScrollState();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [activeTab, updateScrollState]);

  // 탭 변경 핸들러
  const handleTabChange = (tab: string | number) => {
    if (useUrlParams && basePath) {
      // URL 파라미터 사용 시 URL 업데이트
      router.push(`${basePath}?${urlParamKey}=${tab}`, { scroll: false });
      setInternalActiveTab(tab);
    } else if (externalOnTabChange) {
      // 외부 핸들러가 있으면 사용
      externalOnTabChange(tab);
    } else {
      // 내부 상태만 업데이트
      setInternalActiveTab(tab);
    }
  };

  const scrollTabs = (direction: "left" | "right") => {
    const container = tabsScrollRef.current;

    if (!container) return;

    const scrollAmount = Math.max(container.clientWidth * 0.75, 240);
    const nextLeft =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: nextLeft,
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.heroBanner}>
      {/* 상단 영역: 타이틀과 탭 (200px 높이, 흰색 배경) */}
      <div className={styles.heroContent}>
        <div className={styles.heroContentInner}>
          {/* 브레드크럼 (제품 상세 페이지용) */}
          {breadcrumb && breadcrumb.length > 0 && (
            <div className={styles.breadcrumb}>
              <Breadcrumb items={breadcrumb} />
            </div>
          )}

          <h1 className={styles.title}>{title}</h1>

          {/* 제품 카테고리 링크 (제품소개 페이지용) */}
          {categoryLinks && categoryLinks.length > 0 && (
            <div className={styles.categoryLinks}>
              {categoryLinks.map((category, index) => (
                <Link key={index} href={`/products?category=${category}`}>
                  {category}
                </Link>
              ))}
            </div>
          )}

          {/* 서브 탭 (고객지원, 회사소개 페이지용) */}
          {tabs && tabs.length > 0 && (
            <div className={styles.tabsWrap}>
              {isTabsOverflowing && (
                <button
                  type="button"
                  className={`${styles.tabScrollButton} ${styles.left} ${
                    !canScrollLeft ? styles.disabled : ""
                  }`}
                  onClick={() => scrollTabs("left")}
                  aria-label="이전 탭 보기"
                  disabled={!canScrollLeft}
                />
              )}
              <div className={styles.tabsScroll} ref={tabsScrollRef}>
                <div className={styles.tabs}>
                {tabs.map((tab, index) => {
                  const tabValue = tab.value;
                  const isActive =
                    typeof activeTab === "number"
                      ? activeTab === tabValue
                      : String(activeTab) === String(tabValue);

                  return (
                    <button
                      key={index}
                      ref={isActive ? activeTabRef : null}
                      className={`${styles.tab} ${isActive ? styles.active : ""}`}
                      onClick={() => handleTabChange(tabValue)}
                    >
                      {tab.label}
                    </button>
                  );
                })}
                </div>
              </div>
              {isTabsOverflowing && (
                <button
                  type="button"
                  className={`${styles.tabScrollButton} ${styles.right} ${
                    !canScrollRight ? styles.disabled : ""
                  }`}
                  onClick={() => scrollTabs("right")}
                  aria-label="다음 탭 보기"
                  disabled={!canScrollRight}
                />
              )}
              </div>
          )}
        </div>
      </div>

      {/* 하단 영역: 배경 이미지 (500px 높이) */}
      {backgroundImage && (
        <div className={styles.heroImage}>
          <Image
            src={backgroundImage}
            alt="Hero banner"
            fill
            priority
            className={styles.heroImageContent}
            style={{ objectFit: "cover" }}
          />
        </div>
      )}
    </div>
  );
}

function HeroBannerWithUrlParams(props: HeroBannerProps) {
  const searchParams = useSearchParams();
  return <HeroBannerBody {...props} urlParams={searchParams} />;
}

export default function HeroBanner(props: HeroBannerProps) {
  if (props.useUrlParams) {
    return (
      <Suspense
        fallback={
          <div className={styles.heroBanner} aria-hidden>
            <div className={styles.heroContent} />
          </div>
        }
      >
        <HeroBannerWithUrlParams {...props} />
      </Suspense>
    );
  }

  return <HeroBannerBody {...props} urlParams={null} />;
}
