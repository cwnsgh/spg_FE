# SPG 프로젝트 구조 문서

## 📁 전체 디렉토리 구조

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (Header + Footer)
│   ├── page.tsx                # 홈 페이지 (/)
│   ├── globals.css             # 전역 스타일
│   │
│   ├── components/             # 공통 컴포넌트
│   │   ├── Header/             # 상단 헤더 (GNB, HamburgerMenu)
│   │   ├── Footer/             # 하단 푸터
│   │   ├── HeroBanner.tsx      # 히어로 배너 (공통)
│   │   ├── Breadcrumb.tsx      # 브레드크럼
│   │   ├── PageHeader.tsx
│   │   ├── Navigation.tsx
│   │   ├── MobileMenu.tsx
│   │   ├── SearchButton.tsx
│   │   ├── ProductInquiryButton.tsx
│   │   └── ...
│   │
│   ├── home/                   # 홈 페이지
│   │   └── components/
│   │       ├── MainBanner/     # 메인 배너 (Swiper)
│   │       ├── ProductIntro/   # 제품 소개
│   │       ├── CategoryMenu/   # 카테고리 메뉴
│   │       └── BrandInfo/      # 브랜드 정보 (GlobalNetwork, IRInfo)
│   │
│   ├── aboutUs/                # 회사소개 (/aboutUs)
│   │   └── components/
│   │       ├── AboutTabs.tsx
│   │       └── sections/       # Greeting, Vision, CompanyHistory, Recruitment, Directions, Ethics
│   │
│   ├── marketing/              # 마케팅 (/marketing)
│   │   └── components/
│   │       ├── MainTabs.tsx
│   │       ├── GlobalNetwork/  # BusinessTypeTabs, NetworkMap, BusinessLocationList, OverseasFacilities, DomesticFacilities
│   │       └── Customers/      # 주요고객사
│   │
│   ├── products/               # 제품소개 (/products, /products/[id])
│   │   ├── page.tsx            # 제품 목록
│   │   ├── [id]/page.tsx       # 제품 상세 (동적 라우트)
│   │   ├── data/productData.ts
│   │   └── components/
│   │       ├── ProductNavigation.tsx
│   │       ├── ProductGrid.tsx
│   │       ├── ProductCard.tsx
│   │       └── ProductSidebar.tsx
│   │
│   ├── customersupport/        # 고객지원 (/customersupport)
│   │   └── components/
│   │       ├── SupportTabs.tsx
│   │       ├── InquirySection/  # InquiryTypeTabs, InquiryFilter, InquiryTable
│   │       ├── FAQSection/
│   │       └── DownloadSection/
│   │
│   └── Irinformation/          # IR 정보 (/Irinformation)
│       └── components/
│           ├── IRTabs.tsx
│           └── sections/      # Disclosure, IRAnnouncement, IRContent, IREvent, IRLibrary
│
├── data/                       # 전역 데이터
│   ├── menuData.ts             # GNB 메뉴
│   ├── categoryData.ts         # 카테고리 메뉴 (홈)
│   ├── branchData.ts           # 브랜치/지사
│   ├── productData.ts          # (공용 제품 데이터 참조용일 수 있음)
│   └── irData.ts               # IR 관련 데이터
│
├── hooks/
│   ├── useHeaderScroll.ts
│   └── useHamburgerMenu.ts
│
├── types/
│   └── index.ts
│
├── styles/
│   ├── reset.css
│   └── main.css
│
└── assets/                     # 이미지 등 (aboutus_banner, marketing_banner 등)
```

---

## 🏠 페이지별 상세 구조

### 1. 홈 페이지 (`/`) — `src/app/page.tsx`

**구조:**
```
<main className="home-page">
  ├── MainBanner       # 메인 배너 (Swiper)
  ├── ProductIntro     # 제품 소개 섹션
  ├── CategoryMenu     # 카테고리 메뉴 (categoryData 사용)
  └── BrandInfo        # 브랜드 정보
      ├── GlobalNetwork  # 글로벌 네트워크 (Swiper)
      └── IRInfo         # IR 정보
```

**컴포넌트 위치:** `src/app/home/components/`

---

### 2. 회사소개 (`/aboutUs`) — `src/app/aboutUs/page.tsx`

**구조:**
```
<main>
  ├── HeroBanner       # 히어로 배너 + 서브 탭
  │   └── 탭: 인사말, 경영이념 및 비전, 회사연혁, 채용정보, 찾아오시는 길, 윤리경영
  ├── Breadcrumb
  └── AboutTabs        # 탭별 콘텐츠
      ├── Greeting        # 인사말 (tab=0)
      ├── Vision          # 경영이념 및 비전 (tab=1)
      ├── CompanyHistory  # 회사연혁 (tab=2)
      ├── Recruitment     # 채용정보 (tab=3)
      ├── Directions      # 찾아오시는 길 (tab=4)
      └── Ethics          # 윤리경영 (tab=5)
```

**URL 파라미터:** `?tab=0` ~ `?tab=5`

**컴포넌트:** `AboutTabs.tsx`, `sections/Greeting.tsx`, `Vision.tsx`, `CompanyHistory.tsx`, `Recruitment.tsx`, `Directions.tsx`, `Ethics.tsx`

---

### 3. 마케팅 (`/marketing`) — `src/app/marketing/page.tsx`

**구조:**
```
<main>
  ├── HeroBanner       # 히어로 배너 + 탭
  │   └── 탭: 글로벌 네트워크, 주요고객사
  ├── Breadcrumb
  └── MainTabs
      ├── GlobalNetwork (tab=0)
      │   ├── BusinessTypeTabs    # 해외지사 / 국내지사
      │   ├── NetworkMap
      │   ├── BusinessLocationList
      │   ├── OverseasFacilities
      │   └── DomesticFacilities
      └── Customers    # 주요고객사 (tab=1)
```

**URL 파라미터:** `?tab=0` (글로벌 네트워크), `?tab=1` (주요고객사)

---

### 4. 제품소개 (`/products`, `/products/[id]`) — `src/app/products/`

**목록 페이지 (`/products`):**
```
<main>
  ├── HeroBanner       # 탭: 로봇감속기, 표준AC 기어드모터, … (tab=0~8)
  ├── Breadcrumb
  └── section.products
      ├── 제목 영역 (메인 탭 타이틀)
      ├── 검색 영역
      └── productContent
          ├── ProductNavigation   # 서브 카테고리 + 공통 기능
          └── ProductGrid         # 제품 그리드 + 페이지네이션
```

**상세 페이지 (`/products/[id]`):** 제품 ID로 상세 표시, Breadcrumb, `getProductById` 사용. 상품 없으면 `notFound()`.

**메인 탭 (tab 파라미터):** 로봇감속기(0), 표준AC 기어드모터(1), 표준BLDC(2), DC기어드모터(3), 동력용모터(4), 유성감속기(5), 기타(6), 보안경계(7), 음식물처리기(8).

**서브 카테고리:** `standard-ac`, `industrial-ac`, `condenser-run`, `shaded-pole`, `fan-ac` 등 (productData 키 기준).

**데이터:** `src/app/products/data/productData.ts`

---

### 5. 고객지원 (`/customersupport`) — `src/app/customersupport/page.tsx`

**구조:**
```
<main>
  ├── HeroBanner       # 탭: 제품문의, FAQ, 다운로드
  ├── Breadcrumb
  └── SupportTabs
      ├── InquirySection (tab=inquiry)  # InquiryTypeTabs, InquiryFilter, InquiryTable
      ├── FAQSection    (tab=faq)
      └── DownloadSection (tab=download)
```

**URL 파라미터:** `?tab=inquiry` | `?tab=faq` | `?tab=download`

---

### 6. IR 정보 (`/Irinformation`) — `src/app/Irinformation/page.tsx`

**구조:**
```
<main>
  ├── HeroBanner       # 탭: 공시정보, IR공고, IR콘텐츠, IR행사, IR 자료실
  ├── Breadcrumb
  └── content
      └── IRTabs
          ├── Disclosure    (tab=0) 공시정보
          ├── IRAnnouncement (tab=1) IR공고
          ├── IRContent     (tab=2) IR콘텐츠
          ├── IREvent       (tab=3) IR행사
          └── IRLibrary     (tab=4) IR 자료실
```

**URL 파라미터:** `?tab=0` ~ `?tab=4`

**데이터:** `src/data/irData.ts` 참조 가능

---

## 🔧 공통 컴포넌트

| 컴포넌트 | 경로 | 설명 |
|----------|------|------|
| Header | `components/Header/Header.tsx` | GNB, HamburgerMenu, 로고, 검색, 제품문의 버튼. `menuData`, `useHeaderScroll`, `useHamburgerMenu` 사용 |
| Footer | `components/Footer/Footer.tsx` | 하단 푸터, 회사 정보/링크 |
| HeroBanner | `components/HeroBanner.tsx` | 페이지 타이틀, 배경 이미지, 탭, 브레드크럼(선택), URL 파라미터 연동 |
| Breadcrumb | `components/Breadcrumb.tsx` | 브레드크럼. `items: { label, href? }[]` |
| PageHeader | `components/PageHeader.tsx` | 페이지 헤더 (필요 시 사용) |
| Navigation | `components/Navigation.tsx` | 네비게이션 |
| MobileMenu | `components/MobileMenu.tsx` | 모바일 메뉴 |
| SearchButton | `components/SearchButton.tsx` | 검색 버튼 |
| ProductInquiryButton | `components/ProductInquiryButton.tsx` | 제품 문의 버튼 |

**HeroBanner Props 요약:**  
`title`, `backgroundImage?`, `categoryLinks?`, `breadcrumb?`, `tabs?`, `activeTab?`, `onTabChange?`, `useUrlParams?`, `urlParamKey?`, `basePath?`

---

## 🎨 스타일

- **전역:** `src/app/globals.css` (레이아웃 변수 등)
- **추가 스타일:** `src/styles/reset.css`, `src/styles/main.css`
- **컴포넌트:** CSS Modules (`*.module.css`), 클래스명 camelCase

---

## 📝 데이터·훅·타입

- **데이터:** `src/data/menuData.ts`, `categoryData.ts`, `branchData.ts`, `irData.ts` / `src/app/products/data/productData.ts`
- **훅:** `src/hooks/useHeaderScroll.ts`, `useHamburgerMenu.ts`
- **타입:** `src/types/index.ts` (예: `CategoryItem`)

---

## 🚀 개발 가이드

### 새 페이지 추가
1. `src/app/페이지명/` 디렉토리 생성
2. `page.tsx` 작성 (필요 시 `"use client"`, Suspense)
3. `components/`, `page.module.css` 등 추가

### 탭 + URL 파라미터
1. `HeroBanner`에 `tabs`, `useUrlParams={true}`, `urlParamKey`, `basePath` 전달
2. 탭 콘텐츠에서 `useSearchParams()`로 `tab` 읽기

### 동적 라우트
- 예: `src/app/products/[id]/page.tsx` — `params`는 `Promise<{ id: string }>`, Next 15에서는 `use(params)` 사용

---

## 📌 참고사항

- 모든 페이지는 루트 `layout.tsx`에서 Header + Footer 공통 사용
- `useSearchParams()` 사용 페이지는 상위에서 `<Suspense>`로 감싸기
- Swiper: MainBanner(홈), BrandInfo GlobalNetwork(홈) 등에서 사용
- 제품 목록/상세는 `productData` 및 `getProductById` 사용
