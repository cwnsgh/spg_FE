/** Next.js 페이지: 메인 홈. URL `/` */
import MainBanner from "../home/components/MainBanner/MainBanner";
import ProductIntro from "../home/components/ProductIntro/ProductIntro";
import CategoryMenu from "../home/components/CategoryMenu/CategoryMenu";
import BrandInfo from "../home/components/BrandInfo/BrandInfo";
import SitePopups from "../home/components/SitePopups/SitePopups";

export default function Home() {
  return (
    <main className="home-page">
      <SitePopups />
      <MainBanner />
      <ProductIntro />
      <CategoryMenu />
      <BrandInfo />
    </main>
  );
}
