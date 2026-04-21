"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./page.module.css";

type QuickItem = { href: string; label: string; description: string };

const quickSections: { title: string; items: QuickItem[] }[] = [
  {
    title: "메인",
    items: [
      {
        href: "/admin/popups",
        label: "팝업 관리",
        description: "메인 페이지 노출 팝업",
      },
    ],
  },
  {
    title: "통계",
    items: [
      {
        href: "/admin/analytics/visitors",
        label: "접속 분석",
        description: "기간별 접속 집계·로그 검색",
      },
    ],
  },
  {
    title: "제품소개",
    items: [
      {
        href: "/admin/products/categories",
        label: "제품 카테고리",
        description: "카테고리 구조·노출",
      },
      {
        href: "/admin/products",
        label: "제품 콘텐츠",
        description: "상품 등록·첨부",
      },
    ],
  },
  {
    title: "마케팅",
    items: [
      {
        href: "/admin/marketing/franchise",
        label: "프랜차이즈 관리",
        description: "지사·대리점 정보 등록·수정",
      },
    ],
  },
  {
    title: "고객지원",
    items: [
      {
        href: "/admin/customersupport/faq",
        label: "FAQ 관리",
        description: "자주 묻는 질문",
      },
      {
        href: "/admin/customersupport/recruit-posts",
        label: "채용공고",
        description: "공고 등록·노출 기간",
      },
      {
        href: "/admin/customersupport/recruit",
        label: "채용 지원자",
        description: "지원서 목록·열람",
      },
      {
        href: "/admin/customersupport/qa-config",
        label: "문의 설정",
        description: "문의 폼·안내 문구",
      },
    ],
  },
  {
    title: "IR정보",
    items: [
      {
        href: "/admin/ir/announcement",
        label: "IR공고",
        description: "IR 공시 글",
      },
      {
        href: "/admin/ir/content",
        label: "IR콘텐츠",
        description: "IR 본문 콘텐츠",
      },
      {
        href: "/admin/ir/event",
        label: "IR행사",
        description: "행사·일정",
      },
      {
        href: "/admin/ir/financial-statement",
        label: "재무상태표",
        description: "공시 자료",
      },
      {
        href: "/admin/ir/income-statement",
        label: "손익계산서",
        description: "공시 자료",
      },
      {
        href: "/admin/ir/cash-flow",
        label: "현금흐름표",
        description: "공시 자료",
      },
    ],
  },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const name = user?.mb_name?.trim() || "관리자";

  return (
    <main className={styles.page}>
      <div className={styles.dashboardIntro}>
        <p className={styles.dashboardIntroEyebrow}>관리자 홈</p>
        <h1 className={styles.dashboardIntroTitle}>{name}님, 안녕하세요</h1>
        <p className={styles.dashboardIntroText}>
          이 페이지는 <strong>관리 메뉴로 들어가기 전 안내 화면</strong>입니다.
          왼쪽 사이드바에서도 동일한 메뉴를 열 수 있고, 아래는 자주 찾는
          작업으로 바로 이동합니다.
        </p>
      </div>

      {quickSections.map((section) => (
        <section key={section.title} className={styles.dashboardSection}>
          <h2 className={styles.dashboardSectionTitle}>{section.title}</h2>
          <div className={styles.linkCardGrid}>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.linkCard}
              >
                <span className={styles.linkCardLabel}>{item.label}</span>
                <span className={styles.linkCardMeta}>{item.description}</span>
                <span className={styles.linkCardArrow} aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
