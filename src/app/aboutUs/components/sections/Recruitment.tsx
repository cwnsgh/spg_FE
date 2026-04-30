"use client";

/** 회사소개 탭 3 채용(공고·지원 마법사 진입) — `AboutTabs.tsx`에서만 렌더. */
import {
  ApiError,
  getRecruitPostDetail,
  getRecruitPosts,
  type RecruitPostDetail,
  type RecruitPostListItem,
} from "@/api";
import RecruitPostDetailView from "@/components/recruit/RecruitPostDetailView";
import { useOverlayDismiss } from "@/hooks/useOverlayDismiss";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import RecruitApplyPanel from "./RecruitApplyPanel";
import RecruitStatusPanel from "./RecruitStatusPanel";
import styles from "./Recruitment.module.css";

const PAGE_SIZE = 12;

function formatLocationLabel(job: RecruitPostListItem): string {
  const positions = job.positions ?? [];
  if (positions.length === 0) return "직무";
  const jobs = positions.map((p) => p.job).filter(Boolean);
  if (jobs.length === 0) return "직무";
  if (jobs.length === 1) return jobs[0];
  return `${jobs[0]} 외`;
}

function canApplyByListStatus(status: string): boolean {
  if (status === "상시접수" || status === "접수중") return true;
  return status.startsWith("D-");
}

function buildPageList(totalPages: number, current: number): (number | "gap")[] {
  if (totalPages <= 1) return [1];
  if (totalPages <= 9) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const set = new Set<number>();
  set.add(1);
  set.add(totalPages);
  for (let p = current - 2; p <= current + 2; p++) {
    if (p >= 1 && p <= totalPages) set.add(p);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      out.push("gap");
    }
    out.push(sorted[i]);
  }
  return out;
}

export default function Recruitment() {
  const [activeSubTab, setActiveSubTab] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobPostings, setJobPostings] = useState<RecruitPostListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detail, setDetail] = useState<RecruitPostDetail | null>(null);
  const [applyPrefillWrId, setApplyPrefillWrId] = useState<number | null>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!detailOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;
    const gutter = window.innerWidth - html.clientWidth;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (gutter > 0) {
      body.style.paddingRight = `${gutter}px`;
    }

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
    };
  }, [detailOpen]);

  const subTabs = [
    { label: "모집안내", value: 0 },
    { label: "채용공고", value: 1 },
    { label: "입사지원", value: 2 },
    { label: "나의지원현황", value: 3 },
  ];

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

  const fetchJobList = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const res = await getRecruitPosts({ page: currentPage, rows: PAGE_SIZE });
      setJobPostings(res.list ?? []);
      const tp = res.pagination?.total_pages ?? 1;
      setTotalPages(Math.max(1, tp));
      if (currentPage > tp && tp >= 1) {
        setCurrentPage(tp);
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setListError(e.message);
      } else {
        setListError("채용공고를 불러오지 못했습니다.");
      }
      setJobPostings([]);
      setTotalPages(1);
    } finally {
      setListLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (activeSubTab !== 1) return;
    void fetchJobList();
  }, [activeSubTab, fetchJobList]);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setDetail(null);
    setDetailError("");
  }, []);

  const { handleOverlayMouseDown, handleOverlayClick } = useOverlayDismiss(closeDetail);

  const openDetail = useCallback(async (wrId: number) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const data = await getRecruitPostDetail(wrId);
      setDetail(data);
    } catch (e) {
      if (e instanceof ApiError) {
        setDetailError(e.message);
      } else {
        setDetailError("공고 상세를 불러오지 못했습니다.");
      }
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const pageItems = useMemo(
    () => buildPageList(totalPages, currentPage),
    [totalPages, currentPage]
  );

  const goApplyWithJob = useCallback((wrId: number) => {
    setApplyPrefillWrId(wrId);
    setActiveSubTab(2);
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.mainTitle}>채용정보</h2>

      <div className={styles.subTabs}>
        {subTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`${styles.subTab} ${
              activeSubTab === tab.value ? styles.active : ""
            }`}
            onClick={() => setActiveSubTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 0 && (
        <div className={styles.content}>
          <h3 className={styles.sectionTitle}>모집안내</h3>
          <section className={styles.section}>
            <h4 className={styles.subSectionTitle}>• 인사제도 방향</h4>
            <p className={styles.description}>
              임직원 개인의 능력에 따라 승급, 승격, 교육의 기회를 공평하게 가질 수 있는
              인사제도 채택으로 공정한 인사를 실시하고 있습니다.
            </p>
          </section>

          <section className={styles.section}>
            <h4 className={styles.subSectionTitle}>• 채용절차</h4>
            <div className={styles.description}>
              <p>
                당사의 채용 절차를 안내드립니다. 아래 전형 과정을 통해 지원자 여러분을 만나게
                됩니다.
              </p>
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

          <section className={styles.section}>
            <h4 className={styles.subSectionTitle}>• 접수 및 문의처</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <img
                  src="/images/aboutus/icon_map.png"
                  alt=""
                  className={styles.contactIcon}
                />
                <span>
                  인천광역시 남동구 청능대로 289번길 45 (고잔동, 남동공단 67B 12L), (우편번호
                  21633)
                </span>
              </div>
              <div className={styles.contactItem}>
                <img
                  src="/images/aboutus/icon_message.png"
                  alt=""
                  className={styles.contactIcon}
                />
                <span>hansh@spg.co.kr</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeSubTab === 1 && (
        <div className={styles.jobPostingContent}>
          <p className={styles.introText}>
            (주)에스피지를 이끌어 갈 인재를 모집합니다.
            <br />
            여러분의 지원을 기다리고 있습니다.
          </p>

          {listError && <p className={styles.recruitError}>{listError}</p>}
          {listLoading && <p className={styles.recruitLoading}>불러오는 중…</p>}

          {!listLoading && !listError && jobPostings.length === 0 && (
            <p className={styles.recruitEmpty}>표시할 채용공고가 없습니다.</p>
          )}

          <div className={styles.jobPostingGrid}>
            {jobPostings.map((job) => {
              const canApply = canApplyByListStatus(job.status);
              return (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobCardHeader}>
                    <span className={styles.statusLabel}>{job.status}</span>
                    {job.type ? (
                      <span className={styles.locationLabel}>{job.type}</span>
                    ) : (
                      <span className={styles.locationLabel}>
                        {formatLocationLabel(job)}
                      </span>
                    )}
                  </div>
                  <h3 className={styles.jobTitle}>{job.subject}</h3>
                  <p className={styles.jobPeriod}>{job.period}</p>
                  <div className={styles.jobCardActions}>
                    <button
                      type="button"
                      className={styles.detailButton}
                      onClick={() => void openDetail(job.id)}
                    >
                      상세보기
                    </button>
                    <button
                      type="button"
                      className={styles.applyButton}
                      disabled={!canApply}
                      onClick={() => goApplyWithJob(job.id)}
                    >
                      지원하기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={`${styles.paginationArrow} ${
                  currentPage === 1 ? styles.disabled : ""
                }`}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <Image src="/images/icon/first_ico.png" alt="맨 앞으로" width={13} height={13} />
              </button>
              <button
                type="button"
                className={`${styles.paginationArrow} ${
                  currentPage === 1 ? styles.disabled : ""
                }`}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <Image src="/images/icon/prev_ico.png" alt="이전" width={13} height={13} />
              </button>
              {pageItems.map((item, idx) =>
                item === "gap" ? (
                  <span key={`gap-${idx}`} className={styles.paginationGap}>
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={`${styles.paginationNumber} ${
                      currentPage === item ? styles.active : ""
                    }`}
                    onClick={() => setCurrentPage(item)}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                className={`${styles.paginationArrow} ${
                  currentPage === totalPages ? styles.disabled : ""
                }`}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <Image src="/images/icon/next_ico.png" alt="다음" width={13} height={13} />
              </button>
              <button
                type="button"
                className={`${styles.paginationArrow} ${
                  currentPage === totalPages ? styles.disabled : ""
                }`}
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <Image src="/images/icon/last_ico.png" alt="맨 뒤로" width={13} height={13} />
              </button>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 2 && (
        <RecruitApplyPanel
          initialWrId={applyPrefillWrId}
          onConsumedInitial={() => setApplyPrefillWrId(null)}
        />
      )}

      {activeSubTab === 3 && <RecruitStatusPanel />}

      {portalReady &&
        detailOpen &&
        createPortal(
          <div
            className={styles.detailModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="recruit-detail-title"
            onMouseDown={handleOverlayMouseDown}
            onClick={handleOverlayClick}
          >
            <div
              className={styles.detailModalInner}
              onMouseDown={(e) => e.stopPropagation()}
              role="document"
            >
              <div className={styles.detailModalHeader}>
                <h3 id="recruit-detail-title" className={styles.detailModalTitle}>
                  {detail?.subject ?? "채용공고"}
                </h3>
                <button
                  type="button"
                  className={styles.detailClose}
                  onClick={closeDetail}
                  aria-label="닫기"
                >
                  ×
                </button>
              </div>
              <div className={styles.detailModalBody}>
                {detailLoading && <p className={styles.recruitLoading}>불러오는 중…</p>}
                {detailError && <p className={styles.recruitError}>{detailError}</p>}
                {detail && !detailLoading ? (
                  <RecruitPostDetailView
                    detail={detail}
                    actions={
                      <div className={styles.detailModalActions}>
                        <button type="button" className={styles.detailButton} onClick={closeDetail}>
                          목록보기
                        </button>
                        <button
                          type="button"
                          className={styles.detailApplyRed}
                          disabled={!detail.can_apply}
                          onClick={() => {
                            closeDetail();
                            goApplyWithJob(detail.id);
                          }}
                        >
                          지원하기
                        </button>
                      </div>
                    }
                  />
                ) : null}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
