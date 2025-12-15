"use client";

import { useState } from "react";
import styles from "./CompanyHistory.module.css";

interface HistoryEvent {
  year: number;
  description: string;
}

interface HistoryPeriod {
  decade: string;
  events: HistoryEvent[];
}

const historyData: HistoryPeriod[] = [
  {
    decade: "1970's",
    events: [
      { year: 1973, description: "회사 설립" },
      { year: 1979, description: "본격적인 사업 확장" },
    ],
  },
  {
    decade: "1980's",
    events: [
      { year: 1988, description: "기술 혁신 및 제품 개발" },
      { year: 1989, description: "해외 시장 진출" },
    ],
  },
  {
    decade: "1990's",
    events: [
      { year: 1991, description: "신제품 라인업 확대" },
      { year: 1992, description: "품질 인증 획득" },
      { year: 1993, description: "생산 시설 확장" },
      { year: 1994, description: "연구개발 센터 설립" },
      { year: 1995, description: "국내 시장 점유율 확대" },
      { year: 1996, description: "기술 파트너십 체결" },
      { year: 1997, description: "신기술 개발 완료" },
      { year: 1998, description: "해외 지사 설립" },
      { year: 1999, description: "글로벌 네트워크 구축" },
    ],
  },
  {
    decade: "2000's",
    events: [
      { year: 2000, description: "TVS 인증 획득 및 신제품 출시" },
      { year: 2001, description: "기술 혁신 및 특허 등록" },
      { year: 2002, description: "KOSDAQ 상장 및 기업 가치 향상" },
      { year: 2003, description: "글로벌 시장 진출 확대" },
      { year: 2004, description: "신기술 개발 및 특허 확보" },
      { year: 2005, description: "생산 능력 증대" },
      { year: 2006, description: "품질 경영 시스템 구축" },
    ],
  },
  {
    decade: "2010's",
    events: [
      { year: 2013, description: "기술 혁신 및 신제품 개발" },
      { year: 2014, description: "WORLD CLASS 인증 획득" },
      { year: 2015, description: "글로벌 시장 확대" },
      { year: 2019, description: "미래 기술 개발 착수" },
    ],
  },
];

const periodRanges = [
  { label: "1970-1990", start: 1970, end: 1990 },
  { label: "2000-2004", start: 2000, end: 2004 },
  { label: "2005-2009", start: 2005, end: 2009 },
  { label: "2010-NOW", start: 2010, end: 9999 },
];

export default function CompanyHistory() {
  const [selectedPeriod, setSelectedPeriod] = useState(periodRanges[0]);

  // 선택된 기간에 해당하는 이벤트 필터링
  const filteredHistory = historyData.filter((period) => {
    const periodStart = parseInt(period.decade.split("'")[0]);
    return (
      periodStart >= selectedPeriod.start && periodStart <= selectedPeriod.end
    );
  });

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 왼쪽 사이드바 */}
        <aside className={styles.sidebar}>
          <nav className={styles.periodNav}>
            {periodRanges.map((period, index) => (
              <button
                key={index}
                className={`${styles.periodButton} ${
                  selectedPeriod.label === period.label ? styles.active : ""
                }`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* 오른쪽 메인 콘텐츠 */}
        <main className={styles.mainContent}>
          <h2 className={styles.title}>회사연혁</h2>
          <div className={styles.timeline}>
            {filteredHistory.map((period, periodIndex) => (
              <div key={periodIndex} className={styles.period}>
                <h3 className={styles.decade}>{period.decade}</h3>
                <div className={styles.events}>
                  {period.events.map((event, eventIndex) => (
                    <div key={eventIndex} className={styles.event}>
                      <span className={styles.year}>{event.year}</span>
                      <p className={styles.description}>{event.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
