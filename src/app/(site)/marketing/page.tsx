"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import HeroBanner, { BreadcrumbItem } from "../../components/HeroBanner";
import Breadcrumb from "../../components/Breadcrumb";
import MainTabs from "../../marketing/components/MainTabs";
import marketingBanner from "../../../assets/marketing_banner.png";
import styles from "../../marketing/page.module.css";

function MarketingContent() {
  const searchParams = useSearchParams();
  const aboutTabs = [
    { label: "글로벌 네트워크", value: 0 },
    { label: "주요고객사", value: 1 },
  ];

  const breadcrumb = useMemo<BreadcrumbItem[]>(() => {
    const baseItems: BreadcrumbItem[] = [
      { label: "홈", href: "/" },
      { label: "마케팅", href: "/marketing" },
    ];

    const tabParam = searchParams.get("tab");
    const activeTab = tabParam ? parseInt(tabParam, 10) : 0;

    switch (activeTab) {
      case 0:
        return [...baseItems, { label: "글로벌 네트워크" }];
      case 1:
        return [...baseItems, { label: "주요고객사" }];
      default:
        return [...baseItems, { label: "글로벌 네트워크" }];
    }
  }, [searchParams]);

  return (
    <>
      <HeroBanner
        title="마케팅"
        backgroundImage={marketingBanner.src}
        tabs={aboutTabs}
        useUrlParams={true}
        urlParamKey="tab"
        basePath="/marketing"
      />

      <div className={styles.breadcrumbArea}>
        <Breadcrumb items={breadcrumb} />
      </div>

      <div className={styles.content}>
        <Suspense fallback={<div>Loading...</div>}>
          <MainTabs />
        </Suspense>
      </div>
    </>
  );
}

export default function Marketing() {
  return (
    <main className={styles.main}>
      <Suspense fallback={<div>Loading...</div>}>
        <MarketingContent />
      </Suspense>
    </main>
  );
}
