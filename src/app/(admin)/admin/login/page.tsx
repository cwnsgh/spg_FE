"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLoginForm from "@/app/components/Auth/AdminLoginForm";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./page.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAdmin) {
      router.replace("/admin");
    }
  }, [isAdmin, isLoading, router]);

  return (
    <main className={styles.page}>
      <AdminLoginForm onSuccess={() => router.replace("/admin")} />
    </main>
  );
}
