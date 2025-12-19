"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Recruitment.module.css";

export default function Recruitment() {
  const [activeSubTab, setActiveSubTab] = useState(1); // 채용공고를 기본값으로
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5; // 전체 페이지 수

  const subTabs = [
    { label: "모집안내", value: 0 },
    { label: "채용공고", value: 1 },
    { label: "입사지원", value: 2 },
    { label: "나의지원현황", value: 3 },
  ];

  // 채용공고 데이터 (예시)
  const jobPostings = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    status: "상시접수",
    location: i % 3 === 0 ? "무관" : i % 3 === 1 ? "부산" : "성수",
    title: "2025년 신입/경력사원 채용(상시)",
    period: "2025-01-01 - 2025-12-31",
  }));

  const recruitmentSteps = [
    { step: 1, title: "1차 서류전형" },
    { step: 2, title: "2차 실무진 면접" },
    { step: 3, title: "3차 경영진 면접" },
    { step: 4, title: "채용", isFinal: true },
  ];

  const requiredDocuments = [
    "당사 소정 양식의 입사지원서",
    "자격증사본(소지자에 한함)",
    "최종학력 졸업증명서",
    "공인 어학성적표(소지자에 한함)",
    "최종학력 성적증명서",
    "주민등록등본 1통",
  ];

  const benefits = [
    { icon: "/images/aboutus/icon_1.png", title: "주5일 근무" },
    { icon: "/images/aboutus/icon_2.png", title: "자녀 학자금 지원" },
    { icon: "/images/aboutus/icon_4.png", title: "4대보험 실시" },
    { icon: "/images/aboutus/icon_3.png", title: "장기근속" },
    { icon: "/images/aboutus/icon_5.png", title: "휴양시설 운영" },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.mainTitle}>채용정보</h2>

      {/* 서브 탭 */}
      <div className={styles.subTabs}>
        {subTabs.map((tab) => (
          <button
            key={tab.value}
            className={`${styles.subTab} ${
              activeSubTab === tab.value ? styles.active : ""
            }`}
            onClick={() => setActiveSubTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 모집안내 콘텐츠 */}
      {activeSubTab === 0 && (
        <div className={styles.content}>
          {/* 인사제도 방향 */}
          <h3 className={styles.sectionTitle}>모집안내</h3>
          <section className={styles.section}>
            <h4 className={styles.subSectionTitle}>• 인사제도 방향</h4>
            <p className={styles.description}>임직원 개인의 능력에 따라 승급, 승격, 교육의 기회를 공평하게 가질 수 있는 인사제도 채택으로 공정한 인사를 실시하고 있습니다.</p>
          </section>

          {/* 채용절차 */}
          <section className={styles.section}>
            <h4 className={styles.subSectionTitle}>• 채용절차</h4>
            <div className={styles.description}>
              <p>당사의 채용 절차를 안내드립니다. 아래 전형 과정을 통해 지원자 여러분을 만나게 됩니다.</p>
              <div className={styles.recruitmentProcess}>
                {recruitmentSteps.map((item, index) => (
                  <div key={index} className={styles.processStep}>
                    <div
                      className={`${styles.stepCircle} ${
                        item.isFinal ? styles.finalStep : ""
                      }`}
                    >
                      <span className={styles.stepNumber}>STEP {item.step}</span>
                      <span className={styles.stepTitle}>{item.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 제출서류 */}
          <section className={styles.section}>
            <h4 className={styles.subSectionTitle}>• 제출서류</h4>
            <div className={styles.documentsList}>
              {requiredDocuments.map((doc, index) => (
                <div key={index} className={styles.documentItem}>
                  - {doc}
                </div>
              ))}
            </div>
          </section>

          {/* 복리후생 */}
          <section className={styles.section}>
            <h4 className={styles.subSectionTitle}>• 복리후생</h4>
            <div className={styles.benefitsGrid}>
              {benefits.map((benefit, index) => (
                <div key={index} className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>
                    <img src={benefit.icon} alt={benefit.title} />
                  </div>
                  <div className={styles.benefitTitle}>{benefit.title}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 접수 및 문의처 */}
          <section className={styles.section}>
            <h4 className={styles.subSectionTitle}>• 접수 및 문의처</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <img
                  src="/images/aboutus/icon_map.png"
                  alt="이메일"
                  className={styles.contactIcon}
                />
                <span>
                  인천광역시 남동구 청능대로 289번길 45 (고잔동, 남동공단 67B 12L), (우편번호 21633)
                </span>
              </div>
              <div className={styles.contactItem}>
                <img
                  src="/images/aboutus/icon_message.png"
                  alt="이메일"
                  className={styles.contactIcon}
                />
                <span>hansh@spg.co.kr</span>
              </div>
            </div>
          </section>
          {/* <img
            src="/images/aboutus/main_2.png"
            alt="모집안내"
            className={styles.tempImage}
          /> */}
        </div>
      )}

      {/* 채용공고 콘텐츠 */}
      {activeSubTab === 1 && (
        <div className={styles.jobPostingContent}>
          <p className={styles.introText}>
            (주)에스피지를 이끌어 갈 인재를 모집합니다.<br/>여러분의 지원을 기다리고
            있습니다.
          </p>

          <div className={styles.jobPostingGrid}>
            {jobPostings.map((job) => (
              <div key={job.id} className={styles.jobCard}>
                <div className={styles.jobCardHeader}>
                  <span className={styles.statusLabel}>{job.status}</span>
                  <span className={styles.locationLabel}>{job.location}</span>
                </div>
                <h3 className={styles.jobTitle}>{job.title}</h3>
                <p className={styles.jobPeriod}>{job.period}</p>
                <div className={styles.jobCardActions}>
                  <button className={styles.detailButton}>상세보기</button>
                  <button className={styles.applyButton}>지원하기</button>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          <div className={styles.pagination}>
            <button
              className={`${styles.paginationArrow} ${
                currentPage === 1 ? styles.disabled : ""
              }`}
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <Image src="/images/icon/first_ico.png" alt="맨 앞으로" width={13} height={13} />
            </button>
            <button
              className={`${styles.paginationArrow} ${
                currentPage === 1 ? styles.disabled : ""
              }`}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <Image src="/images/icon/prev_ico.png" alt="앞으로" width={13} height={13} />
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={`${styles.paginationNumber} ${
                  currentPage === page ? styles.active : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className={`${styles.paginationArrow} ${
                currentPage === totalPages ? styles.disabled : ""
              }`}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <Image src="/images/icon/next_ico.png" alt="뒤로" width={13} height={13} />
            </button>
            <button
              className={`${styles.paginationArrow} ${
                currentPage === totalPages ? styles.disabled : ""
              }`}
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <Image src="/images/icon/last_ico.png" alt="맨 뒤로" width={13} height={13} />
            </button>
          </div>
        </div>
      )}

      {/* 입사지원, 나의지원현황은 추후 구현 */}
      {activeSubTab !== 0 && activeSubTab !== 1 && (
        <div className={styles.placeholder}>
          {subTabs[activeSubTab].label} 내용이 여기에 표시됩니다.
        </div>
      )}
    </div>
  );
}
