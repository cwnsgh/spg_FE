"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./IRLibrary.module.css";

interface FinancialRow {
  item: string;
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
}

type TabType = "balance" | "income" | "cashflow";

export default function IRLibrary() {
  const [currentTab, setCurrentTab] = useState<TabType>("balance");
  const [currentYear, setCurrentYear] = useState(2025);

  // 임시 데이터
  const financialData: Record<TabType, Record<number, FinancialRow[]>> = {
    balance: {
      2025: [
        { item: "유동자산", q1: 273717, q2: null, q3: null, q4: null },
        { item: "비유동자산", q1: 130393, q2: null, q3: null, q4: null },
        { item: "자산총계", q1: 404111, q2: null, q3: null, q4: null },
        { item: "유동부채", q1: 125910, q2: null, q3: null, q4: null },
        { item: "비유동부채", q1: 45000, q2: null, q3: null, q4: null },
        { item: "부채총계", q1: 170910, q2: null, q3: null, q4: null },
        { item: "자본금", q1: 15000, q2: null, q3: null, q4: null },
        { item: "자본총계", q1: 233201, q2: null, q3: null, q4: null },
        { item: "부채와 자본 총계", q1: 233201, q2: null, q3: null, q4: null },
      ],
      2024: [
        { item: "유동자산", q1: 250000, q2: 255000, q3: 260000, q4: 270000 },
        { item: "비유동자산", q1: 120000, q2: 125000, q3: 128000, q4: 130000 },
        { item: "자산총계", q1: 370000, q2: 380000, q3: 388000, q4: 400000 },
        { item: "유동부채", q1: 110000, q2: 115000, q3: 120000, q4: 125000 },
        { item: "비유동부채", q1: 40000, q2: 42000, q3: 43000, q4: 45000 },
        { item: "부채총계", q1: 150000, q2: 157000, q3: 163000, q4: 170000 },
        { item: "자본금", q1: 15000, q2: 15000, q3: 15000, q4: 15000 },
        { item: "자본총계", q1: 220000, q2: 223000, q3: 225000, q4: 230000 },
        { item: "부채와 자본 총계", q1: 220000, q2: 223000, q3: 225000, q4: 230000 },
      ],
      2023: [
        { item: "유동자산", q1: 230000, q2: 240000, q3: 245000, q4: 250000 },
        { item: "비유동자산", q1: 110000, q2: 115000, q3: 118000, q4: 120000 },
        { item: "자산총계", q1: 340000, q2: 355000, q3: 363000, q4: 370000 },
        { item: "유동부채", q1: 100000, q2: 105000, q3: 110000, q4: 110000 },
        { item: "비유동부채", q1: 35000, q2: 37000, q3: 38000, q4: 40000 },
        { item: "부채총계", q1: 135000, q2: 142000, q3: 148000, q4: 150000 },
        { item: "자본금", q1: 15000, q2: 15000, q3: 15000, q4: 15000 },
        { item: "자본총계", q1: 205000, q2: 213000, q3: 215000, q4: 220000 },
        { item: "부채와 자본 총계", q1: 205000, q2: 213000, q3: 215000, q4: 220000 },
      ],
      2022: [
        { item: "유동자산", q1: 210000, q2: 220000, q3: 230000, q4: 230000 },
        { item: "비유동자산", q1: 100000, q2: 105000, q3: 108000, q4: 110000 },
        { item: "자산총계", q1: 310000, q2: 325000, q3: 338000, q4: 340000 },
        { item: "유동부채", q1: 90000, q2: 95000, q3: 100000, q4: 100000 },
        { item: "비유동부채", q1: 30000, q2: 32000, q3: 33000, q4: 35000 },
        { item: "부채총계", q1: 120000, q2: 127000, q3: 133000, q4: 135000 },
        { item: "자본금", q1: 15000, q2: 15000, q3: 15000, q4: 15000 },
        { item: "자본총계", q1: 190000, q2: 198000, q3: 205000, q4: 205000 },
        { item: "부채와 자본 총계", q1: 190000, q2: 198000, q3: 205000, q4: 205000 },
      ],
      2021: [
        { item: "유동자산", q1: 190000, q2: 200000, q3: 210000, q4: 210000 },
        { item: "비유동자산", q1: 90000, q2: 95000, q3: 98000, q4: 100000 },
        { item: "자산총계", q1: 280000, q2: 295000, q3: 308000, q4: 310000 },
        { item: "유동부채", q1: 80000, q2: 85000, q3: 90000, q4: 90000 },
        { item: "비유동부채", q1: 25000, q2: 27000, q3: 28000, q4: 30000 },
        { item: "부채총계", q1: 105000, q2: 112000, q3: 118000, q4: 120000 },
        { item: "자본금", q1: 15000, q2: 15000, q3: 15000, q4: 15000 },
        { item: "자본총계", q1: 175000, q2: 183000, q3: 190000, q4: 190000 },
        { item: "부채와 자본 총계", q1: 175000, q2: 183000, q3: 190000, q4: 190000 },
      ],
      2020: [
        { item: "유동자산", q1: 170000, q2: 180000, q3: 190000, q4: 190000 },
        { item: "비유동자산", q1: 80000, q2: 85000, q3: 88000, q4: 90000 },
        { item: "자산총계", q1: 250000, q2: 265000, q3: 278000, q4: 280000 },
        { item: "유동부채", q1: 70000, q2: 75000, q3: 80000, q4: 80000 },
        { item: "비유동부채", q1: 20000, q2: 22000, q3: 23000, q4: 25000 },
        { item: "부채총계", q1: 90000, q2: 97000, q3: 103000, q4: 105000 },
        { item: "자본금", q1: 15000, q2: 15000, q3: 15000, q4: 15000 },
        { item: "자본총계", q1: 160000, q2: 168000, q3: 175000, q4: 175000 },
        { item: "부채와 자본 총계", q1: 160000, q2: 168000, q3: 175000, q4: 175000 },
      ],
      2019: [
        { item: "유동자산", q1: 150000, q2: 160000, q3: 170000, q4: 170000 },
        { item: "비유동자산", q1: 70000, q2: 75000, q3: 78000, q4: 80000 },
        { item: "자산총계", q1: 220000, q2: 235000, q3: 248000, q4: 250000 },
        { item: "유동부채", q1: 60000, q2: 65000, q3: 70000, q4: 70000 },
        { item: "비유동부채", q1: 15000, q2: 17000, q3: 18000, q4: 20000 },
        { item: "부채총계", q1: 75000, q2: 82000, q3: 88000, q4: 90000 },
        { item: "자본금", q1: 15000, q2: 15000, q3: 15000, q4: 15000 },
        { item: "자본총계", q1: 145000, q2: 153000, q3: 160000, q4: 160000 },
        { item: "부채와 자본 총계", q1: 145000, q2: 153000, q3: 160000, q4: 160000 },
      ],
    },
    income: {
      2025: [
        { item: "매출액", q1: 150000, q2: null, q3: null, q4: null },
        { item: "매출원가", q1: 90000, q2: null, q3: null, q4: null },
        { item: "매출총이익", q1: 60000, q2: null, q3: null, q4: null },
        { item: "판매비와관리비", q1: 30000, q2: null, q3: null, q4: null },
        { item: "영업이익", q1: 30000, q2: null, q3: null, q4: null },
        { item: "당기순이익", q1: 25000, q2: null, q3: null, q4: null },
        { item: "총포괄손익", q1: 25000, q2: null, q3: null, q4: null },
      ],
      2024: [
        { item: "매출액", q1: 140000, q2: 145000, q3: 150000, q4: 155000 },
        { item: "매출원가", q1: 84000, q2: 87000, q3: 90000, q4: 93000 },
        { item: "매출총이익", q1: 56000, q2: 58000, q3: 60000, q4: 62000 },
        { item: "판매비와관리비", q1: 28000, q2: 29000, q3: 30000, q4: 31000 },
        { item: "영업이익", q1: 28000, q2: 29000, q3: 30000, q4: 31000 },
        { item: "당기순이익", q1: 23000, q2: 24000, q3: 25000, q4: 26000 },
        { item: "총포괄손익", q1: 23000, q2: 24000, q3: 25000, q4: 26000 },
      ],
      2023: [
        { item: "매출액", q1: 130000, q2: 135000, q3: 140000, q4: 140000 },
        { item: "매출원가", q1: 78000, q2: 81000, q3: 84000, q4: 84000 },
        { item: "매출총이익", q1: 52000, q2: 54000, q3: 56000, q4: 56000 },
        { item: "판매비와관리비", q1: 26000, q2: 27000, q3: 28000, q4: 28000 },
        { item: "영업이익", q1: 26000, q2: 27000, q3: 28000, q4: 28000 },
        { item: "당기순이익", q1: 21000, q2: 22000, q3: 23000, q4: 23000 },
        { item: "총포괄손익", q1: 21000, q2: 22000, q3: 23000, q4: 23000 },
      ],
      2022: [
        { item: "매출액", q1: 120000, q2: 125000, q3: 130000, q4: 130000 },
        { item: "매출원가", q1: 72000, q2: 75000, q3: 78000, q4: 78000 },
        { item: "매출총이익", q1: 48000, q2: 50000, q3: 52000, q4: 52000 },
        { item: "판매비와관리비", q1: 24000, q2: 25000, q3: 26000, q4: 26000 },
        { item: "영업이익", q1: 24000, q2: 25000, q3: 26000, q4: 26000 },
        { item: "당기순이익", q1: 19000, q2: 20000, q3: 21000, q4: 21000 },
        { item: "총포괄손익", q1: 19000, q2: 20000, q3: 21000, q4: 21000 },
      ],
      2021: [
        { item: "매출액", q1: 110000, q2: 115000, q3: 120000, q4: 120000 },
        { item: "매출원가", q1: 66000, q2: 69000, q3: 72000, q4: 72000 },
        { item: "매출총이익", q1: 44000, q2: 46000, q3: 48000, q4: 48000 },
        { item: "판매비와관리비", q1: 22000, q2: 23000, q3: 24000, q4: 24000 },
        { item: "영업이익", q1: 22000, q2: 23000, q3: 24000, q4: 24000 },
        { item: "당기순이익", q1: 17000, q2: 18000, q3: 19000, q4: 19000 },
        { item: "총포괄손익", q1: 17000, q2: 18000, q3: 19000, q4: 19000 },
      ],
      2020: [
        { item: "매출액", q1: 100000, q2: 105000, q3: 110000, q4: 110000 },
        { item: "매출원가", q1: 60000, q2: 63000, q3: 66000, q4: 66000 },
        { item: "매출총이익", q1: 40000, q2: 42000, q3: 44000, q4: 44000 },
        { item: "판매비와관리비", q1: 20000, q2: 21000, q3: 22000, q4: 22000 },
        { item: "영업이익", q1: 20000, q2: 21000, q3: 22000, q4: 22000 },
        { item: "당기순이익", q1: 15000, q2: 16000, q3: 17000, q4: 17000 },
        { item: "총포괄손익", q1: 15000, q2: 16000, q3: 17000, q4: 17000 },
      ],
      2019: [
        { item: "매출액", q1: 90000, q2: 95000, q3: 100000, q4: 100000 },
        { item: "매출원가", q1: 54000, q2: 57000, q3: 60000, q4: 60000 },
        { item: "매출총이익", q1: 36000, q2: 38000, q3: 40000, q4: 40000 },
        { item: "판매비와관리비", q1: 18000, q2: 19000, q3: 20000, q4: 20000 },
        { item: "영업이익", q1: 18000, q2: 19000, q3: 20000, q4: 20000 },
        { item: "당기순이익", q1: 13000, q2: 14000, q3: 15000, q4: 15000 },
        { item: "총포괄손익", q1: 13000, q2: 14000, q3: 15000, q4: 15000 },
      ],
    },
    cashflow: {
      2025: [
        { item: "영업활동으로 인한 현금흐름", q1: 35000, q2: null, q3: null, q4: null },
        { item: "투자활동으로 인한 현금흐름", q1: -15000, q2: null, q3: null, q4: null },
        { item: "재무활동으로 인한 현금흐름", q1: -10000, q2: null, q3: null, q4: null },
        { item: "현금의증가(감소)", q1: 10000, q2: null, q3: null, q4: null },
        { item: "기초의 현금 및 현금자산", q1: 50000, q2: null, q3: null, q4: null },
        { item: "환율변동효과", q1: 60000, q2: null, q3: null, q4: null },
        { item: "기말의 현금 및 현금성 자산", q1: 60000, q2: null, q3: null, q4: null },
      ],
      2024: [
        { item: "영업활동으로 인한 현금흐름", q1: 32000, q2: 33000, q3: 34000, q4: 35000 },
        { item: "투자활동으로 인한 현금흐름", q1: -14000, q2: -14500, q3: -15000, q4: -15000 },
        { item: "재무활동으로 인한 현금흐름", q1: -9000, q2: -9500, q3: -10000, q4: -10000 },
        { item: "현금의증가(감소)", q1: 9000, q2: 9000, q3: 9000, q4: 10000 },
        { item: "기초의 현금 및 현금자산", q1: 45000, q2: 54000, q3: 63000, q4: 72000 },
        { item: "환율변동효과", q1: 54000, q2: 63000, q3: 72000, q4: 82000 },
        { item: "기말현금및현금성자산", q1: 60000, q2: 69000, q3: 78000, q4: 87000 },
      ],
      2023: [
        { item: "영업활동으로 인한 현금흐름", q1: 30000, q2: 31000, q3: 32000, q4: 32000 },
        { item: "투자활동으로 인한 현금흐름", q1: -13000, q2: -13500, q3: -14000, q4: -14000 },
        { item: "재무활동으로 인한 현금흐름", q1: -8000, q2: -8500, q3: -9000, q4: -9000 },
        { item: "현금의증가(감소)", q1: 9000, q2: 9000, q3: 9000, q4: 9000 },
        { item: "기초의 현금 및 현금자산", q1: 40000, q2: 49000, q3: 58000, q4: 67000 },
        { item: "환율변동효과", q1: 49000, q2: 58000, q3: 67000, q4: 76000 },
        { item: "기말현금및현금성자산", q1: 60000, q2: 69000, q3: 78000, q4: 87000 },
      ],
      2022: [
        { item: "영업활동으로 인한 현금흐름", q1: 28000, q2: 29000, q3: 30000, q4: 30000 },
        { item: "투자활동으로 인한 현금흐름", q1: -12000, q2: -12500, q3: -13000, q4: -13000 },
        { item: "재무활동으로 인한 현금흐름", q1: -7000, q2: -7500, q3: -8000, q4: -8000 },
        { item: "현금의증가(감소)", q1: 9000, q2: 9000, q3: 9000, q4: 9000 },
        { item: "기초의 현금 및 현금자산", q1: 35000, q2: 44000, q3: 53000, q4: 62000 },
        { item: "환율변동효과", q1: 44000, q2: 53000, q3: 62000, q4: 71000 },
        { item: "기말현금및현금성자산", q1: 60000, q2: 69000, q3: 78000, q4: 87000 },
      ],
      2021: [
        { item: "영업활동으로 인한 현금흐름", q1: 26000, q2: 27000, q3: 28000, q4: 28000 },
        { item: "투자활동으로 인한 현금흐름", q1: -11000, q2: -11500, q3: -12000, q4: -12000 },
        { item: "재무활동으로 인한 현금흐름", q1: -6000, q2: -6500, q3: -7000, q4: -7000 },
        { item: "현금의증가(감소)", q1: 9000, q2: 9000, q3: 9000, q4: 9000 },
        { item: "기초의 현금 및 현금자산", q1: 30000, q2: 39000, q3: 48000, q4: 57000 },
        { item: "환율변동효과", q1: 39000, q2: 48000, q3: 57000, q4: 66000 },
        { item: "기말현금및현금성자산", q1: 60000, q2: 69000, q3: 78000, q4: 87000 },
      ],
      2020: [
        { item: "영업활동으로 인한 현금흐름", q1: 24000, q2: 25000, q3: 26000, q4: 26000 },
        { item: "투자활동으로 인한 현금흐름", q1: -10000, q2: -10500, q3: -11000, q4: -11000 },
        { item: "재무활동으로 인한 현금흐름", q1: -5000, q2: -5500, q3: -6000, q4: -6000 },
        { item: "현금의증가(감소)", q1: 9000, q2: 9000, q3: 9000, q4: 9000 },
        { item: "기초의 현금 및 현금자산", q1: 25000, q2: 34000, q3: 43000, q4: 52000 },
        { item: "환율변동효과", q1: 34000, q2: 43000, q3: 52000, q4: 61000 },
        { item: "기말현금및현금성자산", q1: 60000, q2: 69000, q3: 78000, q4: 87000 },
      ],
      2019: [
        { item: "영업활동으로 인한 현금흐름", q1: 22000, q2: 23000, q3: 24000, q4: 24000 },
        { item: "투자활동으로 인한 현금흐름", q1: -9000, q2: -9500, q3: -10000, q4: -10000 },
        { item: "재무활동으로 인한 현금흐름", q1: -4000, q2: -4500, q3: -5000, q4: -5000 },
        { item: "현금의증가(감소)", q1: 9000, q2: 9000, q3: 9000, q4: 9000 },
        { item: "기초의 현금 및 현금자산", q1: 20000, q2: 29000, q3: 38000, q4: 47000 },
        { item: "환율변동효과", q1: 29000, q2: 38000, q3: 47000, q4: 56000 },
        { item: "기말현금및현금성자산", q1: 60000, q2: 69000, q3: 78000, q4: 87000 },
      ],
    },
  };

  // 현재 탭과 연도에 맞는 데이터
  const currentData = useMemo(() => {
    return financialData[currentTab][currentYear] || [];
  }, [currentTab, currentYear]);

  // 숫자 포맷팅
  const formatNumber = (num: number | null): string => {
    if (num === null || num === undefined) return "-";
    return num.toLocaleString("ko-KR");
  };

  // 연도 옵션 생성
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2019; year--) {
      years.push(year);
    }
    return years;
  }, []);

  return (
    <section className={styles.irLibrary}>
      <h2 className={styles.section_title}>IR 자료실</h2>
      <div className={styles.tabArea}>
        <button
          className={`${styles.tabBtn} ${currentTab === "balance" ? styles.active : ""}`}
          onClick={() => setCurrentTab("balance")}
        >
          재무상태표
        </button>
        <button
          className={`${styles.tabBtn} ${currentTab === "income" ? styles.active : ""}`}
          onClick={() => setCurrentTab("income")}
        >
          손익계산서
        </button>
        <button
          className={`${styles.tabBtn} ${currentTab === "cashflow" ? styles.active : ""}`}
          onClick={() => setCurrentTab("cashflow")}
        >
          현금흐름표
        </button>
      </div>

      <div className={styles.filterArea}>
        <div className={styles.yearSelectWrap}>
          <label htmlFor="yearSelect" className={styles.hiddenLabel}>
            연도
          </label>
          <select
            className={`${styles.yearSelect} eg-font`}
            id="yearSelect"
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.unitInfo}>단위 : 백만원, %</div>
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
            {currentData.map((row, index) => (
              <div
                key={index}
                className={`${styles.tableRow} ${
                  index === currentData.length - 1 ? styles.lastRow : ""
                }`}
              >
                <div className={styles.tableCell}>{row.item}</div>
                <div
                  className={`${styles.tableCell} ${row.q1 === null ? styles.empty : ""}`}
                >
                  {formatNumber(row.q1)}
                </div>
                <div
                  className={`${styles.tableCell} ${row.q2 === null ? styles.empty : ""}`}
                >
                  {formatNumber(row.q2)}
                </div>
                <div
                  className={`${styles.tableCell} ${row.q3 === null ? styles.empty : ""}`}
                >
                  {formatNumber(row.q3)}
                </div>
                <div
                  className={`${styles.tableCell} ${row.q4 === null ? styles.empty : ""}`}
                >
                  {formatNumber(row.q4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

