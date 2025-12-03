/**
 * RootLayout 컴포넌트
 *
 * Next.js의 루트 레이아웃입니다. 모든 페이지에 공통으로 적용됩니다.
 * 구조:
 * 1. Navigation: 상단 네비게이션 바 (모든 페이지에 표시)
 * 2. {children}: 각 페이지의 콘텐츠 (동적으로 변경됨)
 * 3. Footer: 하단 푸터 (모든 페이지에 표시)
 *
 * 메타데이터:
 * - title: 브라우저 탭에 표시되는 제목
 * - description: SEO를 위한 사이트 설명
 */
import type { Metadata } from "next";
import "./globals.css";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

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
        {/* 상단 네비게이션 바 (공통) */}
        <Navigation />

        {/* 각 페이지의 콘텐츠 (동적) */}
        {children}

        {/* 하단 푸터 (공통) */}
        <Footer />
      </body>
    </html>
  );
}
