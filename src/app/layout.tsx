/**
 * Next.js 루트 레이아웃 — 전역 HTML/body, globals.css, AuthProvider만 적용.
 * 공개 사이트 헤더·푸터는 `(site)/layout.tsx`에서 감쌉니다.
 */
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "SPG Site",
  description: "SPG Frontend Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
