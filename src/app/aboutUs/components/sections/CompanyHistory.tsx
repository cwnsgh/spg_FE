import styles from "./CompanyHistory.module.css";

export default function CompanyHistory() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>회사연혁</h2>
      <p className={styles.placeholder}>회사연혁 내용이 여기에 표시됩니다.</p>
    </div>
  );
}

