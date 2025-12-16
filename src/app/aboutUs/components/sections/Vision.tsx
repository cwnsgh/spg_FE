import styles from "./Vision.module.css";

export default function Vision() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>경영이념 및 비전</h2>
      {/* Our Philosophy 섹션 */}
      <section className={styles.philosophy}>
        <h3 className={styles.philosophyTitle}>Our Philosophy</h3>
        <p className={styles.philosophyText}>
          고객에게 언제나 정성을 다하는 자세를 기업이념으로 하고 고객 감동을
          위한
          <br />
          경영방침 및 경영목표를 바탕으로 고품격의 제품을 생산하여 고객만족을
          만들어 갈 것 입니다.
        </p>
      </section>

      {/* Core Value 섹션 */}
      <section className={styles.coreValue}>
        <img src="/images/aboutus/vision/main_pic.png" alt="Core Value" />
      </section>

      {/* Vision 섹션 */}
      <section className={styles.vision}>
        <div className={styles.visionHeader}>
          <h3 className={styles.visionTitle}>Vision</h3>
          <p className={styles.visionSubtitle}>
            세계 최대의 기어드모터 및 정밀감속기 전문기업
          </p>
        </div>

        <div className={styles.visionCards}>
          <div className={styles.visionCard}>
            <div
              className={styles.cardImage}
              style={{
                backgroundImage: "url('/images/aboutus/vision/pic_1.png')",
              }}
            >
              <div className={styles.cardContent}>
                <div className={styles.cardNumber}>01</div>
                <div className={styles.cardUnderline}></div>
                <h4 className={styles.cardTitle}>신제품개발, 수출확대</h4>
              </div>
            </div>
          </div>

          <div className={styles.visionCard}>
            <div
              className={styles.cardImage}
              style={{
                backgroundImage: "url('/images/aboutus/vision/pic_2.png')",
              }}
            >
              <div className={styles.cardContent}>
                <div className={styles.cardNumber}>02</div>
                <div className={styles.cardUnderline}></div>
                <h4 className={styles.cardTitle}>
                  주주, 고객, 임직원 중심의
                  <br />
                  경영이념 확립
                </h4>
              </div>
            </div>
          </div>

          <div className={styles.visionCard}>
            <div
              className={styles.cardImage}
              style={{
                backgroundImage: "url('/images/aboutus/vision/pic_3.png')",
              }}
            >
              <div className={styles.cardContent}>
                <div className={styles.cardNumber}>03</div>
                <div className={styles.cardUnderline}></div>
                <h4 className={styles.cardTitle}>
                  세계적인 품질 경쟁력과 <br />
                  R&D 기술력 보유
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
