/**
 * Breadcrumb 컴포넌트
 *
 * 페이지 경로를 표시하는 브레드크럼 네비게이션입니다.
 * 사용 예시:
 * <Breadcrumb items={[
 *   { label: "홈", href: "/" },
 *   { label: "회사소개", href: "/aboutUs" },
 *   { label: "인사말" }
 * ]} />
 */
import Link from "next/link";
import styles from "./Breadcrumb.module.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className={styles.breadcrumb}>
      {items.map((item, index) => (
        <span key={index} className={styles.item}>
          {item.href ? (
            <Link href={item.href} className={styles.link}>
              {item.label}
            </Link>
          ) : (
            <span className={styles.current}>{item.label}</span>
          )}
          {index < items.length - 1 && (
            <span className={styles.separator}> &gt; </span>
          )}
        </span>
      ))}
    </nav>
  );
}
