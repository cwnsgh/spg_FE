"use client";

import styles from "./InquiryTypeTabs.module.css";

interface InquiryTypeTabsProps {
  activeType: "product" | "technical" | "quality";
  onTypeChange: (type: "product" | "technical" | "quality") => void;
}

export default function InquiryTypeTabs({
  activeType,
  onTypeChange,
}: InquiryTypeTabsProps) {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.tab} ${
          activeType === "product" ? styles.active : ""
        }`}
        onClick={() => onTypeChange("product")}
      >
        제품문의
      </button>
      <button
        className={`${styles.tab} ${
          activeType === "technical" ? styles.active : ""
        }`}
        onClick={() => onTypeChange("technical")}
      >
        기술지원
      </button>
      <button
        className={`${styles.tab} ${
          activeType === "quality" ? styles.active : ""
        }`}
        onClick={() => onTypeChange("quality")}
      >
        품질 & AS
      </button>
    </div>
  );
}
