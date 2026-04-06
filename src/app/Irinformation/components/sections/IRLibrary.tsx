"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError, getFinancials, IrFinancialRow } from "@/api";
import styles from "./IRLibrary.module.css";

type TabType = "balance" | "income" | "cashflow";

interface TableRow {
  item: string;
  q1: string | null;
  q2: string | null;
  q3: string | null;
  q4: string | null;
}

const TAB_CONFIG: Record<TabType, { label: string; apiType: 1 | 2 | 3 }> = {
  balance: { label: "재무상태표", apiType: 1 },
  income: { label: "손익계산서", apiType: 2 },
  cashflow: { label: "현금흐름표", apiType: 3 },
};

function toTableRow(row: IrFinancialRow): TableRow {
  const [q1 = "", q2 = "", q3 = "", q4 = ""] = row.values;

  return {
    item: row.label,
    q1: q1 || null,
    q2: q2 || null,
    q3: q3 || null,
    q4: q4 || null,
  };
}

function formatCellValue(value: string | null): string {
  if (!value || !value.trim()) return "-";

  const normalizedValue = value.replace(/,/g, "").trim();
  const isNumeric = /^-?\d+(\.\d+)?$/.test(normalizedValue);

  if (!isNumeric) {
    return value;
  }

  return Number(normalizedValue).toLocaleString("ko-KR");
}

export default function IRLibrary() {
  const [currentTab, setCurrentTab] = useState<TabType>("balance");
  const [selectedGiId, setSelectedGiId] = useState<number | null>(null);
  const [currentYearLabel, setCurrentYearLabel] = useState("");
  const [yearOptions, setYearOptions] = useState<{ gi_id: number; gi_year: string }[]>(
    []
  );
  const [financialRows, setFinancialRows] = useState<TableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadFinancials() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await getFinancials({
          type: TAB_CONFIG[currentTab].apiType,
          gi_id: selectedGiId ?? undefined,
        });

        if (isCancelled) return;

        setYearOptions(response.available_years);
        setFinancialRows(response.financial_data.map(toTableRow));
        setCurrentYearLabel(String(response.current_year));
      } catch (error) {
        if (isCancelled) return;

        const nextMessage =
          error instanceof ApiError
            ? error.message
            : "IR 재무 정보를 불러오지 못했습니다.";

        setErrorMessage(nextMessage);
        setFinancialRows([]);
        setYearOptions([]);
        setCurrentYearLabel("");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFinancials();

    return () => {
      isCancelled = true;
    };
  }, [currentTab, selectedGiId]);

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    setSelectedGiId(null);
  };

  const currentData = useMemo(() => financialRows, [financialRows]);

  return (
    <section className={styles.irLibrary}>
      <h2 className={styles.section_title}>IR 자료실</h2>

      <div className={styles.tabArea}>
        {(Object.entries(TAB_CONFIG) as [TabType, (typeof TAB_CONFIG)[TabType]][]).map(
          ([tabKey, tab]) => (
            <button
              key={tabKey}
              className={`${styles.tabBtn} ${
                currentTab === tabKey ? styles.active : ""
              }`}
              onClick={() => handleTabChange(tabKey)}
              type="button"
            >
              {tab.label}
            </button>
          )
        )}
      </div>

      <div className={styles.filterArea}>
        <div className={styles.yearSelectWrap}>
          <label htmlFor="yearSelect" className={styles.hiddenLabel}>
            연도
          </label>
          <select
            className={`${styles.yearSelect} eg-font`}
            id="yearSelect"
            value={selectedGiId ?? yearOptions[0]?.gi_id ?? ""}
            onChange={(e) => setSelectedGiId(parseInt(e.target.value, 10))}
            disabled={isLoading || yearOptions.length === 0}
          >
            {yearOptions.map((year) => (
              <option key={year.gi_id} value={year.gi_id}>
                {year.gi_year}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.unitInfo}>
          {currentYearLabel
            ? `${currentYearLabel}년 기준 / 단위 : 백만원, %`
            : "단위 : 백만원, %"}
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.financialTable}>
          <div className={styles.tableHeader}>
            <div className={styles.headerCell}>항목</div>
            <div className={styles.headerCell}>1분기</div>
            <div className={styles.headerCell}>2분기</div>
            <div className={styles.headerCell}>3분기</div>
            <div className={styles.headerCell}>4분기</div>
          </div>

          <div className={styles.tableBody}>
            {isLoading ? (
              <div className={styles.stateMessage}>재무 정보를 불러오는 중입니다.</div>
            ) : errorMessage ? (
              <div className={`${styles.stateMessage} ${styles.errorMessage}`}>
                {errorMessage}
              </div>
            ) : currentData.length === 0 ? (
              <div className={styles.stateMessage}>등록된 재무 정보가 없습니다.</div>
            ) : (
              currentData.map((row, index) => (
                <div
                  key={`${row.item}-${index}`}
                  className={`${styles.tableRow} ${
                    index === currentData.length - 1 ? styles.lastRow : ""
                  }`}
                >
                  <div className={styles.tableCell}>{row.item}</div>
                  <div
                    className={`${styles.tableCell} ${
                      row.q1 === null ? styles.empty : ""
                    }`}
                  >
                    {formatCellValue(row.q1)}
                  </div>
                  <div
                    className={`${styles.tableCell} ${
                      row.q2 === null ? styles.empty : ""
                    }`}
                  >
                    {formatCellValue(row.q2)}
                  </div>
                  <div
                    className={`${styles.tableCell} ${
                      row.q3 === null ? styles.empty : ""
                    }`}
                  >
                    {formatCellValue(row.q3)}
                  </div>
                  <div
                    className={`${styles.tableCell} ${
                      row.q4 === null ? styles.empty : ""
                    }`}
                  >
                    {formatCellValue(row.q4)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

