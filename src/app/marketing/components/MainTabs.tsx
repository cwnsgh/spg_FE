"use client";

import { useSearchParams } from "next/navigation";
import styles from "./MainTabs.module.css";
import GlobalNetwork from "./GlobalNetwork/GlobalNetwork";
import Customers from "./Customers/Customers";

export default function MainTabs() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "global-network";

  // 현재 탭에 따라 해당 텍스트만 표시
  const isGlobalNetwork = currentTab === "global-network";
  const isCustomers = currentTab === "customers";

  return (
    <div className={styles.container}>
      {/* 탭 텍스트 링크들 - 조건부 렌더링 */}
      <div className={styles.tabs}>
        {isGlobalNetwork && (
          <span className={`${styles.tab} ${styles.active}`}>
            글로벌 네트워크
          </span>
        )}
        {isCustomers && (
          <span className={`${styles.tab} ${styles.active}`}>주요고객사</span>
        )}
      </div>

      {/* 선택된 탭에 따른 콘텐츠 표시 */}
      <div className={styles.content}>
        {isGlobalNetwork && <GlobalNetwork />}
        {isCustomers && <Customers />}
      </div>
    </div>
  );
}
