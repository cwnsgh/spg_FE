"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./page.module.css";

const sectionCards = [
  {
    title: "제품소개",
    description: "제품 카테고리와 상세 소개 콘텐츠를 정리하는 영역",
  },
  {
    title: "마케팅",
    description: "대리점/지사/프랜차이즈 등록과 노출 관리 중심 영역",
  },
  {
    title: "고객지원",
    description: "FAQ·채용공고·문의 설정 등 고객지원 운영 영역",
  },
  {
    title: "IR정보",
    description: "재무상태표, 손익계산서, 현금흐름표 관리 영역",
  },
  {
    title: "회사소개",
    description: "회사 정보, 콘텐츠, 팝업을 운영하는 영역",
  },
];

const marketingTasks = [
  "프랜차이즈 업체 등록 폼 구성",
  "목록 조회 및 검색/필터 구조 준비",
  "수정/삭제 액션 버튼 레이아웃 정리",
];

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <main className={styles.page}>
      <section className={styles.mainGrid}>
        <article className={`${styles.panel} ${styles.widePanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelEyebrow}>Priority</p>
              <h4 className={styles.panelTitle}>
                마케팅 {" > "} 프랜차이즈 관리
              </h4>
            </div>
            <Link
              href="/admin/marketing/franchise"
              className={styles.panelLink}
            >
              페이지 바로가기
            </Link>
          </div>

          <div className={styles.focusCard}>
            <div className={styles.focusBadge}>CRUD</div>
            <h5 className={styles.focusTitle}>
              프랜차이즈 업체 등록, 수정, 삭제
            </h5>
            <p className={styles.focusDescription}>
              `www/api/admin/franchise.php`를 기준으로 관리자에서 가장 먼저 붙일
              실무 화면입니다. 목록, 상태, 액션 영역을 분리해서 확장하기 쉽게
              시작합니다.
            </p>

            <ul className={styles.quickList}>
              {marketingTasks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </article>
      </section>
    </main>
  );
}
