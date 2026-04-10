import type { ProductCategoryNode } from "@/api/product";

/** 제품 목록 화면에서 쓰는 탭/서브/3뎁스 선택 상태 */
export type ProductSelection = {
  rootId: number;
  subId: number | null;
  d3Id: number | null;
};

/**
 * 트리 + 쿼리스트링으로 현재 선택을 계산합니다.
 * `search`는 `?` 없이 `tab=1&sub=2` 형태 또는 `window.location.search` 그대로 가능합니다.
 */
export function parseProductSelection(
  tree: ProductCategoryNode[],
  search: string
): ProductSelection | null {
  if (!tree.length) return null;

  const qs = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(qs);
  const tab = params.get("tab");
  const sub = params.get("sub");
  const d3 = params.get("d3");

  const rootIdParsed = tab ? parseInt(tab, 10) : NaN;
  const root =
    Number.isFinite(rootIdParsed) && tree.some((r) => r.ca_id === rootIdParsed)
      ? tree.find((r) => r.ca_id === rootIdParsed)!
      : tree[0];

  const subs = root.children ?? [];
  const subIdParsed = sub ? parseInt(sub, 10) : NaN;
  const validSub = subs.length
    ? subs.find((s) => s.ca_id === subIdParsed) ?? subs[0]
    : null;

  const d3Options = validSub?.children ?? [];
  const d3Parsed = d3 ? parseInt(d3, 10) : NaN;
  const validD3 =
    d3Options.length > 0 &&
    Number.isFinite(d3Parsed) &&
    d3Options.some((c) => c.ca_id === d3Parsed)
      ? d3Parsed
      : null;

  return {
    rootId: root.ca_id,
    subId: validSub?.ca_id ?? null,
    d3Id: validD3,
  };
}

/** 주소창에 맞는 `/products?...` 문자열 */
export function buildProductsUrl(sel: ProductSelection): string {
  const qs = new URLSearchParams();
  qs.set("tab", String(sel.rootId));
  if (sel.subId != null) qs.set("sub", String(sel.subId));
  if (sel.d3Id != null) qs.set("d3", String(sel.d3Id));
  return `/products?${qs.toString()}`;
}

/** Next 라우터 없이 주소만 동기화 (리렌더/스크롤 끊김 완화) */
export function replaceProductsUrl(sel: ProductSelection) {
  if (typeof window === "undefined") return;
  const url = buildProductsUrl(sel);
  window.history.replaceState(window.history.state, "", url);
}
