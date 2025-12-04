import styles from "./Directions.module.css";

export default function Directions() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>찾아오시는 길</h2>
      <p className={styles.placeholder}>
        찾아오시는 길 내용이 여기에 표시됩니다.
      </p>
    </div>
  );
}


