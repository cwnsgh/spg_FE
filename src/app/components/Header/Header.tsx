/**
 * 헤더 컴포넌트
 * - 로고, GNB 메뉴, 검색, 햄버거 버튼 포함
 */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useHeaderScroll } from "../../../hooks/useHeaderScroll";
import { useHamburgerMenu } from "../../../hooks/useHamburgerMenu";
import { gnbMenuData, type HamburgerMenuColumn } from "../../../data/menuData";
import { fetchProductCategoryTree } from "@/api/product";
import { useAuth } from "@/contexts/AuthContext";
import AdminLoginModal from "@/app/components/Auth/AdminLoginModal";
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
  const router = useRouter();
  const pathname = usePathname();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isScrolled, headerRef, handleMouseEnter, handleMouseLeave } =
    useHeaderScroll();
  const { isMenuOpen, toggleMenu, closeMenu } = useHamburgerMenu();
  const { isLoggedIn, isAdmin, isLoading, logout } = useAuth();

  /** GNB 메뉴(제품소개 서브는 API로 채움) */
  const [gnbMenuWithProducts, setGnbMenuWithProducts] = useState(gnbMenuData);

  /** 햄버거 첫 컬럼: 백엔드 1뎁스(`tree` 루트) 카테고리명 */
  const [productColumnOverride, setProductColumnOverride] =
    useState<HamburgerMenuColumn | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProductCategoryTree()
      .then((data) => {
        if (cancelled) return;
        const roots = data.tree ?? [];
        if (!roots.length) return;

        const subMenu = roots.map((r) => ({
          label: r.name_ko,
          href: `/products?tab=${r.ca_id}`,
        }));

        const firstHref = subMenu[0]?.href ?? "/products";

        setGnbMenuWithProducts((prev) =>
          prev.map((item) =>
            item.label === "제품소개"
              ? { ...item, href: firstHref, subMenu }
              : item
          )
        );

        setProductColumnOverride({
          title: "제품소개",
          titleEn: "Products",
          bigCateGroups: [
            roots.map((r) => ({
              label: r.name_ko,
              href: `/products?tab=${r.ca_id}`,
            })),
          ],
        });
      })
      .catch(() => {
        /* 정적 메뉴 유지 */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 현재 페이지가 흰색 배경 페이지인지 확인
  const isLightPage = LIGHT_BACKGROUND_PAGES.some((page) =>
    pathname?.startsWith(page)
  );

  // 흰색 배경 페이지이거나 스크롤되었을 때 scrolled 클래스 적용
  const shouldShowScrolled = isLightPage || isScrolled;

  const handleLogout = async () => {
    await logout();
    closeMenu();
    setIsLoginModalOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleOpenLoginModal = () => {
    closeMenu();
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

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
            menuData={gnbMenuWithProducts}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            isScrolled={shouldShowScrolled}
            isMenuOpen={isMenuOpen}
          />
        </div>
        <div className={styles.rightArea}>
          <Link href="/customersupport?tab=inquiry" className={styles.askPrd}>
            제품 문의
          </Link>
          {!isLoading && (
            <div className={styles.adminBtns}>
              {!isLoggedIn && (
                <button
                  type="button"
                  className={styles.adminBtn}
                  onClick={handleOpenLoginModal}
                >
                  Admin Login
                </button>
              )}
              {isLoggedIn && isAdmin && (
                <Link href="/admin" className={styles.adminBtn} onClick={closeMenu}>
                  Admin
                </Link>
              )}
              {isLoggedIn && (
                <button
                  type="button"
                  className={styles.adminBtn}
                  onClick={() => void handleLogout()}
                >
                  Logout
                </button>
              )}
            </div>
          )}
          {/* 검색창 영역 */}
          {/* <div className={styles.searchBox}>
            <div className={styles.searchBtn}>
              <img src="/images/icon/search_ico.png" alt="검색" />
            </div>
          </div> */}
          <div className={styles.hamBtn} onClick={toggleMenu}>
            <span></span>
            <span></span>
          </div>
        </div>
      </header>
      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        productColumnOverride={productColumnOverride}
      />
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
      />
    </>
  );
};

export default Header;
