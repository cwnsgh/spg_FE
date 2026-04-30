/**
 * 연혁 플레이스홀더 섹션. `AboutTabs`는 `CompanyHistory`를 쓰므로 현재 라우트에서 import되지 않음.
 */
import styles from "./History.module.css";

export default function History() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>연혁</h2>
      <p className={styles.placeholder}>연혁 내용이 여기에 표시됩니다.</p>
    </div>
  );
}
