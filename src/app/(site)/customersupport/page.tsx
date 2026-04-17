"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import HeroBanner, { BreadcrumbItem } from "../../components/HeroBanner";
import Breadcrumb from "../../components/Breadcrumb";
import SupportTabs from "../../customersupport/components/SupportTabs";
import customerSupportBanner from "../../../assets/customersupport_banner.png";
import styles from "../../customersupport/page.module.css";

function CustomerSupportContent() {
  const searchParams = useSearchParams();
  const supportTabs = [
    { label: "제품문의", value: "inquiry" },
    { label: "FAQ", value: "faq" },
    { label: "다운로드", value: "download" },
    { label: "기술자료", value: "technical" },
  ];

  const breadcrumb = useMemo<BreadcrumbItem[]>(() => {
    const baseItems: BreadcrumbItem[] = [
      { label: "홈", href: "/" },
      { label: "고객지원", href: "/customersupport" },
    ];

    const tabParam = searchParams.get("tab") || "inquiry";

    switch (tabParam) {
      case "inquiry":
        return [...baseItems, { label: "제품문의" }];
      case "faq":
        return [...baseItems, { label: "FAQ" }];
      case "download":
        return [...baseItems, { label: "다운로드" }];
      case "technical":
        return [...baseItems, { label: "기술자료" }];
      default:
        return [...baseItems, { label: "제품문의" }];
    }
  }, [searchParams]);

  return (
    <>
      <HeroBanner
        title="고객지원"
        backgroundImage={customerSupportBanner.src}
        tabs={supportTabs}
        useUrlParams={true}
        urlParamKey="tab"
        basePath="/customersupport"
      />

      <div className={styles.breadcrumbArea}>
        <Breadcrumb items={breadcrumb} />
      </div>

      <div className={styles.content}>
        <Suspense fallback={<div>Loading...</div>}>
          <SupportTabs />
        </Suspense>
      </div>
    </>
  );
}

export default function CustomerSupport() {
  return (
    <main className={styles.main}>
      <Suspense fallback={<div>Loading...</div>}>
        <CustomerSupportContent />
      </Suspense>
    </main>
  );
}
