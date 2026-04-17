"use client";

import styles from "./TechnicalSection.module.css";

/**
 * 고객지원 > 기술자료 탭
 * — 콘텐츠·API 연동은 추후 확장 가능한 자리입니다.
 */
export default function TechnicalSection() {
  return (
    <section className={styles.section} aria-labelledby="technical-heading">
      <h2 id="technical-heading" className={styles.title}>
        기술자료
      </h2>
      <p className={styles.description}>
        기술자료 콘텐츠는 준비 중입니다. 필요한 자료는 제품문의를 통해
        문의해 주시기 바랍니다.
      </p>
    </section>
  );
}
