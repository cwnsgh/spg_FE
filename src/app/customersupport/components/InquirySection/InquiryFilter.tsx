"use client";

import { useState } from "react";
import styles from "./InquiryFilter.module.css";

export default function InquiryFilter() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className={styles.container}>
      <select className={styles.select}>
        <option value="all">전체</option>
        <option value="answered">답변완료</option>
        <option value="pending">답변대기</option>
      </select>
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          className={styles.input}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className={styles.searchButton}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 19L14.65 14.65"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
