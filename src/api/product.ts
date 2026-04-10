/**
 * 공개 제품·카테고리 API (`/api/front/product/*`, PHP 백엔드).
 */
import { apiRequest } from "./client";

/** `spg_category_files` — 카테고리(대분류 등) 공통 첨부 (PHP `product_categories.php`) */
export interface ProductCategoryFile {
  file_id: number;
  title_ko: string;
  title_en?: string | null;
  file_path: string;
}

/** 목록/트리 공통 노드 (PHP `spg_product_category`) */
export interface ProductCategoryNode {
  ca_id: number;
  parent_id: number | null;
  depth: number;
  name_ko: string;
  name_en: string;
  desc_ko?: string | null;
  desc_en?: string | null;
  keyword_ko?: string | null;
  keyword_en?: string | null;
  image_url?: string | null;
  keywords_ko?: string[];
  keywords_en?: string[];
  children?: ProductCategoryNode[];
  files?: ProductCategoryFile[];
}

export interface ProductCategoryPayload {
  tree: ProductCategoryNode[];
  current: ProductCategoryNode | null;
  root: ProductCategoryNode | null;
}

export async function fetchProductCategoryTree(query?: {
  ca_id?: number;
  parent_id?: number;
  depth?: number;
}): Promise<ProductCategoryPayload> {
  return apiRequest<ProductCategoryPayload>("/front/product/product_categories.php", {
    query,
  });
}

export interface ProductListItem {
  pr_id: number;
  name_ko: string;
  name_en: string;
  summary_ko?: string | null;
  summary_en?: string | null;
  image_url?: string | null;
  sort_order?: number;
  features_ko?: unknown;
}

export interface ProductListPayload {
  total_count: number;
  current_page: number;
  total_pages: number;
  limit: number;
  list: ProductListItem[];
}

export async function fetchProductList(query: {
  ca_id?: number;
  search_name?: string;
  page?: number;
  limit?: number;
  depth?: number;
}): Promise<ProductListPayload> {
  return apiRequest<ProductListPayload>("/front/product/products.php", { query });
}

export interface ProductCategoryRef {
  ca_id: number;
  parent_id: number | null;
  name_ko: string;
  depth: number;
}

/** `GET products.php?id=` 상세 응답 (`data` 내부) */
export interface ProductDetailPayload {
  pr_id: number;
  name_ko: string;
  name_en: string;
  summary_ko?: string | null;
  summary_en?: string | null;
  features_ko?: unknown;
  features_en?: unknown;
  image_url?: string | null;
  sort_order?: number;
  is_active?: number;
  categories?: ProductCategoryRef[];
  download_links?: {
    pdf?: string | null;
    dwg?: string | null;
    stp?: string | null;
  };
}

export async function fetchProductDetail(prId: number): Promise<ProductDetailPayload> {
  return apiRequest<ProductDetailPayload>("/front/product/products.php", {
    query: { id: prId },
  });
}
