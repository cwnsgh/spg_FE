"use client";

import { useState } from "react";
import styles from "./SearchButton.module.css";

export default function SearchButton() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        className={styles.searchButton}
        onClick={toggleSearch}
        aria-label="검색"
      >
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

      {isOpen && (
        <div className={styles.searchOverlay} onClick={() => setIsOpen(false)}>
          <div
            className={styles.searchBox}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              className={styles.searchInput}
              autoFocus
            />
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}

