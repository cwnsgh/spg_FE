"use client";

import { useState } from "react";
import styles from "./BusinessTypeTabs.module.css";

interface BusinessTypeTabsProps {
  activeType: "overseas" | "domestic";
  onTypeChange: (type: "overseas" | "domestic") => void;
  activeSubType: "branches" | "agents";
  onSubTypeChange: (type: "branches" | "agents") => void;
}

export default function BusinessTypeTabs({
  activeType,
  onTypeChange,
  activeSubType,
  onSubTypeChange,
}: BusinessTypeTabsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.mainTabs}>
        <button
          className={`${styles.tab} ${
            activeType === "overseas" ? styles.active : ""
          }`}
          onClick={() => onTypeChange("overseas")}
        >
          해외사업장
        </button>
        <button
          className={`${styles.tab} ${
            activeType === "domestic" ? styles.active : ""
          }`}
          onClick={() => onTypeChange("domestic")}
        >
          국내사업장
        </button>
      </div>

      {activeType === "overseas" && (
        <div className={styles.subTabs}>
          <button
            className={`${styles.subTab} ${
              activeSubType === "branches" ? styles.active : ""
            }`}
            onClick={() => onSubTypeChange("branches")}
          >
            해외지사
          </button>
          <button
            className={`${styles.subTab} ${
              activeSubType === "agents" ? styles.active : ""
            }`}
            onClick={() => onSubTypeChange("agents")}
          >
            해외대리점
          </button>
        </div>
      )}
    </div>
  );
}
