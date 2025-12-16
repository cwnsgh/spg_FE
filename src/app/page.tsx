import MainBanner from "./home/components/MainBanner/MainBanner";
import ProductIntro from "./home/components/ProductIntro/ProductIntro";
import CategoryMenu from "./home/components/CategoryMenu/CategoryMenu";
import BrandInfo from "./home/components/BrandInfo/BrandInfo";

export default function Home() {
  return (
    <main className="home-page">
      <MainBanner />
      <ProductIntro />
      <CategoryMenu />
      <BrandInfo />
    </main>
  );
}
