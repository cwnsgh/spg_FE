import { getAllProducts } from "@/app/products/data/productData";
import ProductDetailClient from "./ProductDetailClient";

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ id: product.id }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
