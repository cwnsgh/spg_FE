"use client";

/**
 * 문의 유형(제품·기술·품질) 탭 UI. 현재 저장소에서 import되는 곳 없음(예비 컴포넌트).
 */
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
