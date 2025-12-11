"use client";

import styles from "./NetworkMap.module.css";

interface NetworkMapProps {
  businessType: "overseas" | "domestic";
  subType: "branches" | "agents";
}

export default function NetworkMap({ businessType, subType }: NetworkMapProps) {
  return <div className={styles.mapContainer}></div>;
}
