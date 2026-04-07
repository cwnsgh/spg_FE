"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./layout.module.css";

interface AdminMenuItem {
  label: string;
  href?: string;
  description: string;
}

const adminMenuGroups: { title: string; items: AdminMenuItem[] }[] = [
  {
    title: "메인",
    items: [
      { label: "대시보드", description: "전체 운영 현황", href: "/admin" },
    ],
  },
  {
    title: "제품소개",
    items: [
      { label: "제품 카테고리", description: "상품/카테고리 구조" },
      { label: "제품 콘텐츠", description: "상세 소개 관리" },
    ],
  },
  {
    title: "마케팅",
    items: [
      {
        label: "프랜차이즈 관리",
        description: "등록 / 수정 / 삭제",
        href: "/admin/marketing/franchise",
      },
      { label: "인기검색어", description: "populars / ranks" },
    ],
  },
  {
    title: "고객지원",
    items: [
      {
        label: "게시판 관리",
        description: "boards / groups / category",
        href: "/admin/customersupport/boards",
      },
      // {
      //   label: "문의 설정",
      //   description: "qa_config",
      //   href: "/admin/customersupport/qa-config",
      // },
      {
        label: "FAQ 관리",
        description: "faqs / faq_master",
        href: "/admin/customersupport/faq",
      },
      {
        label: "채용 지원자",
        description: "g5_recurit · applications",
        href: "/admin/customersupport/recruit",
      },
      { label: "문의 설정", description: "qa_config" },
      // { label: "FAQ 관리", description: "faqs / faq_master" },
    ],
  },
  {
    title: "IR정보",
    items: [
      {
        label: "IR공고",
        description: "ir_notice posts",
        href: "/admin/ir/announcement",
      },
      {
        label: "IR콘텐츠",
        description: "ir_content posts",
        href: "/admin/ir/content",
      },
      {
        label: "IR행사",
        description: "ir_event posts",
        href: "/admin/ir/event",
      },
      {
        label: "재무상태표",
        description: "financial_statement",
        href: "/admin/ir/financial-statement",
      },
      {
        label: "손익계산서",
        description: "income_statement",
        href: "/admin/ir/income-statement",
      },
      {
        label: "현금흐름표",
        description: "cash_flow",
        href: "/admin/ir/cash-flow",
      },
    ],
  },
  {
    title: "회사소개",
    items: [
      { label: "회사 정보", description: "company" },
      { label: "콘텐츠 관리", description: "contents" },
      { label: "팝업 관리", description: "popup" },
    ],
  },
];

function isItemActive(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/admin") return pathname === href;
  return pathname.startsWith(href);
}

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isLoading, user, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, isLoading, router, user]);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
    router.refresh();
  };

  const currentMenuItem =
    adminMenuGroups
      .flatMap((group) => group.items)
      .find((item) => isItemActive(pathname, item.href)) ??
    adminMenuGroups[0].items[0];

  if (isLoading || !user || !isAdmin) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.loadingCard}>
          관리자 권한을 확인하는 중입니다.
        </div>
      </main>
    );
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <nav className={styles.nav}>
          {adminMenuGroups.map((group) => (
            <div key={group.title} className={styles.navGroup}>
              <p className={styles.navGroupTitle}>{group.title}</p>
              <ul className={styles.navList}>
                {group.items.map((item) => {
                  const isActive = isItemActive(pathname, item.href);

                  return (
                    <li key={`${group.title}-${item.label}`}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                        >
                          <span className={styles.navItemLabel}>
                            {item.label}
                          </span>
                          <span className={styles.navItemMeta}>
                            {item.description}
                          </span>
                        </Link>
                      ) : (
                        <div className={`${styles.navItem} ${styles.disabled}`}>
                          <span className={styles.navItemLabel}>
                            {item.label}
                          </span>
                          <span className={styles.navItemMeta}>
                            {item.description}
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className={styles.main}>
        <div className={styles.topbar}>
          <div>
            <p className={styles.topbarEyebrow}>Administrator</p>
            <h2 className={styles.topbarTitle}>{currentMenuItem.label}</h2>
            <p className={styles.topbarDescription}>
              {currentMenuItem.description}
            </p>
          </div>

          <div className={styles.topbarActions}>
            <div className={styles.quickLinks}>
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                className={styles.previewButton}
              >
                사이트 홈
              </Link>
            </div>
            <div className={styles.userBox}>
              <span className={styles.userName}>{user.mb_name}</span>
              <span className={styles.userMeta}>{user.mb_id}</span>
            </div>
            <button
              type="button"
              className={styles.logoutButton}
              onClick={() => void handleLogout()}
            >
              로그아웃
            </button>
          </div>
        </div>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
