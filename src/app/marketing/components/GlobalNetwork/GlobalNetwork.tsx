"use client";

import { useState } from "react";
import BusinessTypeTabs from "./BusinessTypeTabs";
import NetworkMap from "./NetworkMap";
import BusinessLocationList from "./BusinessLocationList";
import styles from "./GlobalNetwork.module.css";

export default function GlobalNetwork() {
  const [activeBusinessType, setActiveBusinessType] = useState<
    "overseas" | "domestic"
  >("overseas");
  const [activeSubType, setActiveSubType] = useState<"branches" | "agents">(
    "branches"
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>글로벌 네트워크</h2>

      <BusinessTypeTabs
        activeType={activeBusinessType}
        onTypeChange={setActiveBusinessType}
        activeSubType={activeSubType}
        onSubTypeChange={setActiveSubType}
      />

      <NetworkMap businessType={activeBusinessType} subType={activeSubType} />

      <BusinessLocationList
        businessType={activeBusinessType}
        subType={activeSubType}
      />
    </div>
  );
}
