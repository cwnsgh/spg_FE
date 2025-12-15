"use client";

import { useState } from "react";
import styles from "./Recruitment.module.css";

export default function Recruitment() {
  const [activeSubTab, setActiveSubTab] = useState(1); // 채용공고를 기본값으로
  const [currentPage, setCurrentPage] = useState(1);

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
    { step: 2, title: "2차 실무면접" },
    { step: 3, title: "3차 경영진 면접" },
    { step: 4, title: "최종", isFinal: true },
  ];

  const requiredDocuments = [
    "사내 소정 양식 입사지원서",
    "최종학력 졸업증명서",
    "최종학력 성적증명서",
    "경력증명서(소재자에 한함)",
    "취업보호대상자 증명서(소재자에 한함)",
    "우대등록증 등",
  ];

  const benefits = [
    { icon: "💼", title: "주5일 근무" },
    { icon: "🎓", title: "학자금 지원" },
    { icon: "🍃", title: "4대보험 실시" },
    { icon: "👥", title: "장기근속" },
    { icon: "🏢", title: "휴양시설 운영" },
    { icon: "⭐", title: "기타" },
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
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>모집안내</h3>
            <h4 className={styles.subSectionTitle}>- 인사제도 방향</h4>
            <p className={styles.description}>
              SPG는 인재를 최고의 자산으로 생각하며, 역량 있는 인재에게는
              성장과 승진, 교육의 기회를 제공합니다. 개인의 능력과 성과에 따라
              공정하게 평가하고 보상하며, 함께 성장하는 기업 문화를 만들어
              나가고 있습니다.
            </p>
          </section>

          {/* 채용절차 */}
          <section className={styles.section}>
            <h4 className={styles.subSectionTitle}>- 채용절차</h4>
            <p className={styles.description}>
              SPG의 채용 절차는 공정하고 투명하게 진행되며, 각 단계별로
              체계적인 평가를 통해 최적의 인재를 선발합니다.
            </p>
            <div className={styles.recruitmentProcess}>
              {recruitmentSteps.map((item, index) => (
                <div key={index} className={styles.processStep}>
                  {index > 0 && (
                    <div className={styles.arrow}>→</div>
                  )}
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
          </section>

          {/* 제출서류 */}
          <section className={styles.section}>
            <h4 className={styles.subSectionTitle}>- 제출서류</h4>
            <div className={styles.documentsList}>
              {requiredDocuments.map((doc, index) => (
                <div key={index} className={styles.documentItem}>
                  {doc}
                </div>
              ))}
            </div>
          </section>

          {/* 복리후생 */}
          <section className={styles.section}>
            <h4 className={styles.subSectionTitle}>- 복리후생</h4>
            <div className={styles.benefitsGrid}>
              {benefits.map((benefit, index) => (
                <div key={index} className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>{benefit.icon}</div>
                  <div className={styles.benefitTitle}>{benefit.title}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 접수 및 문의처 */}
          <section className={styles.section}>
            <h4 className={styles.subSectionTitle}>- 접수 및 문의처</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📍</span>
                <span>
                  인천광역시 남동구 남동서로 208번길 45 (고잔동, 남동공단 8블럭
                  12L), 199번지 21B2L
                </span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>✉️</span>
                <span>hanwh@spg.co.kr</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 채용공고 콘텐츠 */}
      {activeSubTab === 1 && (
        <div className={styles.jobPostingContent}>
          <p className={styles.introText}>
            (주)에스피지를 이끌어 갈 인재를 모집합니다. 여러분의 지원을
            기다리고 있습니다.
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
              className={styles.paginationArrow}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              &lt;
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
              className={styles.paginationArrow}
              onClick={() => setCurrentPage((prev) => Math.min(5, prev + 1))}
              disabled={currentPage === 5}
            >
              &gt;
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
