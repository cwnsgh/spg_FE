"use client";

/**
 * IR 허브 탭(공시·공고·콘텐츠·행사·전자공고). 사용처: `Irinformation/page.tsx`(`/Irinformation`).
 */
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Disclosure from "./sections/Disclosure";
import IRAnnouncement from "./sections/IRAnnouncement";
import IRContent from "./sections/IRContent";
import IREvent from "./sections/IREvent";
import IRLibrary from "./sections/IRLibrary";
import styles from "./IRTabs.module.css";

export default function IRTabs() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(parseInt(tabParam, 10));
    }
  }, [searchParams]);

  return (
    <div className={styles.container}>
      {activeTab === 0 && <Disclosure />}
      {activeTab === 1 && <IRAnnouncement />}
      {activeTab === 2 && <IRContent />}
      {activeTab === 3 && <IREvent />}
      {activeTab === 4 && <IRLibrary />}
    </div>
  );
}

