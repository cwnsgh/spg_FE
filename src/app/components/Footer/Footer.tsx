/**
 * 푸터 컴포넌트
 * - 회사 정보, FNB 메뉴, 저작권 정보
 */
"use client";

import React from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.topArea}>
        <div className={styles.infoWrap}>
          <div className={styles.fooLogo}>
            <img src="/images/logo.png" alt="spg" />
          </div>
          <div className={styles.info}>
            <p className={styles.companyName}>(주)케이먼트 코퍼레이션</p>
            <address>
              <span>TEL&nbsp;&nbsp;1800-8413</span>
              <span>FAX&nbsp;&nbsp;032-421-0880</span>
              <br />
              <span>대표이사&nbsp;&nbsp;김선홍</span>
              <span>
                주소&nbsp;&nbsp;인천시 계양구 오조산로 57번길
                7-1&nbsp;&nbsp;미래사랑빌딩 601,602호
              </span>
              <span>사업자등록번호&nbsp;&nbsp;000-00-00000</span>
            </address>
          </div>
        </div>
        <ul className={styles.fnb}>
          <li>
            <Link href="/products">제품소개</Link>
          </li>
          <li>
            <Link href="/marketing">마케팅</Link>
          </li>
          <li>
            <Link href="/customersupport">고객지원</Link>
          </li>
          <li>
            <Link href="/Irinformation">IR정보</Link>
          </li>
          <li>
            <Link href="/aboutUs">회사소개</Link>
          </li>
        </ul>
      </div>
      <div className={styles.btmArea}>
        <ul>
          <li>
            <Link href="#">개인정보처리방침</Link>
          </li>
          <li>
            <Link href="#">이용약관</Link>
          </li>
        </ul>
        <p className={styles.copyright}>
          Copyright, KMENT Corp. All rights reserved. Hosting. cafe24
        </p>
      </div>
    </footer>
  );
};

export default Footer;
