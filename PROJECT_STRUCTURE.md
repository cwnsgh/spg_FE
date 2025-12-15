# SPG 프로젝트 구조 문서

## 📁 전체 디렉토리 구조

```
src/app/
├── layout.tsx              # 루트 레이아웃 (Header + Footer)
├── page.tsx                # 홈 페이지 (/)
├── globals.css             # 전역 스타일
│
├── components/             # 공통 컴포넌트
│   ├── Header/             # 상단 헤더
│   ├── Footer/             # 하단 푸터
│   ├── HeroBanner.tsx      # 히어로 배너 (공통)
│   ├── Breadcrumb.tsx      # 브레드크럼
│   └── ...
│
├── home/                   # 홈 페이지 컴포넌트
│   └── components/
│       ├── MainBanner/     # 메인 배너
│       ├── ProductIntro/   # 제품 소개
│       ├── CategoryMenu/   # 카테고리 메뉴
│       └── BrandInfo/      # 브랜드 정보
│
├── aboutUs/                # 회사소개 페이지 (/aboutUs)
├── marketing/              # 마케팅 페이지 (/marketing)
├── products/               # 제품소개 페이지 (/products)
├── customersupport/        # 고객지원 페이지 (/customersupport)
└── Irinformation/          # IR 정보 페이지 (/Irinformation)
```

---

## 🏠 페이지별 상세 구조

### 1. 홈 페이지 (`/`) - `src/app/page.tsx`

**구조:**
```
<main>
  ├── MainBanner          # 메인 배너 (Swiper)
  ├── ProductIntro        # 제품 소개 섹션
  ├── CategoryMenu        # 카테고리 메뉴
  └── BrandInfo          # 브랜드 정보
      ├── GlobalNetwork   # 글로벌 네트워크 (Swiper)
      └── IRInfo          # IR 정보
```

**컴포넌트 위치:**
- `src/app/home/components/MainBanner/`
- `src/app/home/components/ProductIntro/`
- `src/app/home/components/CategoryMenu/`
- `src/app/home/components/BrandInfo/`

---

### 2. 회사소개 페이지 (`/aboutUs`) - `src/app/aboutUs/page.tsx`

**구조:**
```
<main>
  ├── HeroBanner          # 히어로 배너 + 서브 탭
  │   └── 탭: 인사말, 경영이념 및 비전, 회사연혁, 채용정보, 찾아오시는 길, 윤리경영
  └── AboutTabs           # 탭별 콘텐츠
      ├── Greeting        # 인사말 (tab=0)
      ├── Vision          # 경영이념 및 비전 (tab=1)
      ├── History         # 회사연혁 (tab=2)
      ├── Recruitment     # 채용정보 (tab=3)
      ├── Directions      # 찾아오시는 길 (tab=4)
      └── Ethics          # 윤리경영 (tab=5)
```

**URL 파라미터:**
- `/aboutUs?tab=0` → 인사말
- `/aboutUs?tab=1` → 경영이념 및 비전
- `/aboutUs?tab=2` → 회사연혁
- `/aboutUs?tab=3` → 채용정보
- `/aboutUs?tab=4` → 찾아오시는 길
- `/aboutUs?tab=5` → 윤리경영

**컴포넌트 위치:**
- `src/app/aboutUs/components/AboutTabs.tsx`
- `src/app/aboutUs/components/sections/` (각 섹션별 컴포넌트)

---

### 3. 마케팅 페이지 (`/marketing`) - `src/app/marketing/page.tsx`

**구조:**
```
<main>
  ├── HeroBanner          # 히어로 배너 + 메인 탭
  │   └── 탭: 글로벌 네트워크, 주요고객사
  ├── Breadcrumb          # 브레드크럼
  └── MainTabs            # 메인 탭 콘텐츠
      ├── GlobalNetwork   # 글로벌 네트워크 (tab=0)
      │   ├── BusinessTypeTabs    # 해외지사 / 국내지사 탭
      │   ├── NetworkMap          # 지도
      │   ├── OverseasFacilities # 해외지사 리스트
      │   └── DomesticFacilities  # 국내지사 리스트
      └── Customers        # 주요고객사 (tab=1)
```

**URL 파라미터:**
- `/marketing?tab=0` → 글로벌 네트워크
- `/marketing?tab=1` → 주요고객사

**컴포넌트 위치:**
- `src/app/marketing/components/MainTabs.tsx`
- `src/app/marketing/components/GlobalNetwork/`
- `src/app/marketing/components/Customers/`

---

### 4. 제품소개 페이지 (`/products`) - `src/app/products/page.tsx`

**구조:**
```
<main>
  ├── HeroBanner          # 히어로 배너
  ├── Breadcrumb          # 브레드크럼
  └── section.products    # 제품 콘텐츠 영역
      ├── 제목 영역       # 현재 선택된 서브 카테고리 타이틀
      └── productContent
          ├── ProductNavigation  # 왼쪽 네비게이션
          │   ├── 서브 카테고리: STANDARD AC, INDUSTRIAL AC, ...
          │   └── 공통 기능: 작동원리, 형식표기, 기술자료
          └── ProductGrid        # 오른쪽 제품 그리드
              ├── 3열 그리드
              └── 페이지네이션
```

**서브 카테고리:**
- `standard-ac` → 표준AC 기어드모터
- `industrial-ac` → 산업용AC 기어드모터
- `condenser-run` → 콘덴서 런 기어드모터
- `shaded-pole` → 셰이드 폴 기어드모터
- `fan-ac` → 팬 AC 모터

**컴포넌트 위치:**
- `src/app/products/components/ProductNavigation.tsx`
- `src/app/products/components/ProductGrid.tsx`

---

### 5. 고객지원 페이지 (`/customersupport`) - `src/app/customersupport/page.tsx`

**구조:**
```
<main>
  ├── HeroBanner          # 히어로 배너 + 서브 탭
  │   └── 탭: 제품문의, FAQ, 다운로드
  ├── Breadcrumb          # 브레드크럼
  └── SupportTabs         # 탭별 콘텐츠
      ├── InquirySection  # 제품문의 (tab=inquiry)
      │   ├── InquiryTypeTabs    # 문의 유형 탭
      │   ├── InquiryFilter      # 필터/검색
      │   └── InquiryTable       # 문의 테이블
      ├── FAQSection      # FAQ (tab=faq)
      └── DownloadSection # 다운로드 (tab=download)
```

**URL 파라미터:**
- `/customersupport?tab=inquiry` → 제품문의 (기본값)
- `/customersupport?tab=faq` → FAQ
- `/customersupport?tab=download` → 다운로드

**컴포넌트 위치:**
- `src/app/customersupport/components/SupportTabs.tsx`
- `src/app/customersupport/components/InquirySection/`
- `src/app/customersupport/components/FAQSection/`
- `src/app/customersupport/components/DownloadSection/`

---

### 6. IR 정보 페이지 (`/Irinformation`) - `src/app/Irinformation/page.tsx`

**구조:**
```
<main>
  └── content
      └── 기본 레이아웃 (향후 확장 예정)
```

**상태:** 기본 구조만 구성되어 있으며, 향후 IR 관련 섹션 추가 예정

---

## 🔧 공통 컴포넌트

### Header (`src/app/components/Header/Header.tsx`)
- 상단 네비게이션 바
- GNB (Global Navigation Bar)
- 햄버거 메뉴 (모바일)
- 검색 버튼
- 제품 문의 버튼

### Footer (`src/app/components/Footer/Footer.tsx`)
- 하단 푸터 정보
- 회사 정보, 연락처
- 하단 네비게이션 링크

### HeroBanner (`src/app/components/HeroBanner.tsx`)
- 페이지 상단 히어로 배너
- 배경 이미지
- 페이지 타이틀
- 서브 탭 (선택적)
- URL 파라미터 연동 지원

**Props:**
```typescript
{
  title: string;
  backgroundImage: string;
  tabs?: Array<{ label: string; value: string | number }>;
  useUrlParams?: boolean;
  urlParamKey?: string;
  basePath?: string;
}
```

### Breadcrumb (`src/app/components/Breadcrumb.tsx`)
- 브레드크럼 네비게이션
- 홈 아이콘 지원
- 동적 경로 표시

**Props:**
```typescript
{
  items: Array<{ label: string; href?: string }>;
}
```

---

## 🎨 스타일링

### CSS Modules
- 모든 컴포넌트는 CSS Modules 사용
- 파일명: `ComponentName.module.css`
- 클래스명: camelCase (예: `className={styles.container}`)

### 전역 스타일
- `src/app/globals.css` - 전역 CSS 변수 및 기본 스타일
- CSS 변수: `--layout-side-pc`, `--layout-side-pc-sub` 등

---

## 📝 주요 특징

### 1. URL 파라미터 기반 탭 전환
- `aboutUs`, `marketing`, `customersupport` 페이지에서 사용
- 페이지 리로드 없이 탭 전환
- 브라우저 뒤로가기/앞으로가기 지원

### 2. Suspense 사용
- `useSearchParams()`를 사용하는 컴포넌트는 Suspense로 감싸야 함
- 클라이언트 컴포넌트에서 서버 컴포넌트로 전환 시 필요

### 3. 클라이언트 컴포넌트
- 상태 관리가 필요한 컴포넌트는 `"use client"` 지시어 사용
- Swiper, 탭 전환 등 인터랙티브 기능

### 4. 데이터 구조
- 제품 데이터: `src/app/products/page.tsx` 내부에 정의
- 브랜치 데이터: `src/data/branchData.ts`

---

## 🚀 개발 가이드

### 새 페이지 추가하기
1. `src/app/새페이지명/` 디렉토리 생성
2. `page.tsx` 파일 생성
3. 필요시 `components/` 디렉토리에 컴포넌트 추가
4. `page.module.css`로 스타일 정의

### 새 컴포넌트 추가하기
1. 컴포넌트 파일 생성: `ComponentName.tsx`
2. CSS Modules 파일 생성: `ComponentName.module.css`
3. 필요한 경우 `"use client"` 지시어 추가

### 탭 기능 추가하기
1. `HeroBanner`에 `tabs` prop 전달
2. `useUrlParams={true}` 설정
3. 탭 콘텐츠 컴포넌트에서 `useSearchParams()`로 현재 탭 확인

---

## 📌 참고사항

- 모든 페이지는 `layout.tsx`의 Header와 Footer를 공유
- CSS Modules를 사용하여 스타일 격리
- HTML 구조를 최대한 유지하여 CSS 호환성 확보
- Swiper 라이브러리 사용 (메인 배너, 글로벌 네트워크)

