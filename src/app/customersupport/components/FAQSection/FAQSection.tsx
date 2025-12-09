import styles from "./FAQSection.module.css";

export default function FAQSection() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>FAQ</h2>
      <p className={styles.placeholder}>FAQ 내용이 여기에 표시됩니다.</p>
    </div>
  );
}
