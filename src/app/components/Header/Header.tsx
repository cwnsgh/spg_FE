/**
 * 헤더 컴포넌트
 * - 로고, GNB 메뉴, 검색, 햄버거 버튼 포함
 */
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHeaderScroll } from "../../../hooks/useHeaderScroll";
import { useHamburgerMenu } from "../../../hooks/useHamburgerMenu";
import { gnbMenuData } from "../../../data/menuData";
import GNB from "./GNB";
import HamburgerMenu from "./HamburgerMenu";
import styles from "./Header.module.css";

// 흰색 배경 페이지 목록 (헤더 글씨가 검은색이어야 하는 페이지)
const LIGHT_BACKGROUND_PAGES = [
  "/aboutUs",
  "/products",
  "/marketing",
  "/customersupport",
  "/Irinformation",
];

const Header: React.FC = () => {
  const pathname = usePathname();
  const { isScrolled, headerRef, handleMouseEnter, handleMouseLeave } =
    useHeaderScroll();
  const { isMenuOpen, toggleMenu } = useHamburgerMenu();

  // 현재 페이지가 흰색 배경 페이지인지 확인
  const isLightPage = LIGHT_BACKGROUND_PAGES.some((page) =>
    pathname?.startsWith(page)
  );

  // 흰색 배경 페이지이거나 스크롤되었을 때 scrolled 클래스 적용
  const shouldShowScrolled = isLightPage || isScrolled;

  return (
    <>
      <header
        ref={headerRef}
        className={`${styles.header} ${shouldShowScrolled ? styles.scrolled : ""} ${isMenuOpen ? styles.menuOpen : ""}`}
      >
        <div className={styles.leftArea}>
          <h1 className={styles.logo}>
            <Link href="/">
              <img src="/images/logo.png" alt="spg" />
            </Link>
          </h1>
          <GNB
            menuData={gnbMenuData}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            isScrolled={shouldShowScrolled}
          />
        </div>
        <div className={styles.rightArea}>
          <Link href="#" className={styles.askPrd}>
            제품 문의
          </Link>
          <div className={styles.searchBox}>
            <div className={styles.searchBtn}>
              <img src="/images/icon/search_ico.png" alt="검색" />
            </div>
          </div>
          <div className={styles.hamBtn} onClick={toggleMenu}>
            <span></span>
            <span></span>
          </div>
        </div>
      </header>
      <HamburgerMenu isOpen={isMenuOpen} onClose={toggleMenu} />
    </>
  );
};

export default Header;
