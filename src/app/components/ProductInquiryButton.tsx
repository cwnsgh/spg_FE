import Link from "next/link";
import styles from "./ProductInquiryButton.module.css";

export default function ProductInquiryButton() {
  return (
    <Link href="/customersupport?tab=inquiry" className={styles.button}>
      제품문의
    </Link>
  );
}

