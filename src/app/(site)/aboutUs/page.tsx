"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import HeroBanner, { BreadcrumbItem } from "../../components/HeroBanner";
import Breadcrumb from "../../components/Breadcrumb";
import AboutTabs from "../../aboutUs/components/AboutTabs";
import aboutUsBanner from "../../../assets/aboutus_banner.png";
import styles from "../../aboutUs/page.module.css";

const aboutTabs = [
  { label: "인사말", titleEn: "Greetings", value: 0 },
  { label: "경영이념 및 비전", titleEn: "Vision", value: 1 },
  { label: "회사연혁", titleEn: "History", value: 2 },
  { label: "채용정보", titleEn: "Recruitment", value: 3 },
  { label: "찾아오시는 길", titleEn: "Directions", value: 4 },
  { label: "윤리규정", titleEn: "Code of Ethics", value: 5 },
];

function AboutUsContent() {
  const searchParams = useSearchParams();

  const breadcrumb = useMemo<BreadcrumbItem[]>(() => {
    const baseItems: BreadcrumbItem[] = [
      { label: "홈", href: "/" },
      { label: "회사소개", href: "/aboutUs" },
    ];

    const tabParam = searchParams.get("tab");
    const activeTab = tabParam ? parseInt(tabParam, 10) : 0;

    if (activeTab < aboutTabs.length) {
      return [...baseItems, { label: aboutTabs[activeTab].label }];
    }

    return baseItems;
  }, [searchParams]);

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <HeroBanner
          title="회사소개"
          titleEn="About Us"
          backgroundImage={aboutUsBanner.src}
          tabs={aboutTabs}
          useUrlParams={true}
          urlParamKey="tab"
          basePath="/aboutUs"
        />
      </Suspense>

      <div className={styles.content}>
        <div className={styles.breadcrumbArea}>
          <Breadcrumb items={breadcrumb} />
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <AboutTabs />
        </Suspense>
      </div>
    </>
  );
}

export default function AboutUs() {
  return (
    <main className={styles.main}>
      <Suspense fallback={<div>Loading...</div>}>
        <AboutUsContent />
      </Suspense>
    </main>
  );
}
