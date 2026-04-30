"use client";

/** 회사소개 탭 2 연혁(타임라인) — `AboutTabs.tsx`에서만 렌더. */
import { useState, useRef, useEffect } from "react";
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
      { year: 1973, description: "(주)성신 창립" },
      { year: 1978, description: "AC소형 정밀모터 생산" },
    ],
  },
  {
    decade: "1980's",
    events: [
      { year: 1988, description: "수출유공 동탑 산업훈장 수상" },
      { year: 1989, description: "기업부설연구소 설립<br>1천만불 수출의 탑 수상" },
    ],
  },
  {
    decade: "1990's",
    events: [
      { year: 1991, description: "명진전자 설립(과학기술처)<br>AC / DC / BLDC 기어드 모터 생산" },
      { year: 1992, description: "연구개발 전담부서 승인" },
      { year: 1993, description: "기술 집약형 중소기업 선정(과학기술처)" },
      { year: 1994, description: "표준 기어드모터 생산<br>(주)성신정공 상호 변경" },
      { year: 1995, description: "인천 남동공단 제 2공장 준공" },
      { year: 1996, description: "EM/UL 인증" },
      { year: 1997, description: "CE인증" },
      { year: 1998, description: "벤처기업 선정" },
      { year: 1999, description: "GE 우수협력업체 선정" },
    ],
  },
  {
    decade: "2000's",
    events: [
      { year: 2000, description: "(주)에스피지 상호 변경<br>ISO9001 인증<br>TUV 인증<br>GE 우수협력업체 선정" },
      { year: 2001, description: "양산 공장 준공" },
      { year: 2002, description: "KOSDAQ 등록<br>세계인류상품 선정<br>ISO14001 인증 획득<br>NT 인증<br>중국 청도 성신모터 유한공사 설립" },
      { year: 2003, description: "5천만불 수출의 탑 수상<br>제 2 공장 신축<br>SPG USA 미국법인 설립<br>CCC 인증" },
      { year: 2004, description: "SPG CHINA SUZHOU 유한공사 설립" },
      { year: 2006, description: "성신 비나 설립(베트남 호치민)" },
      { year: 2008, description: "베트남 제 2공장 설립" },
    ],
  },
  {
    decade: "2010's",
    events: [
      { year: 2010, description: "한국형 히든챔피언 기업 선정<br>코스닥시장 2년 연속 히든챔피언 기업 선정" },
      { year: 2014, description: "WORLD CLASS 300 기업 선정" },
      { year: 2016, description: "(주)에스피지와 (주)성신 합병" },
      { year: 2019, description: "초정밀 로봇감속기 생산" },
    ],
  },
];

const periodRanges = [
  { label: "1970 ~ 1990", start: 1970, end: 1990, decadeMatch: ["1970's", "1980's"] },
  { label: "2000 ~ 2009", start: 2000, end: 2009, decadeMatch: ["2000's"] },
  { label: "2010 ~ NOW", start: 2010, end: 9999, decadeMatch: ["2010's"] },
];

export default function CompanyHistory() {
  const [activePeriodIndex, setActivePeriodIndex] = useState(0);
  const [isFixed, setIsFixed] = useState(false);
  const periodRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const periodNavRef = useRef<HTMLElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);

  // 스크롤 이벤트로 periodNav 고정 처리
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !periodNavRef.current || !sidebarRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const headerHeight = 100; // 헤더 높이
      const shouldBeFixed = containerRect.top <= headerHeight;

      // 항상 sidebar의 너비를 먼저 계산 (깜빡임 방지)
      const sidebarWidth = sidebarRef.current.offsetWidth;
      
      // 항상 너비를 먼저 설정 (깜빡임 방지)
      periodNavRef.current.style.width = `${sidebarWidth}px`;
      
      if (shouldBeFixed) {
        // fixed 상태일 때
        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        periodNavRef.current.style.left = `${sidebarRect.left}px`;
        
        if (!isFixed) {
          setIsFixed(true);
        }
      } else {
        // 일반 상태로 돌아갈 때
        periodNavRef.current.style.left = "";
        
        if (isFixed) {
          setIsFixed(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    
    // 초기 너비 설정 (깜빡임 방지)
    const initWidth = () => {
      if (sidebarRef.current && periodNavRef.current) {
        const sidebarWidth = sidebarRef.current.offsetWidth;
        periodNavRef.current.style.width = `${sidebarWidth}px`;
      }
    };
    
    initWidth();
    handleScroll(); // 초기 상태 확인

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isFixed]);

  // Intersection Observer로 현재 보이는 섹션 감지
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    let activeEntries: { index: number; intersectionRatio: number }[] = [];

    const updateActivePeriod = () => {
      if (isScrollingRef.current || activeEntries.length === 0) return;

      // 가장 많이 보이는 섹션 찾기 (intersectionRatio가 가장 큰 것)
      const mostVisible = activeEntries.reduce((prev, current) =>
        current.intersectionRatio > prev.intersectionRatio ? current : prev
      );

      const currentDecade = historyData[mostVisible.index].decade;
      const matchingPeriodIndex = periodRanges.findIndex((range) =>
        range.decadeMatch.includes(currentDecade)
      );

      if (matchingPeriodIndex !== -1) {
        setActivePeriodIndex(matchingPeriodIndex);
      }
    };

    periodRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const existingIndex = activeEntries.findIndex((e) => e.index === index);
              if (existingIndex !== -1) {
                activeEntries[existingIndex].intersectionRatio = entry.intersectionRatio;
              } else {
                activeEntries.push({ index, intersectionRatio: entry.intersectionRatio });
              }
            } else {
              activeEntries = activeEntries.filter((e) => e.index !== index);
            }
          });

          // 디바운스로 업데이트 (성능 최적화)
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
          scrollTimeoutRef.current = setTimeout(updateActivePeriod, 100);
        },
        {
          root: null,
          rootMargin: "-20% 0px -20% 0px", // 화면 중앙 60% 영역에서 감지
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], // 더 정확한 intersectionRatio 계산
        }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // 버튼 클릭 시 해당 섹션으로 스크롤
  const handlePeriodClick = (periodIndex: number) => {
    const targetPeriod = periodRanges[periodIndex];

    // 해당 periodRange에 매칭되는 첫 번째 decade 섹션 찾기
    const targetDecadeIndex = historyData.findIndex((period) =>
      targetPeriod.decadeMatch.includes(period.decade)
    );

    if (targetDecadeIndex !== -1 && periodRefs.current[targetDecadeIndex]) {
      isScrollingRef.current = true;
      setActivePeriodIndex(periodIndex);

      // 스크롤 위치 계산
      const headerHeight = 100;
      const offset = 30;
      const element = periodRefs.current[targetDecadeIndex];
      
      if (element) {
        const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementTop - headerHeight - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }

      // 스크롤 완료 감지
      const handleScrollEnd = () => {
        isScrollingRef.current = false;
        window.removeEventListener("scroll", handleScrollEnd);
      };

      // 스크롤이 완료될 때까지 대기
      const maxWaitTime = setTimeout(() => {
        isScrollingRef.current = false;
        window.removeEventListener("scroll", handleScrollEnd);
      }, 2000);

      // 스크롤이 멈췄는지 감지
      let scrollTimer: NodeJS.Timeout;
      const checkScrollEnd = () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          isScrollingRef.current = false;
          clearTimeout(maxWaitTime);
          window.removeEventListener("scroll", checkScrollEnd);
        }, 150);
      };

      window.addEventListener("scroll", checkScrollEnd, { passive: true });
    }
  };

  return (
    <div
      ref={(el) => {
        containerRef.current = el;
      }}
      className={styles.container}
    >
      <h2 className={styles.title}>회사연혁</h2>

      <div className={styles.content}>
        {/* 왼쪽 사이드바 */}
        <aside
          ref={(el) => {
            sidebarRef.current = el;
          }}
          className={styles.sidebar}
        >
          <nav
            ref={(el) => {
              periodNavRef.current = el;
            }}
            className={`${styles.periodNav} ${isFixed ? styles.fixed : ""}`}
          >
            {periodRanges.map((period, index) => (
              <button
                key={index}
                className={`${styles.periodButton} ${
                  activePeriodIndex === index ? styles.active : ""
                }`}
                onClick={() => handlePeriodClick(index)}
              >
                {period.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* 오른쪽 메인 콘텐츠 */}
        <main className={styles.mainContent}>
          <div className={styles.timeline}>
            {historyData.map((period, periodIndex) => (
              <div
                key={periodIndex}
                ref={(el) => {
                  periodRefs.current[periodIndex] = el;
                }}
                className={styles.period}
              >
                <h3 className={styles.decade}>{period.decade}</h3>
                <div className={styles.events}>
                  {period.events.map((event, eventIndex) => (
                    <div key={eventIndex} className={styles.event}>
                      <span className={styles.year}>{event.year}</span>
                      <p
                        className={styles.description}
                        dangerouslySetInnerHTML={{ __html: event.description }}
                      />
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
