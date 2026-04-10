import type { AdminSpgCategoryRow } from "@/api";

export type CategoryTreeNode = AdminSpgCategoryRow & {
  children: CategoryTreeNode[];
};

/** `parent_id` 기준으로 트리 구성 후, `sort_order` → `ca_id` 순 정렬 */
export function buildCategoryTree(
  rows: AdminSpgCategoryRow[]
): CategoryTreeNode[] {
  const map = new Map<number, CategoryTreeNode>();
  rows.forEach((r) => map.set(r.ca_id, { ...r, children: [] }));

  const roots: CategoryTreeNode[] = [];
  for (const r of rows) {
    const n = map.get(r.ca_id)!;
    if (r.parent_id == null || !map.has(r.parent_id)) {
      roots.push(n);
    } else {
      map.get(r.parent_id)!.children.push(n);
    }
  }

  const sortFn = (a: CategoryTreeNode, b: CategoryTreeNode) =>
    a.sort_order - b.sort_order || a.ca_id - b.ca_id;

  function sortRec(nodes: CategoryTreeNode[]) {
    nodes.sort(sortFn);
    nodes.forEach((x) => sortRec(x.children));
  }
  roots.sort(sortFn);
  sortRec(roots);
  return roots;
}

/** DFS 순서의 플랫 리스트 (표에 행 순서 맞출 때 사용) */
export function flattenCategoryTreeDFS(
  roots: CategoryTreeNode[]
): CategoryTreeNode[] {
  const out: CategoryTreeNode[] = [];
  function walk(nodes: CategoryTreeNode[]) {
    for (const n of nodes) {
      out.push(n);
      walk(n.children);
    }
  }
  walk(roots);
  return out;
}

/** 루트부터 해당 카테고리까지 전체 경로 (한글명, ` › ` 구분) */
export function getCategoryFullPath(
  rows: AdminSpgCategoryRow[],
  caId: number
): string {
  const byId = new Map(rows.map((r) => [r.ca_id, r]));
  const parts: string[] = [];
  let cur: number | null = caId;
  let guard = 0;
  while (cur != null && guard++ < 50) {
    const r = byId.get(cur);
    if (!r) break;
    parts.unshift(r.name_ko);
    cur = r.parent_id;
  }
  return parts.join(" › ");
}

export function depthShortLabel(depth: number): string {
  if (depth === 1) return "1뎁스";
  if (depth === 2) return "2뎁스";
  if (depth === 3) return "3뎁스";
  return `${depth}뎁스`;
}

export function depthRoleLabel(depth: number): string {
  if (depth === 1) return "대분류";
  if (depth === 2) return "중분류";
  if (depth === 3) return "소분류";
  return "";
}

/** 직속 상위까지 경로 (한글). 1뎁스면 "상위 없음" */
export function getCategoryParentPathLabel(
  rows: AdminSpgCategoryRow[],
  caId: number
): string {
  const r = rows.find((x) => x.ca_id === caId);
  if (!r) return "";
  if (r.parent_id == null) return "상위 없음 (최상위 대분류)";
  return getCategoryFullPath(rows, r.parent_id);
}
