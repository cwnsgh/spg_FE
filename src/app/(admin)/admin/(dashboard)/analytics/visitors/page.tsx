/** Next.js 페이지: 방문자 통계·로그 검색. URL `/admin/analytics/visitors` */
"use client";

import {
  ApiError,
  getAdminVisitStats,
  searchAdminVisits,
  type VisitSearchField,
  type VisitStatsListResponse,
  type VisitStatsResponse,
  type VisitStatsType,
} from "@/api";
import { useCallback, useMemo, useState } from "react";
import styles from "./page.module.css";

function defaultDateRange() {
  const to = new Date();
  const fr = new Date(to);
  fr.setDate(fr.getDate() - 7);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { fr_date: iso(fr), to_date: iso(to) };
}

const STAT_TYPES: { value: VisitStatsType; label: string }[] = [
  { value: "list", label: "상세 로그" },
  { value: "domain", label: "도메인" },
  { value: "browser", label: "브라우저" },
  { value: "os", label: "OS" },
  { value: "device", label: "기기" },
  { value: "hour", label: "시간대" },
  { value: "week", label: "요일" },
  { value: "year", label: "연도" },
  { value: "month", label: "월" },
  { value: "date", label: "일" },
];

const SEARCH_FIELDS: { value: VisitSearchField; label: string }[] = [
  { value: "vi_ip", label: "IP" },
  { value: "vi_referer", label: "접속경로(리퍼러)" },
  { value: "vi_date", label: "날짜" },
];

function isStatsList(res: VisitStatsResponse): res is VisitStatsListResponse {
  return res.type === "list";
}

export default function AdminVisitAnalyticsPage() {
  const initialDates = useMemo(() => defaultDateRange(), []);

  const [frDate, setFrDate] = useState(initialDates.fr_date);
  const [toDate, setToDate] = useState(initialDates.to_date);
  const [statType, setStatType] = useState<VisitStatsType>("list");
  const [domainSearch, setDomainSearch] = useState("");
  const [statsPage, setStatsPage] = useState(1);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [statsData, setStatsData] = useState<VisitStatsResponse | null>(null);

  const [searchField, setSearchField] = useState<VisitSearchField>("vi_ip");
  const [searchText, setSearchText] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchPayload, setSearchPayload] = useState<Awaited<
    ReturnType<typeof searchAdminVisits>
  > | null>(null);

  const loadStats = useCallback(
    async (listPage?: number) => {
      const page = statType === "list" ? (listPage ?? statsPage) : 1;
      setStatsLoading(true);
      setStatsError("");
      try {
        const res = await getAdminVisitStats({
          type: statType,
          page,
          fr_date: frDate,
          to_date: toDate,
          domain_search: statType === "list" ? domainSearch : undefined,
        });
        setStatsData(res);
        if (statType === "list" && listPage != null) {
          setStatsPage(listPage);
        }
      } catch (e) {
        setStatsData(null);
        setStatsError(e instanceof ApiError ? e.message : "집계를 불러오지 못했습니다.");
      } finally {
        setStatsLoading(false);
      }
    },
    [domainSearch, frDate, statType, statsPage, toDate]
  );

  const runVisitSearch = useCallback(async (page: number) => {
    setSearchLoading(true);
    setSearchError("");
    try {
      const res = await searchAdminVisits({
        sfl: searchText.trim() ? searchField : undefined,
        stx: searchText.trim() || undefined,
        page,
      });
      setSearchPage(page);
      setSearchPayload(res);
    } catch (e) {
      setSearchPayload(null);
      setSearchError(e instanceof ApiError ? e.message : "검색에 실패했습니다.");
    } finally {
      setSearchLoading(false);
    }
  }, [searchField, searchText]);

  const listColumns = useMemo(() => {
    if (!statsData || !isStatsList(statsData) || !statsData.data.length) {
      return ["vi_id", "vi_date", "vi_time", "vi_ip", "vi_referer", "vi_browser", "vi_os"];
    }
    const keys = new Set<string>();
    for (const row of statsData.data) {
      Object.keys(row).forEach((k) => keys.add(k));
    }
    const preferred = [
      "vi_id",
      "vi_date",
      "vi_time",
      "vi_ip",
      "vi_referer",
      "vi_browser",
      "vi_os",
      "vi_device",
    ];
    const rest = [...keys].filter((k) => !preferred.includes(k)).sort();
    return [...preferred.filter((k) => keys.has(k)), ...rest];
  }, [statsData]);

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1>접속 통계</h1>
        <p>
          접속 로그와 일·월별 집계를 조회합니다. 사이트에서 방문 기록이 쌓이도록 연동되어 있어야
          합니다.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="stats-heading">
        <h2 id="stats-heading" className={styles.sectionTitle}>
          접속 집계 · 로그
        </h2>
        <div className={styles.toolbar}>
          <div className={styles.field}>
            <label htmlFor="visit-fr">시작일</label>
            <input
              id="visit-fr"
              type="date"
              value={frDate}
              onChange={(e) => setFrDate(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="visit-to">종료일</label>
            <input
              id="visit-to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          {statType === "list" ? (
            <div className={styles.field}>
              <label htmlFor="visit-domain">리퍼러 검색 (선택)</label>
              <input
                id="visit-domain"
                value={domainSearch}
                onChange={(e) => setDomainSearch(e.target.value)}
                placeholder="도메인 일부"
              />
            </div>
          ) : null}
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              setStatsPage(1);
              void loadStats(1);
            }}
          >
            {statsLoading ? "불러오는 중…" : "조회"}
          </button>
        </div>

        <div className={styles.typeTabs} role="tablist" aria-label="통계 유형">
          {STAT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={statType === t.value}
              className={`${styles.typeTab} ${statType === t.value ? styles.typeTabActive : ""}`}
              onClick={() => {
                setStatType(t.value);
                setStatsPage(1);
                setStatsData(null);
                setStatsError("");
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {statsError ? <div className={styles.errorBox}>{statsError}</div> : null}

        {statsData && isStatsList(statsData) ? (
          <>
            <p className={styles.muted}>
              총 {statsData.total_count}건 · {statsData.current_page} / {statsData.total_page}페이지
            </p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {listColumns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {statsData.data.length === 0 ? (
                    <tr>
                      <td colSpan={listColumns.length} className={styles.muted}>
                        데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    statsData.data.map((row, i) => (
                      <tr key={String(row.vi_id ?? i)}>
                        {listColumns.map((col) => (
                          <td key={col}>
                            {row[col] != null && row[col] !== ""
                              ? String(row[col])
                              : "—"}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className={styles.pagination}>
              <button
                type="button"
                disabled={statsPage <= 1 || statsLoading}
                onClick={() => void loadStats(Math.max(1, statsPage - 1))}
              >
                이전
              </button>
              <span className={styles.muted}>{statsPage}</span>
              <button
                type="button"
                disabled={
                  statsLoading ||
                  !statsData.total_page ||
                  statsPage >= statsData.total_page
                }
                onClick={() =>
                  void loadStats(
                    statsData.total_page
                      ? Math.min(statsData.total_page, statsPage + 1)
                      : statsPage + 1
                  )
                }
              >
                다음
              </button>
            </div>
          </>
        ) : null}

        {statsData && !isStatsList(statsData) ? (
          <>
            <p className={styles.muted}>합계 {statsData.total_sum}건 (기간 내)</p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>구분</th>
                    <th>건수</th>
                    <th>비율(%)</th>
                  </tr>
                </thead>
                <tbody>
                  {statsData.data.length === 0 ? (
                    <tr>
                      <td colSpan={3} className={styles.muted}>
                        데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    statsData.data.map((row) => (
                      <tr key={row.name}>
                        <td>{row.name}</td>
                        <td>{row.cnt}</td>
                        <td>{row.rate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        <p className={styles.note}>
          통계 유형을 바꾼 뒤에는 <strong>조회</strong>를 눌러 불러옵니다. 상세 로그는 이전·다음
          페이지 시 자동으로 다시 조회됩니다.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="search-heading">
        <h2 id="search-heading" className={styles.sectionTitle}>
          접속자 검색
        </h2>
        <div className={styles.toolbar}>
          <div className={styles.field}>
            <label htmlFor="visit-sfl">필드</label>
            <select
              id="visit-sfl"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as VisitSearchField)}
            >
              {SEARCH_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="visit-stx">검색어</label>
            <input
              id="visit-stx"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="비우면 전체(페이징)"
            />
          </div>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => void runVisitSearch(1)}
          >
            {searchLoading ? "검색 중…" : "검색"}
          </button>
        </div>

        {searchError ? <div className={styles.errorBox}>{searchError}</div> : null}

        {searchPayload ? (
          <>
            <p className={styles.muted}>
              총 {searchPayload.pagination.total_records}건 ·{" "}
              {searchPayload.pagination.current_page} / {searchPayload.pagination.total_pages}페이지
            </p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>일자</th>
                    <th>시간</th>
                    <th>IP</th>
                    <th>리퍼러</th>
                    <th>브라우저</th>
                    <th>OS</th>
                    <th>기기</th>
                  </tr>
                </thead>
                <tbody>
                  {searchPayload.data.length === 0 ? (
                    <tr>
                      <td colSpan={8} className={styles.muted}>
                        결과가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    searchPayload.data.map((row) => (
                      <tr key={row.vi_id}>
                        <td>{row.vi_id}</td>
                        <td>{row.vi_date}</td>
                        <td>{row.vi_time}</td>
                        <td>{row.vi_ip}</td>
                        <td
                          style={{
                            maxWidth: "28rem",
                            wordBreak: "break-all",
                            whiteSpace: "normal",
                          }}
                        >
                          {row.vi_referer || "—"}
                        </td>
                        <td>{row.vi_browser}</td>
                        <td>{row.vi_os}</td>
                        <td>{row.vi_device}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className={styles.pagination}>
              <button
                type="button"
                disabled={searchPage <= 1 || searchLoading}
                onClick={() => void runVisitSearch(Math.max(1, searchPage - 1))}
              >
                이전
              </button>
              <span className={styles.muted}>{searchPage}</span>
              <button
                type="button"
                disabled={
                  searchLoading ||
                  searchPage >= searchPayload.pagination.total_pages
                }
                onClick={() =>
                  void runVisitSearch(
                    Math.min(searchPayload.pagination.total_pages, searchPage + 1)
                  )
                }
              >
                다음
              </button>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
