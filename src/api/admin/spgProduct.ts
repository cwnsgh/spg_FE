/**
 * 관리자 SPG 상품·카테고리 API (`/api/admin/product/*.php`)
 */
import { apiRequest } from "../client";

export interface AdminSpgCategoryRow {
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
  sort_order: number;
  is_active: number;
  keywords_ko?: string[];
  keywords_en?: string[];
  /** 목록 API: `spg_category_files` 건수 (서버가 내려줄 때만) */
  file_count?: number;
}

export interface AdminSpgCategoryFileRow {
  file_id: number;
  ca_id: number;
  title_ko: string;
  title_en: string | null;
  origin_name: string;
  save_name: string;
  file_path: string;
}

export type AdminSpgCategoryDetail = AdminSpgCategoryRow & {
  files?: AdminSpgCategoryFileRow[];
};

export interface AdminSpgProductRow {
  pr_id: number;
  name_ko: string;
  name_en: string;
  summary_ko?: string | null;
  summary_en?: string | null;
  features_ko?: unknown;
  features_en?: unknown;
  image_url?: string | null;
  sort_order: number;
  is_active: number;
  /** 목록 API에서 매핑된 카테고리 ID (신규 PHP 응답) */
  ca_ids?: number[];
}

export type AdminSpgProductDetail = AdminSpgProductRow & {
  ca_ids: number[];
  files?: {
    file_type: number;
    origin_name: string;
    file_path: string;
  }[];
};

function appendKeywordArrays(form: FormData, ko?: string[], en?: string[]) {
  if (ko?.length) {
    ko.forEach((k) => {
      if (k.trim()) form.append("keywords_ko[]", k.trim());
    });
  }
  if (en?.length) {
    en.forEach((k) => {
      if (k.trim()) form.append("keywords_en[]", k.trim());
    });
  }
}

function appendFeatureArrays(form: FormData, ko?: string[], en?: string[]) {
  if (ko?.length) {
    ko.forEach((k) => form.append("features_ko[]", k));
  }
  if (en?.length) {
    en.forEach((k) => form.append("features_en[]", k));
  }
}

export async function getAdminSpgCategories(params?: {
  search_name?: string;
  is_active?: number | "";
  depth?: number;
}) {
  return apiRequest<AdminSpgCategoryRow[]>("/admin/product/product_categories.php", {
    query: params,
    credentials: "include",
  });
}

export async function getAdminSpgCategory(id: number) {
  return apiRequest<AdminSpgCategoryDetail>("/admin/product/product_categories.php", {
    query: { id },
    credentials: "include",
  });
}

export type AdminSpgCategoryNewFile = {
  file: File;
  title_ko: string;
  title_en?: string;
};

export interface AdminSpgCategoryCreateInput {
  parent_id?: number | null;
  name_ko: string;
  name_en: string;
  desc_ko?: string;
  desc_en?: string;
  keywords_ko?: string[];
  keywords_en?: string[];
  sort_order?: number;
  is_active?: number;
  image?: File | null;
  /** `product_categories.php` — `category_files[]` + `file_titles_ko[]` / `file_titles_en[]` */
  new_category_files?: AdminSpgCategoryNewFile[];
}

function appendNewCategoryFiles(
  form: FormData,
  items?: AdminSpgCategoryNewFile[] | null
) {
  if (!items?.length) return;
  for (const item of items) {
    form.append("category_files[]", item.file);
    form.append(
      "file_titles_ko[]",
      item.title_ko.trim() || "첨부파일"
    );
    form.append("file_titles_en[]", (item.title_en ?? "").trim());
  }
}

export function buildCategoryCreateForm(input: AdminSpgCategoryCreateInput): FormData {
  const form = new FormData();
  if (input.parent_id != null && input.parent_id !== 0) {
    form.append("parent_id", String(input.parent_id));
  }
  form.append("name_ko", input.name_ko);
  form.append("name_en", input.name_en);
  if (input.desc_ko != null) form.append("desc_ko", input.desc_ko);
  if (input.desc_en != null) form.append("desc_en", input.desc_en);
  appendKeywordArrays(form, input.keywords_ko, input.keywords_en);
  form.append("sort_order", String(input.sort_order ?? 0));
  form.append("is_active", String(input.is_active ?? 1));
  if (input.image instanceof File) {
    form.append("image", input.image);
  }
  appendNewCategoryFiles(form, input.new_category_files);
  return form;
}

export interface AdminSpgCategoryFileTitleUpdate {
  file_id: number;
  title_ko: string;
  title_en: string;
}

export interface AdminSpgCategoryUpdateInput extends AdminSpgCategoryCreateInput {
  delete_image?: boolean;
  delete_file_ids?: number[];
  /** 기존 첨부 표시 제목만 수정 (PHP `update_file_ids[]` + `update_file_titles_ko[]` / `en`) */
  file_title_updates?: AdminSpgCategoryFileTitleUpdate[];
}

export function buildCategoryUpdateForm(input: AdminSpgCategoryUpdateInput): FormData {
  const form = buildCategoryCreateForm(input);
  if (input.delete_image) {
    form.append("delete_image", "1");
  }
  if (input.delete_file_ids?.length) {
    input.delete_file_ids.forEach((fid) => {
      form.append("delete_file_ids[]", String(fid));
    });
  }
  if (input.file_title_updates?.length) {
    input.file_title_updates.forEach((u) => {
      form.append("update_file_ids[]", String(u.file_id));
      form.append("update_file_titles_ko[]", u.title_ko);
      form.append("update_file_titles_en[]", u.title_en);
    });
  }
  form.append("_method", "PUT");
  return form;
}

export async function createAdminSpgCategory(input: AdminSpgCategoryCreateInput) {
  return apiRequest<{ message: string; ca_id: number }>("/admin/product/product_categories.php", {
    method: "POST",
    body: buildCategoryCreateForm(input),
    credentials: "include",
  });
}

export async function updateAdminSpgCategory(caId: number, input: AdminSpgCategoryUpdateInput) {
  return apiRequest<{ message: string }>("/admin/product/product_categories.php", {
    method: "POST",
    query: { id: caId },
    body: buildCategoryUpdateForm(input),
    credentials: "include",
  });
}

export async function deleteAdminSpgCategory(caId: number, preserveFiles = false) {
  return apiRequest<{ message: string }>("/admin/product/product_categories.php", {
    method: "DELETE",
    query: { id: caId, is_preserve_file: preserveFiles ? 1 : 0 },
    credentials: "include",
  });
}

export async function getAdminSpgProducts(params?: {
  ca_id?: number;
  search_name?: string;
  is_active?: number | "";
}) {
  return apiRequest<AdminSpgProductRow[]>("/admin/product/products.php", {
    query: params,
    credentials: "include",
  });
}

export async function getAdminSpgProduct(id: number) {
  return apiRequest<AdminSpgProductDetail>("/admin/product/products.php", {
    query: { id },
    credentials: "include",
  });
}

export interface AdminSpgProductSaveInput {
  name_ko: string;
  name_en?: string;
  summary_ko?: string;
  summary_en?: string;
  features_ko?: string[];
  features_en?: string[];
  ca_ids?: number[];
  sort_order?: number;
  is_active?: number;
  image?: File | null;
  file_0?: File | null;
  file_1?: File | null;
  file_2?: File | null;
  delete_image?: boolean;
  delete_types?: number[];
}

export function buildProductCreateForm(input: AdminSpgProductSaveInput): FormData {
  const form = new FormData();
  form.append("name_ko", input.name_ko);
  form.append("name_en", input.name_en ?? "");
  form.append("summary_ko", input.summary_ko ?? "");
  form.append("summary_en", input.summary_en ?? "");
  appendFeatureArrays(form, input.features_ko, input.features_en);
  if (input.ca_ids?.length) {
    input.ca_ids.forEach((id) => form.append("ca_ids[]", String(id)));
  }
  form.append("sort_order", String(input.sort_order ?? 0));
  form.append("is_active", String(input.is_active ?? 1));
  if (input.image instanceof File) form.append("image", input.image);
  if (input.file_0 instanceof File) form.append("file_0", input.file_0);
  if (input.file_1 instanceof File) form.append("file_1", input.file_1);
  if (input.file_2 instanceof File) form.append("file_2", input.file_2);
  return form;
}

export function buildProductUpdateForm(input: AdminSpgProductSaveInput): FormData {
  const form = buildProductCreateForm(input);
  if (input.delete_image) form.append("delete_image", "1");
  input.delete_types?.forEach((t) => form.append("delete_type[]", String(t)));
  form.append("_method", "PUT");
  return form;
}

export async function createAdminSpgProduct(input: AdminSpgProductSaveInput) {
  return apiRequest<{ message: string; pr_id: number }>("/admin/product/products.php", {
    method: "POST",
    body: buildProductCreateForm(input),
    credentials: "include",
  });
}

export async function updateAdminSpgProduct(prId: number, input: AdminSpgProductSaveInput) {
  return apiRequest<{ message: string }>("/admin/product/products.php", {
    method: "POST",
    query: { id: prId },
    body: buildProductUpdateForm(input),
    credentials: "include",
  });
}

export async function deleteAdminSpgProduct(prId: number, preserveFiles = false) {
  return apiRequest<{ message: string }>("/admin/product/products.php", {
    method: "DELETE",
    query: { id: prId, is_preserve_file: preserveFiles ? 1 : 0 },
    credentials: "include",
  });
}
