"use client";

/**
 * 네트워크 지도 영역 스텁. 현재 프로젝트 내 다른 파일에서 import되지 않음.
 */
import styles from "./NetworkMap.module.css";

interface NetworkMapProps {
  businessType: "overseas" | "domestic";
  subType: "branches" | "agents";
}

export default function NetworkMap({ businessType, subType }: NetworkMapProps) {
  return <div className={styles.mapContainer}></div>;
}
