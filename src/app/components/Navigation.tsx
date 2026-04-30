/**
 * Navigation 컴포넌트 — 구버전 상단바(로고·링크·ProductInquiry·Search·MobileMenu).
 * 현재 실서비스 헤더는 `Header/Header.tsx` 사용. 이 파일은 저장소 내에서 import되지 않음.
 *
 * 전체 사이트의 상단 네비게이션 바를 담당하는 컴포넌트입니다.
 * - 왼쪽: SPG 로고 (홈으로 이동)
 * - 중앙: 주요 페이지 링크들 (제품소개, 마케팅, 고객지원, IR정보, 회사소개)
 * - 오른쪽: 제품문의 버튼, 검색 버튼, 모바일 햄버거 메뉴
 */
import Link from "next/link";
import styles from "./Navigation.module.css";
import ProductInquiryButton from "./ProductInquiryButton";
import SearchButton from "./SearchButton";
import MobileMenu from "./MobileMenu";

export default function Navigation() {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.navContent}>
          {/* 왼쪽: 로고 영역 */}
          <div className={styles.navLeft}>
            <Link href="/" className={styles.logo}>
              SPG
            </Link>
          </div>

          {/* 중앙: 메인 네비게이션 링크들 (데스크톱에서만 표시) */}
          <div className={styles.navRight}>
            <Link href="/products" className={styles.navLink}>
              제품소개
            </Link>
            <Link href="/marketing" className={styles.navLink}>
              마케팅
            </Link>
            <Link href="/customersupport" className={styles.navLink}>
              고객지원
            </Link>
            <Link href="/Irinformation" className={styles.navLink}>
              IR 정보
            </Link>
            <Link href="/aboutUs" className={styles.navLink}>
              회사소개
            </Link>
          </div>

          {/* 오른쪽: 액션 버튼들 (제품문의, 검색, 모바일 메뉴) */}
          <div className={styles.navActions}>
            <ProductInquiryButton />
            <SearchButton />
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
