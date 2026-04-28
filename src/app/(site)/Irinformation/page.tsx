"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import HeroBanner, {
  BreadcrumbItem,
  type TabItem,
} from "../../components/HeroBanner";
import Breadcrumb from "../../components/Breadcrumb";
import IRTabs from "../../Irinformation/components/IRTabs";
import styles from "../../Irinformation/page.module.css";
import aboutUsBanner from "../../../assets/aboutus_banner.png";

const IR_INFORMATION_TABS: TabItem[] = [
  { label: "공시정보", titleEn: "Disclosure Info", value: 0 },
  { label: "IR공고", titleEn: "IR Notice", value: 1 },
  { label: "IR콘텐츠", titleEn: "IR Contents", value: 2 },
  { label: "IR행사", titleEn: "IR Events", value: 3 },
  { label: "IR 자료실", titleEn: "IR Library", value: 4 },
];

function IRInformationContent() {
  const searchParams = useSearchParams();

  const breadcrumb = useMemo<BreadcrumbItem[]>(() => {
    const baseItems: BreadcrumbItem[] = [
      { label: "홈", href: "/" },
      { label: "IR정보", href: "/Irinformation" },
    ];

    const tabParam = searchParams.get("tab");
    const activeTab = tabParam ? parseInt(tabParam, 10) : 0;

    if (activeTab < IR_INFORMATION_TABS.length) {
      return [...baseItems, { label: IR_INFORMATION_TABS[activeTab].label }];
    }

    return baseItems;
  }, [searchParams]);

  return (
    <>
      <HeroBanner
        title="IR정보"
        titleEn="IR Information"
        tabs={IR_INFORMATION_TABS}
        useUrlParams={true}
        backgroundImage={aboutUsBanner.src}
        urlParamKey="tab"
        basePath="/Irinformation"
      />

      <div className={styles.content}>
        <div className={styles.breadcrumbArea}>
          <Breadcrumb items={breadcrumb} />
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <IRTabs />
        </Suspense>
      </div>
    </>
  );
}

export default function IRInformation() {
  return (
    <main className={styles.main}>
      <Suspense fallback={<div>Loading...</div>}>
        <IRInformationContent />
      </Suspense>
    </main>
  );
}
