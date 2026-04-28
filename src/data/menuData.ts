/**
 * 헤더 메뉴 데이터
 * - `제품소개` 서브메뉴(1뎁스 카테고리명)는 `Header`에서 API로 받아 `subMenu`를 채웁니다.
 */
import { MenuItem } from "../types";

export const gnbMenuData: MenuItem[] = [
  {
    label: "제품소개",
    titleEn: "Products",
    href: "/products",
    subMenu: [],
  },
  {
    label: "마케팅",
    titleEn: "Marketing",
    href: "/marketing",
    subMenu: [
      {
        label: "해외지사",
        titleEn: "Overseas Branches",
        href: "/marketing?tab=global-network&type=overseas&category=branch",
      },
      {
        label: "국방대리점",
        titleEn: "Defense Agencies",
        href: "/marketing?tab=global-network&type=domestic&category=defense",
      },
      {
        label: "국내대리점",
        titleEn: "Domestic Agencies",
        href: "/marketing?tab=global-network&type=domestic&category=domestic",
      },
      {
        label: "해외대리점",
        titleEn: "Overseas Agencies",
        href: "/marketing?tab=global-network&type=overseas&category=dealer",
      },
      {
        label: "전문특판점",
        titleEn: "Specialty Stores",
        href: "/marketing?tab=global-network&type=domestic&category=specialty",
      },
      { label: "주요고객사", titleEn: "Key Customers", href: "/marketing?tab=customers" },
    ],
  },
  {
    label: "고객지원",
    titleEn: "Customer Support",
    href: "/customersupport",
    subMenu: [
      { label: "제품문의", titleEn: "Product Inquiry", href: "/customersupport?tab=inquiry" },
      { label: "메뉴얼 다운로드", titleEn: "Manual Download", href: "http://spgm.co.kr/" },
      { label: "FAQ", titleEn: "FAQ", href: "/customersupport?tab=faq" },
      {
        label: "서보용 유성감속기 선정",
        titleEn: "Servo Planetary Selection",
        href: "https://webcatalog.spg.co.kr/",
      },
      { label: "기술자료", titleEn: "Technical Data", href: "/customersupport?tab=technical" },
    ],
  },
  {
    label: "IR정보",
    titleEn: "IR Information",
    href: "/Irinformation",
    subMenu: [
      { label: "공시정보", titleEn: "Disclosure Info", href: "/Irinformation?tab=0" },
      { label: "IR 공고", titleEn: "IR Notice", href: "/Irinformation?tab=1" },
      { label: "IR 콘텐츠", titleEn: "IR Contents", href: "/Irinformation?tab=2" },
      { label: "IR 행사", titleEn: "IR Events", href: "/Irinformation?tab=3" },
      { label: "IR 자료실", titleEn: "IR Library", href: "/Irinformation?tab=4" },
    ],
  },
  {
    label: "회사소개",
    titleEn: "About Us",
    href: "/aboutUs",
    subMenu: [
      { label: "인사말", titleEn: "Greetings", href: "/aboutUs?tab=0" },
      { label: "경영이념 및 비전", titleEn: "Vision", href: "/aboutUs?tab=1" },
      { label: "회사연혁", titleEn: "History", href: "/aboutUs?tab=2" },
      { label: "채용정보", titleEn: "Recruitment", href: "/aboutUs?tab=3" },
      { label: "찾아오시는 길", titleEn: "Directions", href: "/aboutUs?tab=4" },
      { label: "윤리규정", titleEn: "Code of Ethics", href: "/aboutUs?tab=5" },
    ],
  },
];

/**
 * 햄버거 메뉴 데이터 타입
 * - 첫 번째 컬럼: 하나의 menu 안에 여러 개의 bigCate 그룹
 * - 나머지 컬럼: 여러 개의 menu 섹션 (각각 h2 + menu)
 */
export interface HamburgerMenuSection {
  title: string;
  titleEn: string;
  bigCateGroups: {
    label: string;
    titleEn?: string;
    href: string;
    smallCategories?: { label: string; titleEn?: string; href: string }[];
  }[][];
}

export interface HamburgerMenuColumn {
  // 첫 번째 컬럼용: 하나의 menu에 여러 big-cate
  title?: string;
  titleEn?: string;
  bigCateGroups?: {
    label: string;
    titleEn?: string;
    href: string;
    smallCategories?: { label: string; titleEn?: string; href: string }[];
  }[][];
  // 나머지 컬럼용: 여러 섹션
  sections?: HamburgerMenuSection[];
}

export const hamburgerMenuData: HamburgerMenuColumn[] = [
  {
    // 첫 번째 컬럼: 제품소개 - 하나의 menu에 두 개의 big-cate
    title: "제품소개",
    titleEn: "Products",
    bigCateGroups: [
      [
        {
          label: "표준 AC 기어드모터",
          href: "/products?tab=0",
          smallCategories: [
            { label: "STANDARD AC", href: "/products?tab=0" },
            { label: "INDUSTRIAL AC", href: "/products?tab=0" },
          ],
        },
        {
          label: "SH 정밀감속기",
          href: "/products?tab=1",
          smallCategories: [{ label: "KSH 시리즈", href: "/products?tab=1" }],
        },
        {
          label: "SR 정밀감속기",
          href: "/products?tab=2",
          smallCategories: [{ label: "KSR 시리즈", href: "/products?tab=2" }],
        },
        {
          label: "서보모터용 정밀 유성감속기",
          href: "/products?tab=3",
          smallCategories: [
            { label: "일반유성", href: "/products?tab=3" },
            { label: "SM 시리즈", href: "/products?tab=3" },
          ],
        },
        {
          label: "동력용 모터",
          href: "/products?tab=4",
          smallCategories: [
            { label: "일반동력(P/PA/PC)", href: "/products?tab=4" },
          ],
        },
        {
          label: "동력용 기어드 모터",
          href: "/products?tab=5",
          smallCategories: [{ label: "메가시리즈", href: "/products?tab=5" }],
        },
      ],
      [
        {
          label: "BLDC 기어드 모터 X-TOR",
          href: "/products?tab=6",
          smallCategories: [{ label: "X-TOR 시리즈", href: "/products?tab=6" }],
        },
        { label: "DC 기어드 모터", href: "/products?tab=7" },
        { label: "SG 표준 AC 기어드모터", href: "/products?tab=8" },
        { label: "로타리 테이블", href: "/products?tab=9" },
        { label: "동력용 웜 감속기", href: "/products?tab=10" },
        { label: "베벨 기어박스", href: "/products?tab=11" },
        { label: "스텝모터", href: "/products?tab=12" },
      ],
    ],
  },
  {
    // 두 번째 컬럼: 마케팅 + IR정보
    sections: [
      {
        title: "마케팅",
        titleEn: "Marketing",
        bigCateGroups: [
          [
            {
              label: "해외지사",
              titleEn: "Overseas Branches",
              href: "/marketing?tab=global-network&type=overseas&category=branch",
            },
            {
              label: "국방대리점",
              titleEn: "Defense Agencies",
              href: "/marketing?tab=global-network&type=domestic&category=defense",
            },
            {
              label: "국내대리점",
              titleEn: "Domestic Agencies",
              href: "/marketing?tab=global-network&type=domestic&category=domestic",
            },
            {
              label: "해외대리점",
              titleEn: "Overseas Agencies",
              href: "/marketing?tab=global-network&type=overseas&category=dealer",
            },
            {
              label: "전문특판점",
              titleEn: "Specialty Stores",
              href: "/marketing?tab=global-network&type=domestic&category=specialty",
            },
            { label: "주요고객사", titleEn: "Key Customers", href: "/marketing?tab=customers" },
          ],
        ],
      },
      {
        title: "IR정보",
        titleEn: "IR Information",
        bigCateGroups: [
          [
            { label: "IR 공고", titleEn: "IR Notice", href: "/Irinformation?tab=1" },
            { label: "IR 행사", titleEn: "IR Events", href: "/Irinformation?tab=3" },
            { label: "공시정보", titleEn: "Disclosure Info", href: "/Irinformation?tab=0" },
            { label: "IR 콘텐츠", titleEn: "IR Contents", href: "/Irinformation?tab=2" },
            { label: "IR 자료실", titleEn: "IR Library", href: "/Irinformation?tab=4" },
          ],
        ],
      },
    ],
  },
  {
    // 세 번째 컬럼: 고객지원 + 회사소개
    sections: [
      {
        title: "고객지원",
        titleEn: "Customer Support",
        bigCateGroups: [
          [
            { label: "제품문의", titleEn: "Product Inquiry", href: "/customersupport?tab=inquiry" },
            { label: "메뉴얼 다운로드", titleEn: "Manual Download", href: "http://spgm.co.kr/" },
            { label: "FAQ", titleEn: "FAQ", href: "/customersupport?tab=faq" },
            {
              label: "서보용 유성감속기 선정",
              titleEn: "Servo Planetary Selection",
              href: "https://webcatalog.spg.co.kr/",
            },
            { label: "감속기선정", titleEn: "Reducer Selection", href: "/customersupport" },
            { label: "기술자료", titleEn: "Technical Data", href: "/customersupport?tab=technical" },
          ],
        ],
      },
      {
        title: "회사소개",
        titleEn: "About Us",
        bigCateGroups: [
          [
            { label: "인사말", titleEn: "Greetings", href: "/aboutUs?tab=0" },
            { label: "경영이념 및 비전", titleEn: "Vision", href: "/aboutUs?tab=1" },
            { label: "회사연혁", titleEn: "History", href: "/aboutUs?tab=2" },
            { label: "채용정보", titleEn: "Recruitment", href: "/aboutUs?tab=3" },
            { label: "찾아오시는 길", titleEn: "Directions", href: "/aboutUs?tab=4" },
            { label: "윤리규정", titleEn: "Code of Ethics", href: "/aboutUs?tab=5" },
          ],
        ],
      },
    ],
  },
];
