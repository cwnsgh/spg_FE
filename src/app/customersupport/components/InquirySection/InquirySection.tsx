"use client";

import { useState } from "react";
import InquiryTypeTabs from "./InquiryTypeTabs";
import InquiryTable from "./InquiryTable";
import InquiryFilter from "./InquiryFilter";
import styles from "./InquirySection.module.css";

export default function InquirySection() {
  const [activeType, setActiveType] = useState<
    "product" | "technical" | "quality"
  >("product");

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>제품문의</h2>

      <div className={styles.header}>
        <InquiryTypeTabs activeType={activeType} onTypeChange={setActiveType} />
        <InquiryFilter />
      </div>

      <InquiryTable inquiryType={activeType} />
    </div>
  );
}


