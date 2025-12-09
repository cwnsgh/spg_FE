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

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./HeroBanner.module.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

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

export default function HeroBanner({
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
}: HeroBannerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL 파라미터 사용 시 내부 상태 관리
  const [internalActiveTab, setInternalActiveTab] = useState<string | number>(
    () => {
      if (useUrlParams && searchParams) {
        return searchParams.get(urlParamKey) || tabs?.[0]?.value || "";
      }
      return tabs?.[0]?.value || "";
    }
  );

  // 외부에서 activeTab을 제어하는지, 내부에서 제어하는지 결정
  const activeTab =
    externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;

  // URL 파라미터 동기화
  useEffect(() => {
    if (useUrlParams && searchParams && tabs) {
      const tab = searchParams.get(urlParamKey);
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
  }, [searchParams, useUrlParams, urlParamKey, tabs]);

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

  return (
    <div className={styles.heroBanner}>
      {/* 상단 영역: 타이틀과 탭 (200px 높이, 흰색 배경) */}
      <div className={styles.heroContent}>
        <div className={styles.heroContentInner}>
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

          {/* 브레드크럼 (마케팅 페이지용) */}
          {breadcrumb && breadcrumb.length > 0 && (
            <div className={styles.breadcrumb}>
              {breadcrumb.map((item, index) => (
                <span key={index}>
                  {item.href ? (
                    <Link href={item.href}>{item.label}</Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                  {index < breadcrumb.length - 1 && <span> &gt; </span>}
                </span>
              ))}
            </div>
          )}

          {/* 서브 탭 (고객지원, 회사소개 페이지용) */}
          {tabs && tabs.length > 0 && (
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
                    className={`${styles.tab} ${isActive ? styles.active : ""}`}
                    onClick={() => handleTabChange(tabValue)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 하단 영역: 배경 이미지 (500px 높이) */}
      {backgroundImage && (
        <div
          className={styles.heroImage}
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />
      )}
    </div>
  );
}
