/** Next.js 페이지: 마케팅(글로벌 네트워크 등). URL `/marketing` */
"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import HeroBanner, { BreadcrumbItem } from "../../components/HeroBanner";
import Breadcrumb from "../../components/Breadcrumb";
import MainTabs from "../../marketing/components/MainTabs";
import {
  MARKETING_TAB_VALUES,
  resolveMarketingTab,
} from "../../marketing/marketingTabs";
import marketingBanner from "../../../assets/marketing_banner.png";
import styles from "../../marketing/page.module.css";

function MarketingContent() {
  const searchParams = useSearchParams();
  const aboutTabs = [
    {
      label: "글로벌 네트워크",
      titleEn: "Global Network",
      value: MARKETING_TAB_VALUES.globalNetwork,
    },
    { label: "주요고객사", titleEn: "Key Customers", value: MARKETING_TAB_VALUES.customers },
  ];
  const activeTab = resolveMarketingTab(searchParams.get("tab"));

  const breadcrumb = useMemo<BreadcrumbItem[]>(() => {
    const baseItems: BreadcrumbItem[] = [
      { label: "홈", href: "/" },
      { label: "마케팅", href: "/marketing" },
    ];

    switch (activeTab) {
      case MARKETING_TAB_VALUES.globalNetwork:
        return [...baseItems, { label: "글로벌 네트워크" }];
      case MARKETING_TAB_VALUES.customers:
        return [...baseItems, { label: "주요고객사" }];
      default:
        return [...baseItems, { label: "글로벌 네트워크" }];
    }
  }, [activeTab]);

  return (
    <>
      <HeroBanner
        title="마케팅"
        titleEn="Marketing"
        backgroundImage={marketingBanner.src}
        tabs={aboutTabs}
        activeTab={activeTab}
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
