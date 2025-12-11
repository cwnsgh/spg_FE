/**
 * 헤더 메뉴 데이터
 */
import { MenuItem } from "../types";

export const gnbMenuData: MenuItem[] = [
  {
    label: "제품소개",
    href: "/products",
    subMenu: [
      { label: "로봇감속기", href: "/products" },
      { label: "표준AC 기어드모터", href: "/products" },
      { label: "표준BLDC 기어드모터", href: "/products" },
      { label: "DC기어드모터", href: "/products" },
      { label: "동력용모터", href: "/products" },
      { label: "유성감속기", href: "/products" },
      { label: "기타", href: "/products" },
      { label: "보안경계", href: "/products" },
      { label: "음식물처리기", href: "/products" },
    ],
  },
  {
    label: "마케팅",
    href: "/marketing",
    subMenu: [
      {
        label: "해외지사",
        href: "/marketing?tab=global-network&type=overseas&category=branch",
      },
      {
        label: "국방대리점",
        href: "/marketing?tab=global-network&type=domestic&category=defense",
      },
      {
        label: "국내대리점",
        href: "/marketing?tab=global-network&type=domestic&category=domestic",
      },
      {
        label: "해외대리점",
        href: "/marketing?tab=global-network&type=overseas&category=dealer",
      },
      {
        label: "전문특판점",
        href: "/marketing?tab=global-network&type=domestic&category=specialty",
      },
      { label: "주요고객사", href: "/marketing?tab=customers" },
    ],
  },
  {
    label: "고객지원",
    href: "/customersupport",
    subMenu: [
      { label: "제품문의", href: "/customersupport?tab=inquiry" },
      { label: "메뉴얼 다운로드", href: "/customersupport?tab=download" },
      { label: "FAQ", href: "/customersupport?tab=faq" },
      { label: "모터/기어검색", href: "/customersupport" },
      { label: "감속기선정", href: "/customersupport" },
      { label: "기술자료", href: "/customersupport" },
    ],
  },
  {
    label: "IR정보",
    href: "/Irinformation",
    subMenu: [
      { label: "IR 공고", href: "/Irinformation" },
      { label: "IR 행사", href: "/Irinformation" },
      { label: "공시정보", href: "/Irinformation" },
      { label: "IR 콘텐츠", href: "/Irinformation" },
      { label: "IR 자료실", href: "/Irinformation" },
    ],
  },
  {
    label: "회사소개",
    href: "/aboutUs",
    subMenu: [
      { label: "인사말", href: "/aboutUs?tab=0" },
      { label: "경영이념 및 비전", href: "/aboutUs?tab=1" },
      { label: "회사연혁", href: "/aboutUs?tab=2" },
      { label: "채용정보", href: "/aboutUs?tab=3" },
      { label: "찾아오시는 길", href: "/aboutUs?tab=4" },
      { label: "윤리규정", href: "/aboutUs?tab=5" },
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
    href: string;
    smallCategories?: { label: string; href: string }[];
  }[][];
}

export interface HamburgerMenuColumn {
  // 첫 번째 컬럼용: 하나의 menu에 여러 big-cate
  title?: string;
  titleEn?: string;
  bigCateGroups?: {
    label: string;
    href: string;
    smallCategories?: { label: string; href: string }[];
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
          label: "로봇감속기",
          href: "/products",
          smallCategories: [
            { label: "KSH 시리즈", href: "/products" },
            { label: "KSR 시리즈", href: "/products" },
          ],
        },
        { label: "표준AC 기어드모터", href: "/products" },
        { label: "표준BLDC 기어드모터", href: "/products" },
        { label: "DC기어드모터", href: "/products" },
        {
          label: "동력용모터",
          href: "/products",
          smallCategories: [
            { label: "일반동력(P/PA/PC)", href: "/products" },
            { label: "메가시리즈", href: "/products" },
          ],
        },
        {
          label: "유성감속기",
          href: "/products",
          smallCategories: [
            { label: "일반유성", href: "/products" },
            { label: "SM시리즈", href: "/products" },
            { label: "로타리테이블", href: "/products" },
          ],
        },
      ],
      [
        {
          label: "기타",
          href: "/products",
          smallCategories: [
            { label: "동력용웜감속기", href: "/products" },
            { label: "베벨기어박스", href: "/products" },
            { label: "스텝모터", href: "/products" },
            { label: "쉐이디드폴", href: "/products" },
            { label: "FLAT", href: "/products" },
            { label: "PELLET HEATING", href: "/products" },
            { label: "BLDC FAN", href: "/products" },
            { label: "CAPACITOR RUN", href: "/products" },
            { label: "자동문", href: "/products" },
            { label: "공기청정기용", href: "/products" },
            { label: "냉장고용", href: "/products" },
            { label: "에어컨용", href: "/products" },
          ],
        },
        { label: "보안경계", href: "/products" },
        { label: "음식물처리기", href: "/products" },
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
              href: "/marketing?tab=global-network&type=overseas&category=branch",
            },
            {
              label: "국방대리점",
              href: "/marketing?tab=global-network&type=domestic&category=defense",
            },
            {
              label: "국내대리점",
              href: "/marketing?tab=global-network&type=domestic&category=domestic",
            },
            {
              label: "해외대리점",
              href: "/marketing?tab=global-network&type=overseas&category=dealer",
            },
            {
              label: "전문특판점",
              href: "/marketing?tab=global-network&type=domestic&category=specialty",
            },
            { label: "주요고객사", href: "/marketing?tab=customers" },
          ],
        ],
      },
      {
        title: "IR정보",
        titleEn: "IR Information",
        bigCateGroups: [
          [
            { label: "IR 공고", href: "/Irinformation" },
            { label: "IR 행사", href: "/Irinformation" },
            { label: "공시정보", href: "/Irinformation" },
            { label: "IR 콘텐츠", href: "/Irinformation" },
            { label: "IR 자료실", href: "/Irinformation" },
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
            { label: "제품문의", href: "/customersupport?tab=inquiry" },
            { label: "메뉴얼 다운로드", href: "/customersupport?tab=download" },
            { label: "FAQ", href: "/customersupport?tab=faq" },
            { label: "모터/기어검색", href: "/customersupport" },
            { label: "감속기선정", href: "/customersupport" },
            { label: "기술자료", href: "/customersupport" },
          ],
        ],
      },
      {
        title: "회사소개",
        titleEn: "About Us",
        bigCateGroups: [
          [
            { label: "인사말", href: "/aboutUs?tab=0" },
            { label: "경영이념 및 비전", href: "/aboutUs?tab=1" },
            { label: "회사연혁", href: "/aboutUs?tab=2" },
            { label: "채용정보", href: "/aboutUs?tab=3" },
            { label: "찾아오시는 길", href: "/aboutUs?tab=4" },
            { label: "윤리규정", href: "/aboutUs?tab=5" },
          ],
        ],
      },
    ],
  },
];
