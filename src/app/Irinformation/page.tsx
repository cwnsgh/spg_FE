/**
 * IR 정보 페이지 (/Irinformation)
 *
 * IR(Investor Relations) 관련 정보를 보여주는 페이지입니다.
 * TODO: 시안 확정 후 컴포넌트 구조 추가 필요
 * - 현재는 기본 레이아웃만 구성되어 있음
 * - 향후 IR 관련 섹션들 추가 예정
 */
import styles from "./page.module.css";

export default function IRInformation() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.title}>IR Information</h1>
        <p className={styles.description}>IR 정보 페이지</p>
      </div>
    </main>
  );
}
