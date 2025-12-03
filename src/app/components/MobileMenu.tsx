"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./MobileMenu.module.css";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        className={styles.hamburger}
        onClick={toggleMenu}
        aria-label="메뉴 열기"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={closeMenu}></div>
          <div className={styles.menu}>
            <div className={styles.menuHeader}>
              <div className={styles.logo}>SPG</div>
              <button
                className={styles.closeButton}
                onClick={closeMenu}
                aria-label="메뉴 닫기"
              >
                ×
              </button>
            </div>
            <nav className={styles.menuNav}>
              <Link href="/products" onClick={closeMenu}>
                제품소개
              </Link>
              <Link href="/marketing" onClick={closeMenu}>
                마케팅
              </Link>
              <Link href="/customersupport" onClick={closeMenu}>
                고객지원
              </Link>
              <Link href="/Irinformation" onClick={closeMenu}>
                IR 정보
              </Link>
              <Link href="/aboutUs" onClick={closeMenu}>
                회사소개
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}

