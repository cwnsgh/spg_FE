/**
 * 앱 전역 UI·데이터 타입(MenuItem, 배너 슬라이드, IR 카드 등).
 * 사용처: `@/data/*`, GNB, IRInfo 등 `@/types` import 모듈.
 */

// 메뉴 아이템 타입
export interface MenuItem {
  label: string;
  titleEn?: string;
  href: string;
  subMenu?: MenuItem[];
}

// 제품 데이터 타입
export interface ProductData {
  nameKr: string;
  nameEg: string;
  imgPath: string;
  ko: string;
  eg: string;
  keywords: string[];
}

// 카테고리 아이템 타입
export interface CategoryItem {
  nameKr: string;
  nameEg: string;
  href: string;
  iconPath: string;
}

// 브랜치 데이터 타입
export interface BranchData {
  regionKo: string;
  regionEg: string;
  imgPath: string;
  alt: string;
}

// 주가 정보 타입
export interface StockInfo {
  currentPrice: string;
  change: string;
  changeRate: string;
  tradingVolume: string;
}

// 재무 정보 타입
export interface FinancialInfo {
  revenue: string;
  assets: string;
  capital: string;
}

// IR 정보 타입
export interface IRInfo {
  title: string;
  date: string;
}

// 메인 배너 슬라이드 타입
export interface MainBannerSlide {
  imgPath: string;
  title: string;
  titleEm?: string;
  description: string;
  href?: string;
}




