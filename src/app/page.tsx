import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <h1 className={styles.title}>SPG 사이트에 오신 것을 환영합니다</h1>
        <p className={styles.description}></p>
      </div>
    </main>
  );
}
