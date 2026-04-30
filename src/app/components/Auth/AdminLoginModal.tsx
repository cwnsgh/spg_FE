"use client";

/**
 * 헤더에서 관리자 로그인 시 오버레이 모달. 사용처: `Header/Header.tsx`.
 */
import { useEffect } from "react";
import AdminLoginForm from "./AdminLoginForm";
import styles from "./AdminLoginModal.module.css";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({
  isOpen,
  onClose,
}: AdminLoginModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="관리자 로그인"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="로그인 모달 닫기"
        >
          x
        </button>
        <AdminLoginForm onSuccess={onClose} />
      </div>
    </div>
  );
}
