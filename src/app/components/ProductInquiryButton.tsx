/**
 * 제품문의 고정 링크 버튼. 사용처: `Navigation.tsx` 내부만 — Navigation 자체가 현재 앱에서 import되지 않음(구버전 헤더용).
 */
import Link from "next/link";
import styles from "./ProductInquiryButton.module.css";

export default function ProductInquiryButton() {
  return (
    <Link href="/customersupport?tab=inquiry" className={styles.button}>
      제품문의
    </Link>
  );
}
