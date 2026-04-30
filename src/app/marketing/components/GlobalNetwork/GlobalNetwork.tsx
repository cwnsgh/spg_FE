"use client";

/**
 * 마케팅 페이지의 글로벌 네트워크 섹션(해외·국내 탭 전환).
 * 사용처: `marketing/components/MainTabs.tsx` → `marketing/page.tsx` (`/marketing`).
 */
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./GlobalNetwork.module.css";
import OverseasFacilities from "./OverseasFacilities";
import DomesticFacilities from "./DomesticFacilities";

export default function GlobalNetwork() {
  const searchParams = useSearchParams();
  const urlType = searchParams.get("type");

  const [activeType, setActiveType] = useState<"overseas" | "domestic">(
    (urlType === "domestic" ? "domestic" : "overseas") as
      | "overseas"
      | "domestic"
  );

  // URL 파라미터 변경 시 상태 업데이트
  useEffect(() => {
    if (urlType === "domestic") {
      setActiveType("domestic");
    } else if (urlType === "overseas") {
      setActiveType("overseas");
    }
  }, [urlType]);

  return (
    <div className={styles.container}>
      {/* 해외/국내 사업장 선택 탭 */}
      <div className={styles.typeTabs}>
        <button
          className={`${styles.typeTab} ${
            activeType === "overseas" ? styles.active : ""
          }`}
          onClick={() => setActiveType("overseas")}
        >
          해외 사업장
        </button>
        <button
          className={`${styles.typeTab} ${
            activeType === "domestic" ? styles.active : ""
          }`}
          onClick={() => setActiveType("domestic")}
        >
          국내 사업장
        </button>
      </div>

      {/* 선택된 타입에 따른 콘텐츠 표시 */}
      {activeType === "overseas" && <OverseasFacilities />}
      {activeType === "domestic" && <DomesticFacilities />}
    </div>
  );
}
