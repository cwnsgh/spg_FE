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
import Image from "next/image";
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
    <nav className={styles.breadcrumb} aria-label="breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <Link href={item.href} aria-label={item.label}>
                {item.label === "홈" ? (
                  <Image
                    src="/images/icon/home_ico.png"
                    alt="홈"
                    width={16}
                    height={16}
                  />
                ) : (
                  item.label
                )}
              </Link>
            ) : (
              <span className={styles.current}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
