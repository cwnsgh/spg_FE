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
            <p className={styles.companyName}>SPG Co., Ltd </p>
            <address>
              <span>
                <em>TEL</em>
                <span>032-820-8200</span>
              </span>
              <span>
                <em>FAX</em>
                <span>032-821-0383</span>
              </span>
              <span>
                <em>대표이사</em>
                <span>여영길</span>
              </span>
              <span>
                <em>주소</em>
                <span>
                  인천광역시 남동구 청능대로 289번길 45 (고잔동, 남동공단 67B
                  12L)
                </span>
              </span>
              <span>
                <em>사업자등록번호</em>
                <span>139-81-11459</span>
              </span>
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
          Copyright © SPG Co., Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
