/**
 * 공개 사이트 레이아웃 — (site) 라우트 그룹 전체에 적용.
 * 사용처: Next가 (site) 아래 각 page.tsx 렌더 시 이 레이아웃으로 감쌈.
 */
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="site-shell">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
