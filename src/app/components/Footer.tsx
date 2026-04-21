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
              <p>TEL 032-820-8200</p>
              <p>FAX 032-821-0383</p>
              <p>
                인천광역시 남동구 청능대로 289번길 45 (고잔동, 남동공단 67B 12L)
              </p>
              <p>사업자등록번호: 139-81-11459</p>
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
              Copyright © SPG Co., Ltd All rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
