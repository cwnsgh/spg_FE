"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import RecruitPostEditor from "../components/RecruitPostEditor";
import styles from "../components/RecruitPostEditor.module.css";

function RecruitPostEditInner() {
  const sp = useSearchParams();
  const raw = sp.get("id");
  const wrId = raw ? Number(raw) : NaN;

  if (!raw || !Number.isFinite(wrId) || wrId <= 0) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBox}>유효한 공고 번호(?id=)가 필요합니다.</div>
        <Link href="/admin/customersupport/recruit-posts" className={styles.backLink}>
          ← 목록으로
        </Link>
      </div>
    );
  }

  return <RecruitPostEditor wrId={wrId} />;
}

export default function AdminRecruitPostEditPage() {
  return (
    <Suspense fallback={<p className={styles.loading}>불러오는 중…</p>}>
      <RecruitPostEditInner />
    </Suspense>
  );
}
