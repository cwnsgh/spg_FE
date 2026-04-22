"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, isUserAdmin } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./AdminLoginForm.module.css";

interface AdminLoginFormProps {
  onSuccess?: () => void;
}

export default function AdminLoginForm({ onSuccess }: AdminLoginFormProps) {
  const router = useRouter();
  const { isAdmin, isLoading, login, logout } = useAuth();
  const [mbId, setMbId] = useState("");
  const [mbPassword, setMbPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAdmin) {
      onSuccess?.();
    }
  }, [isAdmin, isLoading, onSuccess]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const user = await login({
        mb_id: mbId,
        mb_password: mbPassword,
      });

      if (user == null) {
        setErrorMessage(
          "로그인 응답은 왔지만 세션(me)을 확인하지 못했습니다. 새로고침 후 다시 시도하거나, 쿠키·프록시 설정을 확인해 주세요."
        );
        return;
      }

      if (!isUserAdmin(user)) {
        await logout();
        setErrorMessage("관리자 계정만 접근할 수 있습니다.");
        return;
      }

      onSuccess?.();
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>ADMIN</p>
      <h1 className={styles.title}>관리자 로그인</h1>
      <p className={styles.description}>
        관리자 계정으로 로그인하면 홈에서 어드민 메뉴가 활성화됩니다.
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>아이디</span>
          <input
            value={mbId}
            onChange={(event) => setMbId(event.target.value)}
            placeholder="관리자 아이디"
            autoComplete="username"
            required
          />
        </label>

        <label className={styles.field}>
          <span>비밀번호</span>
          <input
            type="password"
            value={mbPassword}
            onChange={(event) => setMbPassword(event.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
            required
          />
        </label>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </section>
  );
}
