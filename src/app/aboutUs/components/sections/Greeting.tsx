import styles from "./Greeting.module.css";

export default function Greeting() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>인사말</h2>
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.imagePlaceholder}>
            <p>대표이사 사진</p>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.intro}>
            <p className={styles.introText}>
              <strong>SPG는 대한민국을 움직이는</strong>
            </p>
            <p className={styles.introText}>
              세계 최대의 기어드 모터 및 정밀 감속기 전문 기업입니다.
            </p>
          </div>
          <div className={styles.message}>
            <p>
              안녕하십니까. SPG 대표이사입니다. 저희 회사는 고객 만족을
              최우선으로 생각하며, 최고 품질의 제품을 제공하기 위해 노력하고
              있습니다.
            </p>
            <p>
              앞으로도 고객 여러분의 신뢰에 보답하겠습니다. 감사합니다.
            </p>
            <p className={styles.signature}>에스피지 대표이사 여행길</p>
          </div>
        </div>
      </div>
    </div>
  );
}


