import styles from "./Customers.module.css";

export default function Customers() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>주요고객사</h2>
      <p className={styles.placeholder}>
        주요고객사 내용이 여기에 표시됩니다.
      </p>
    </div>
  );
}

