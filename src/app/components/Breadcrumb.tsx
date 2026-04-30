/**
 * Breadcrumb 컴포넌트 — `HeroBanner`와 함께 aboutUs·marketing 등에서 사용.
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
  /** 히어로 `titleEn` 과 맞춘 보조 영문(없으면 생략) */
  labelEn?: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

function CrumbText({
  label,
  labelEn,
}: {
  label: string;
  labelEn?: string;
}) {
  return (
    <span className={styles.crumbInner}>
      <span className={styles.labelKo}>{label}</span>
      {labelEn?.trim() ? (
        <span className={styles.labelEn}>{labelEn.trim()}</span>
      ) : null}
    </span>
  );
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className={styles.breadcrumb} aria-label="breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <Link
                href={item.href}
                aria-label={
                  item.labelEn?.trim()
                    ? `${item.label} ${item.labelEn.trim()}`
                    : item.label
                }
              >
                {item.label === "홈" ? (
                  <span className={styles.homeLink}>
                    <Image
                      src="/images/icon/home_ico.png"
                      alt=""
                      width={16}
                      height={16}
                      className={styles.homeIcon}
                    />
                  </span>
                ) : (
                  <CrumbText label={item.label} labelEn={item.labelEn} />
                )}
              </Link>
            ) : (
              <span className={styles.current}>
                <CrumbText label={item.label} labelEn={item.labelEn} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
