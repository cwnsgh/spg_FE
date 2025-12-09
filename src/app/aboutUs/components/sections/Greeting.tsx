import Image from "next/image";
import Breadcrumb from "../../../components/Breadcrumb";
import ceoImage from "../../../../assets/aboutus/about_ceo.png";
import styles from "./Greeting.module.css";

export default function Greeting() {
  const breadcrumbItems = [
    { label: "홈", href: "/" },
    { label: "회사소개", href: "/aboutUs" },
    { label: "인사말" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Breadcrumb items={breadcrumbItems} />
        <h2 className={styles.title}>인사말</h2>
        <div className={styles.mainContent}>
          <div className={styles.imageWrapper}>
            <Image
              src={ceoImage}
              alt="SPG 대표이사 여영길"
              className={styles.ceoImage}
              priority
            />
          </div>
          <div className={styles.textContent}>
            <div className={styles.leftColumn}>
              <p className={styles.introText}>SPG는 대한민국을 움직이는</p>
              <p className={styles.introText}>
                <span className={styles.gradientText}>
                  세계 최대의 기어드 모터 및 정밀 감속기 전문
                </span>{" "}
                기업입니다.
              </p>
            </div>
            <div className={styles.rightColumn}>
              <p>
                SPG는 대한민국을 대표하는 기어드 모터 및 정밀 모션 솔루션 전문
                기업으로,
                <br />
                수십 년간 축적된 기술력으로 소형·산업용·가정용 모터와 로봇용
                초정밀 감속기를 개발·생산합니다.
              </p>
              <p>
                스마트팩토리, 서비스 로봇, 자율주행 시스템 등 4차 산업혁명 핵심
                분야에 필요한
                <br />
                고성능 감속기와 모터를 자체 기술로 공급하며, 미래 산업의 동력을
                만들어갑니다.
              </p>
              <p>
                현재 40여 개국에 제품을 공급하며, 글로벌 고객과 함께 성장하며
                혁신 기술과 철저한 품질 경영으로
                <br />
                세계 시장에서 인정받는 글로벌 모션 솔루션 리더로 도약하고
                있습니다.
              </p>
              <p>
                앞으로도 SPG는 고객 감동과 가치 경영이라는 철학 아래, 고객의
                니즈를 먼저 생각하고,
                <br />
                최고의 서비스를 제공하는 기업으로 자리매김하겠습니다.
              </p>
              <p className={styles.thankYou}>감사합니다.</p>
              <p className={styles.signature}>에스피지 대표이사 여영길</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
