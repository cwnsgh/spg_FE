import Breadcrumb from "../../../components/Breadcrumb";
import styles from "./Vision.module.css";

export default function Vision() {
  const breadcrumbItems = [
    { label: "홈", href: "/" },
    { label: "회사소개", href: "/aboutUs" },
    { label: "경영이념 및 비전" },
  ];

  return (
    <div className={styles.container}>
      <Breadcrumb items={breadcrumbItems} />
      {/* Our Philosophy 섹션 */}
      <section className={styles.philosophy}>
        <h3 className={styles.philosophyTitle}>Our Philosophy</h3>
        <p className={styles.philosophyText}>
          고객에게 언제나 정성을 다하는 자세를 가<br />
          고객감동을 위한 경쟁력있는 제품을 생산하여 고객만족을 만들어갈
          것입니다.
        </p>
      </section>

      {/* Core Value 섹션 */}
      <section className={styles.coreValue}>
        {/* 배경 패턴 */}
        <div className={styles.backgroundPattern}></div>

        {/* 중앙 다이아몬드 */}
        <div className={styles.coreValueCenter}>
          <div className={styles.centerDiamond}>
            <p className={styles.centerTitle}>Core Value</p>
            <p className={styles.centerSubtitle}>핵심가치</p>
            {/* 중앙 다이아몬드 각 변 중앙에서 나가는 점선 */}
            <div className={styles.centerDashedLineTop}></div>
            <div className={styles.centerDashedLineRight}></div>
            <div className={styles.centerDashedLineBottom}></div>
            <div className={styles.centerDashedLineLeft}></div>
          </div>
        </div>

        {/* 고객만족 - Top Left */}
        <div className={`${styles.valueItem} ${styles.topLeft}`}>
          <div className={styles.valueIconDiamond}>
            <div className={styles.iconCustomer}>
              <span className={styles.smileMouth}></span>
            </div>
            <div className={styles.solidLineLeft}></div>
          </div>
          <div className={styles.valueTextBlock}>
            <h4 className={styles.valueTitle}>고객만족</h4>
            <p className={styles.valueDescription}>
              최고의 품질과 최상의 서비스를 제공함으로써 고객을 최우선으로 두는
              고객 감동의 기업 문화를 조성합니다.
            </p>
          </div>
        </div>

        {/* 주주만족 - Top Right */}
        <div className={`${styles.valueItem} ${styles.topRight}`}>
          <div className={styles.valueTextBlock}>
            <h4 className={styles.valueTitle}>주주만족</h4>
            <p className={styles.valueDescription}>
              효율적이고 투명한 경영으로 건전성을 확보하고, 기업의 가치를
              향상시켜 주주의 건전한 이익을 극대화합니다.
            </p>
          </div>
          <div className={styles.valueIconDiamond}>
            <div className={styles.iconShareholder}></div>
            <div className={styles.solidLineRight}></div>
          </div>
        </div>

        {/* 사원만족 - Bottom Left */}
        <div className={`${styles.valueItem} ${styles.bottomLeft}`}>
          <div className={styles.valueIconDiamond}>
            <div className={styles.iconEmployee}></div>
            <div className={styles.solidLineLeft}></div>
          </div>
          <div className={styles.valueTextBlock}>
            <h4 className={styles.valueTitle}>사원만족</h4>
            <p className={styles.valueDescription}>
              임직원의 존엄과 가치를 인식하고 존중하며, 공정한 기회를 통해
              정당하게 보상한다.
            </p>
          </div>
        </div>

        {/* 가치경영 - Bottom Right */}
        <div className={`${styles.valueItem} ${styles.bottomRight}`}>
          <div className={styles.valueTextBlock}>
            <h4 className={styles.valueTitle}>가치경영</h4>
            <p className={styles.valueDescription}>
              고객/주주/사원의 가치 제고와 지속적 수익성과 가치 창출
            </p>
          </div>
          <div className={styles.valueIconDiamond}>
            <div className={styles.iconValue}></div>
            <div className={styles.solidLineRight}></div>
          </div>
        </div>
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
                  주주, 고객, 임직원 중심의 경영이념 확립
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
                  세계적인 품질 경쟁력과 R&D 기술력 보유
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
