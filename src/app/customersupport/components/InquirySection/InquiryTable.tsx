"use client";

import { useState } from "react";
import styles from "./InquiryTable.module.css";

interface Inquiry {
  id: number;
  category: string;
  title: string;
  author: string;
  date: string;
  status: "answered" | "pending";
}

interface InquiryTableProps {
  inquiryType: "product" | "technical" | "quality";
}

export default function InquiryTable({ inquiryType }: InquiryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 임시 데이터
  const mockInquiries: Inquiry[] = [
    {
      id: 15,
      category: "제품문의",
      title: "감속기계에 대한 문의입니다.",
      author: "홍길동",
      date: "2015-06-14",
      status: "answered",
    },
    {
      id: 14,
      category: "기술지원",
      title: "DC모터 컨트롤러 문의",
      author: "김철수",
      date: "2015-08-14",
      status: "pending",
    },
  ];

  const totalPages = Math.ceil(mockInquiries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInquiries = mockInquiries.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>번호</th>
            <th>구분</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>답변여부</th>
          </tr>
        </thead>
        <tbody>
          {currentInquiries.map((inquiry) => (
            <tr key={inquiry.id}>
              <td>{inquiry.id}</td>
              <td>{inquiry.category}</td>
              <td>{inquiry.title}</td>
              <td>{inquiry.author}</td>
              <td>{inquiry.date}</td>
              <td>
                <span
                  className={`${styles.status} ${
                    inquiry.status === "answered"
                      ? styles.answered
                      : styles.pending
                  }`}
                >
                  {inquiry.status === "answered" ? "답변완료" : "답변대기"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            &lt;&lt;
          </button>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`${styles.pageButton} ${
                currentPage === page ? styles.active : ""
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            &gt;&gt;
          </button>
        </div>
      )}
    </div>
  );
}

