import { getAllProducts } from "@/app/products/data/productData";
import ProductDetailClient from "./ProductDetailClient";

const DEFAULT_BUILD_API =
  process.env.BUILD_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://spg.co.kr/api";

/** 정적 export 시 빌드 타임에 상품 id 목록을 받아 HTML 생성 (API 실패 시 목업 id만) */
async function fetchProductIdsForBuild(): Promise<{ id: string }[]> {
  const base = DEFAULT_BUILD_API.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(base)) {
    return [];
  }
  try {
    const url = `${base}/front/product/products.php?limit=500&page=1`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      ok?: boolean;
      data?: { list?: { pr_id: number }[] };
    };
    if (!json.ok || !json.data?.list?.length) return [];
    return json.data.list.map((p) => ({ id: String(p.pr_id) }));
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const staticIds = getAllProducts().map((product) => ({ id: product.id }));
  const apiIds = await fetchProductIdsForBuild();
  const seen = new Set(staticIds.map((s) => s.id));
  const merged = [...staticIds];
  for (const row of apiIds) {
    if (!seen.has(row.id)) {
      seen.add(row.id);
      merged.push(row);
    }
  }
  return merged;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
