import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <div className={styles.logo}>SPG</div>
            <div className={styles.companyInfo}>
              <p>TEL: 1800-413</p>
              <p>FAX: 010-421-0000</p>
              <p>주소: 인천시 계양구 아나지로 711번길 83번지</p>
              <p>사업자등록번호: 000-00-00000</p>
            </div>
            <div className={styles.legalLinks}>
              <Link href="/privacy">개인정보처리방침</Link>
              <Link href="/terms">이용약관</Link>
            </div>
          </div>
          <div className={styles.footerRight}>
            <nav className={styles.footerNav}>
              <Link href="/products">제품소개</Link>
              <Link href="/Irinformation">IR정보</Link>
              <Link href="/customersupport">고객지원</Link>
              <Link href="/aboutUs">회사소개</Link>
            </nav>
            <p className={styles.copyright}>
              Copyright. KMENT Corp. All rights reserved. Hosting. Cafe24
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
