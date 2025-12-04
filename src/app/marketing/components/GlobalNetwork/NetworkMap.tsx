"use client";

import styles from "./NetworkMap.module.css";

interface NetworkMapProps {
  businessType: "overseas" | "domestic";
  subType: "branches" | "agents";
}

export default function NetworkMap({ businessType, subType }: NetworkMapProps) {
  return (
    <div className={styles.mapContainer}>
      <div className={styles.map}>
        <p className={styles.placeholder}>
          지도 컴포넌트 (Google Maps 또는 다른 지도 라이브러리 연동 예정)
        </p>
        <p className={styles.info}>
          현재 선택: {businessType === "overseas" ? "해외" : "국내"} /{" "}
          {subType === "branches" ? "지사" : "대리점"}
        </p>
      </div>
    </div>
  );
}
