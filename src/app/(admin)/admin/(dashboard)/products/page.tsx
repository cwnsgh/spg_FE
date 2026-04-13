"use client";

import {
  ApiError,
  deleteAdminSpgProduct,
  getAdminSpgCategories,
  getAdminSpgProduct,
  getAdminSpgProducts,
  type AdminSpgCategoryRow,
  type AdminSpgProductDetail,
  type AdminSpgProductRow,
} from "@/api";
import { toBackendAssetUrl } from "@/api/config";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductFormModal } from "./ProductFormModal";
import styles from "./page.module.css";
import {
  buildCategoryTree,
  flattenCategoryTreeDFS,
  getCategoryFullPath,
  depthShortLabel,
  depthRoleLabel,
  type CategoryTreeNode,
} from "./categoryTreeUtils";

function depthBadgeClass(depth: number): string {
  if (depth === 1) return styles.d1;
  if (depth === 2) return styles.d2;
  if (depth === 3) return styles.d3;
  return styles.dN;
}

/** 목록 API에 분류가 비어 있을 때 대비 (구 서버·누락 필드) */
function normalizeCaIds(p: AdminSpgProductRow): number[] {
  const raw = p.ca_ids as unknown;
  if (Array.isArray(raw)) {
    return raw.map((x) => Number(x)).filter((x) => !Number.isNaN(x));
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((x) => !Number.isNaN(x));
  }
  return [];
}

const ENRICH_CA_IDS_CAP = 100;
const ENRICH_CHUNK = 12;

async function enrichMissingCaIds(
  rows: AdminSpgProductRow[]
): Promise<{ rows: AdminSpgProductRow[]; skipped: number }> {
  const base = rows.map((p) => ({ ...p, ca_ids: normalizeCaIds(p) }));
  const missing = base.filter((p) => !p.ca_ids.length);
  if (missing.length === 0) return { rows: base, skipped: 0 };
  const slice = missing.slice(0, ENRICH_CA_IDS_CAP);
  const map = new Map<number, number[]>();
  for (let i = 0; i < slice.length; i += ENRICH_CHUNK) {
    const part = slice.slice(i, i + ENRICH_CHUNK);
    const settled = await Promise.all(
      part.map(async (p) => {
        try {
          const d = await getAdminSpgProduct(p.pr_id);
          return [p.pr_id, d.ca_ids ?? []] as const;
        } catch {
          return [p.pr_id, [] as number[]] as const;
        }
      })
    );
    for (const [id, ids] of settled) map.set(id, ids);
  }
  const merged = base.map((p) =>
    map.has(p.pr_id) ? { ...p, ca_ids: map.get(p.pr_id)! } : p
  );
  const skipped = Math.max(0, missing.length - ENRICH_CA_IDS_CAP);
  return { rows: merged, skipped };
}

function featuresPreviewText(features: unknown): string {
  if (features == null) return "";
  if (Array.isArray(features)) {
    return features
      .map((x) => (typeof x === "string" ? x.trim() : String(x)))
      .filter(Boolean)
      .join("\n");
  }
  if (typeof features === "string") return features.trim();
  return "";
}

function filterSubtreeRoots(
  roots: CategoryTreeNode[],
  targetId: number
): CategoryTreeNode[] {
  function walk(nodes: CategoryTreeNode[]): CategoryTreeNode | null {
    for (const x of nodes) {
      if (x.ca_id === targetId) return x;
      const f = walk(x.children);
      if (f) return f;
    }
    return null;
  }
  const hit = walk(roots);
  return hit ? [hit] : roots;
}

function CategoryProductTree({
  nodes,
  expandedIds,
  toggleExpand,
  selectedCaId,
  onSelectCategory,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onSelectProduct,
  productsByCaId,
  categoryRows,
  selectedPrId,
}: {
  nodes: CategoryTreeNode[];
  expandedIds: Set<number>;
  toggleExpand: (id: number) => void;
  selectedCaId: number | null;
  selectedPrId: number | null;
  onSelectCategory: (id: number) => void;
  onAddProduct: (caId: number) => void;
  onEditProduct: (prId: number) => void;
  onDeleteProduct: (prId: number) => void;
  onSelectProduct: (prId: number, caId: number) => void;
  productsByCaId: Map<number, AdminSpgProductRow[]>;
  categoryRows: AdminSpgCategoryRow[];
}) {
  return (
    <>
      {nodes.map((n) => {
        const prods = productsByCaId.get(n.ca_id) ?? [];
        const hasKids = n.children.length > 0;
        const hasProds = prods.length > 0;
        const showToggle = hasKids || hasProds;
        const expanded = expandedIds.has(n.ca_id);
        const depthIndent = Math.max(0, n.depth - 1) * 1.125;
        const productIndent = depthIndent + 2.75;

        const canAddProductHere = n.depth > 1;

        return (
          <div key={n.ca_id} className={styles.ptreeNode}>
            <div
              className={`${styles.ptreeCatRow} ${
                !canAddProductHere ? styles.ptreeCatRowNoAdd : ""
              } ${selectedCaId === n.ca_id ? styles.ptreeRowSelected : ""}`}
              style={{
                paddingLeft: `${depthIndent}rem`,
              }}
            >
              {showToggle ? (
                <button
                  type="button"
                  className={styles.ptreeToggle}
                  aria-expanded={expanded}
                  title={expanded ? "접기" : "펼치기"}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(n.ca_id);
                  }}
                >
                  {expanded ? "▼" : "▶"}
                </button>
              ) : (
                <span className={styles.ptreeToggleSpacer} aria-hidden />
              )}
              <button
                type="button"
                className={styles.ptreeCatMain}
                onClick={() => onSelectCategory(n.ca_id)}
              >
                <span className={styles.ptreeCatLine1}>
                  <span
                    className={`${styles.miniDepth} ${depthBadgeClass(
                      n.depth
                    )}`}
                  >
                    {depthShortLabel(n.depth)}
                  </span>
                  <span className={styles.ptreeCatName}>{n.name_ko}</span>
                  {canAddProductHere && (
                    <span className={styles.ptreeCount}>{prods.length}</span>
                  )}
                </span>
                <span className={styles.ptreePathHint}>
                  {getCategoryFullPath(categoryRows, n.ca_id)}
                </span>
              </button>
              {canAddProductHere && (
                <button
                  type="button"
                  className={styles.ptreeAddBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddProduct(n.ca_id);
                  }}
                >
                  + 제품
                </button>
              )}
            </div>
            {expanded && (
              <div className={styles.ptreeNested}>
                {hasProds && (
                  <ul className={styles.ptreeProductList}>
                    {prods.map((p) => (
                      <li
                        key={p.pr_id}
                        className={`${styles.ptreeProductRow} ${
                          selectedPrId === p.pr_id
                            ? styles.ptreeProductRowSelected
                            : ""
                        }`}
                        style={{
                          paddingLeft: `${productIndent}rem`,
                        }}
                      >
                        <button
                          type="button"
                          className={styles.ptreeProductSelect}
                          onClick={() => onSelectProduct(p.pr_id, n.ca_id)}
                        >
                          <span className={styles.ptreeProductTag}>제품</span>
                          <span className={styles.ptreeProductName}>
                            {p.name_ko}
                          </span>
                          <span className={styles.ptreeProductId}>
                            #{p.pr_id}
                          </span>
                        </button>
                        <div className={styles.ptreeProductActions}>
                          <button
                            type="button"
                            className={`${styles.ptreeActionBtn} ${styles.ptreeActionBtnGhost}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditProduct(p.pr_id);
                            }}
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            className={`${styles.ptreeActionBtn} ${styles.ptreeActionBtnDanger}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteProduct(p.pr_id);
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {hasKids && (
                  <CategoryProductTree
                    nodes={n.children}
                    expandedIds={expandedIds}
                    toggleExpand={toggleExpand}
                    selectedCaId={selectedCaId}
                    selectedPrId={selectedPrId}
                    onSelectCategory={onSelectCategory}
                    onAddProduct={onAddProduct}
                    onEditProduct={onEditProduct}
                    onDeleteProduct={onDeleteProduct}
                    onSelectProduct={onSelectProduct}
                    productsByCaId={productsByCaId}
                    categoryRows={categoryRows}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<AdminSpgCategoryRow[]>([]);
  const [products, setProducts] = useState<AdminSpgProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterCaIdInput, setFilterCaIdInput] = useState<string>("");
  const [search, setSearch] = useState("");
  const [filterCaId, setFilterCaId] = useState<string>("");

  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());
  const [selectedCaId, setSelectedCaId] = useState<number | null>(null);
  const [selectedPrId, setSelectedPrId] = useState<number | null>(null);
  const [previewDetail, setPreviewDetail] = useState<AdminSpgProductDetail | null>(
    null
  );
  const [previewLoading, setPreviewLoading] = useState(false);
  /** 모달 저장 후 같은 제품 미리보기 다시 로드 */
  const [previewRev, setPreviewRev] = useState(0);
  const [enrichNote, setEnrichNote] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [createPresetCaIds, setCreatePresetCaIds] = useState<number[]>([]);

  const categoryTreeRoots = useMemo(
    () => buildCategoryTree(categories),
    [categories]
  );

  const categoryOptionsFlat = useMemo(
    () => flattenCategoryTreeDFS(categoryTreeRoots),
    [categoryTreeRoots]
  );

  const treeRootsToShow = useMemo(() => {
    if (!filterCaId) return categoryTreeRoots;
    return filterSubtreeRoots(categoryTreeRoots, Number(filterCaId));
  }, [categoryTreeRoots, filterCaId]);

  const prevFilterCaRef = useRef<string | null>(null);
  const prevCategoryCountRef = useRef(0);

  useEffect(() => {
    const roots = filterCaId
      ? filterSubtreeRoots(categoryTreeRoots, Number(filterCaId))
      : categoryTreeRoots;
    if (roots.length === 0) return;

    const filterChanged = prevFilterCaRef.current !== filterCaId;
    const catsFirstPaint =
      prevCategoryCountRef.current === 0 && categories.length > 0;

    prevFilterCaRef.current = filterCaId;
    prevCategoryCountRef.current = categories.length;

    if (filterChanged || catsFirstPaint) {
      setExpandedIds(
        new Set(flattenCategoryTreeDFS(roots).map((c) => c.ca_id))
      );
    }
  }, [filterCaId, categories.length, categoryTreeRoots]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getAdminSpgCategories();
      setCategories(data);
    } catch {
      /* 목록만 실패 시 제품 쪽에서 재시도 */
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await fetchCategories();
      setEnrichNote("");
      let data = await getAdminSpgProducts({
        search_name: search.trim() || undefined,
        ca_id: filterCaId ? Number(filterCaId) : undefined,
      });
      const { rows, skipped } = await enrichMissingCaIds(data);
      if (skipped > 0) {
        setEnrichNote(
          `분류 정보가 비어 있던 제품 ${skipped}건은 한 번에 보강하지 않았습니다. 목록을 나누어 관리하거나 서버 목록 API를 최신으로 맞춰 주세요.`
        );
      }
      setProducts(rows);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "목록을 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [search, filterCaId, fetchCategories]);

  const applyFilters = () => {
    setSearch(searchInput);
    setFilterCaId(filterCaIdInput);
  };

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (selectedPrId == null) {
      setPreviewDetail(null);
      setPreviewLoading(false);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewDetail(null);
    void getAdminSpgProduct(selectedPrId)
      .then((d) => {
        if (!cancelled) setPreviewDetail(d);
      })
      .catch(() => {
        if (!cancelled) setPreviewDetail(null);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPrId, previewRev]);

  const displayProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name_ko.toLowerCase().includes(q) ||
        (p.name_en ?? "").toLowerCase().includes(q)
    );
  }, [products, search]);

  const productsByCaId = useMemo(() => {
    const m = new Map<number, AdminSpgProductRow[]>();
    for (const p of displayProducts) {
      const ids = normalizeCaIds(p);
      for (const cid of ids) {
        if (!m.has(cid)) m.set(cid, []);
        const row = m.get(cid)!;
        if (!row.some((x) => x.pr_id === p.pr_id)) row.push(p);
      }
    }
    return m;
  }, [displayProducts]);

  const uncategorized = useMemo(
    () => displayProducts.filter((p) => !normalizeCaIds(p).length),
    [displayProducts]
  );

  const selectedCategoryRow = useMemo(
    () => categories.find((c) => c.ca_id === selectedCaId) ?? null,
    [categories, selectedCaId]
  );

  const selectedCategoryProducts = useMemo(() => {
    if (selectedCaId == null) return [];
    return productsByCaId.get(selectedCaId) ?? [];
  }, [productsByCaId, selectedCaId]);

  const selectedListProduct = useMemo(
    () =>
      selectedPrId == null
        ? null
        : (products.find((p) => p.pr_id === selectedPrId) ?? null),
    [products, selectedPrId]
  );

  const selectCategoryOnly = (caId: number) => {
    setSelectedCaId(caId);
    setSelectedPrId(null);
  };

  const selectProductFromTree = (prId: number, caId: number) => {
    setSelectedCaId(caId);
    setSelectedPrId(prId);
  };

  const toggleTreeExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setCreatePresetCaIds([]);
    setModalOpen(true);
  };

  const openCreateUnderCategory = (caId: number) => {
    const row = categories.find((c) => c.ca_id === caId);
    if (!row || row.depth <= 1) return;
    setMode("create");
    setEditingId(null);
    setCreatePresetCaIds([caId]);
    setModalOpen(true);
  };

  const openEdit = (prId: number) => {
    setMode("edit");
    setEditingId(prId);
    setModalOpen(true);
  };

  const closeProductModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (prId: number) => {
    if (!window.confirm("이 상품을 삭제할까요?")) return;
    try {
      await deleteAdminSpgProduct(prId, false);
      if (selectedPrId === prId) setSelectedPrId(null);
      void fetchProducts();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "삭제에 실패했습니다.");
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.heroCard}>
        <p className={styles.eyebrow}>제품소개 · 관리</p>
        <h1 className={styles.title}>제품 콘텐츠</h1>
        <p className={styles.description}>
          왼쪽은 <strong>카테고리 트리</strong>입니다.{" "}
          <strong>2·3차 분류</strong> 줄 오른쪽 <strong>+ 제품</strong>으로 그
          분류에 바로 등록할 수 있고(1차 대분류에는 없음), 펼치면 연결된 제품이
          그 아래에 붙어 나옵니다. 분류 줄을 누르면 오른쪽에 그 분류 제품 목록이
          나오고, <strong>제품 줄</strong>을 누르면 같은 칸에서 해당 제품
          미리보기가 열립니다.
        </p>
        <p className={styles.legendBox}>
          목록에 분류 ID가 안 내려오는 구 서버에서는, 로딩 시 제품 상세를 잠깐씩
          불러와 분류를 채웁니다. 같은 제품이 여러 분류에 있으면 트리에 여러 번
          보일 수 있습니다.
        </p>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.toolbar}>
          <select
            className={styles.filterSelect}
            value={filterCaIdInput}
            onChange={(e) => setFilterCaIdInput(e.target.value)}
          >
            <option value="">전체 트리</option>
            {categoryOptionsFlat.map((c) => (
              <option key={c.ca_id} value={String(c.ca_id)}>
                [{depthShortLabel(c.depth)}]{" "}
                {getCategoryFullPath(categories, c.ca_id)}
              </option>
            ))}
          </select>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="상품명 검색 (적용 후 목록·그룹 반영)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters();
            }}
          />
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={applyFilters}
          >
            필터 적용
          </button>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => {
              setSearchInput("");
              setFilterCaIdInput("");
              setSearch("");
              setFilterCaId("");
            }}
          >
            초기화
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={openCreate}
          >
            새 제품
          </button>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}
        {enrichNote && !loading && (
          <div className={styles.warnBox}>{enrichNote}</div>
        )}

        {loading ? (
          <div className={styles.loading}>불러오는 중… (분류 보강 포함)</div>
        ) : (
          <div className={styles.productWorkbench}>
            <div className={styles.productTreePanel}>
              <h3 className={styles.panelHeading}>카테고리 · 제품 트리</h3>
              <p className={styles.panelSub}>
                ▶/▼ 펼침 · 분류 클릭 → 오른쪽 목록 · 제품 이름 클릭 → 미리보기 ·{" "}
                <strong>+ 제품</strong>은 2·3차만
              </p>
              <div className={styles.productTreeScroll}>
                {treeRootsToShow.length === 0 ? (
                  <p className={styles.panelSub}>카테고리가 없습니다.</p>
                ) : (
                  <CategoryProductTree
                    nodes={treeRootsToShow}
                    expandedIds={expandedIds}
                    toggleExpand={toggleTreeExpand}
                    selectedCaId={selectedCaId}
                    selectedPrId={selectedPrId}
                    onSelectCategory={selectCategoryOnly}
                    onAddProduct={openCreateUnderCategory}
                    onEditProduct={(id) => void openEdit(id)}
                    onDeleteProduct={(id) => void handleDelete(id)}
                    onSelectProduct={selectProductFromTree}
                    productsByCaId={productsByCaId}
                    categoryRows={categories}
                  />
                )}
              </div>
              {uncategorized.length > 0 && (
                <div className={styles.unmappedBox}>
                  <p className={styles.unmappedTitle}>
                    분류 미지정 제품 ({uncategorized.length})
                  </p>
                  <ul className={styles.unmappedList}>
                    {uncategorized.map((p) => (
                      <li
                        key={p.pr_id}
                        className={`${styles.unmappedRow} ${
                          selectedPrId === p.pr_id
                            ? styles.ptreeProductRowSelected
                            : ""
                        }`}
                      >
                        <button
                          type="button"
                          className={styles.unmappedNameBtn}
                          onClick={() => {
                            setSelectedCaId(null);
                            setSelectedPrId(p.pr_id);
                          }}
                        >
                          #{p.pr_id} {p.name_ko}
                        </button>
                        <button
                          type="button"
                          className={`${styles.ptreeActionBtn} ${styles.ptreeActionBtnGhost}`}
                          onClick={() => void openEdit(p.pr_id)}
                        >
                          수정
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className={styles.productDetailPanel}>
              {selectedPrId != null ? (
                <>
                  <div className={styles.detailHead}>
                    <div>
                      <h3 className={styles.panelHeading}>제품 미리보기</h3>
                      <p className={styles.detailMeta}>
                        왼쪽에서 고른 제품 · ID #{selectedPrId}
                      </p>
                    </div>
                    <div className={styles.productPreviewActions}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => setSelectedPrId(null)}
                      >
                        {selectedCaId != null ? "목록으로" : "닫기"}
                      </button>
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => void openEdit(selectedPrId)}
                      >
                        수정
                      </button>
                    </div>
                  </div>
                  {previewLoading ? (
                    <p className={styles.panelSub}>불러오는 중…</p>
                  ) : !previewDetail && !selectedListProduct ? (
                    <p className={styles.panelSub}>
                      제품 정보를 찾을 수 없습니다.
                    </p>
                  ) : (
                    <div className={styles.productPreview}>
                      <div className={styles.productPreviewTop}>
                        <div className={styles.productPreviewImageWrap}>
                          {(previewDetail?.image_url || selectedListProduct?.image_url)?.trim() ? (
                            <img
                              className={styles.productPreviewImage}
                              src={toBackendAssetUrl(
                                (previewDetail?.image_url ||
                                  selectedListProduct?.image_url) as string
                              )}
                              alt=""
                            />
                          ) : (
                            <span className={styles.productPreviewImagePlaceholder}>
                              대표 이미지 없음
                            </span>
                          )}
                        </div>
                        <div className={styles.productPreviewBody}>
                          <h4 className={styles.productPreviewTitle}>
                            {previewDetail?.name_ko ??
                              selectedListProduct?.name_ko ??
                              "—"}
                          </h4>
                          <p className={styles.productPreviewSub}>
                            {previewDetail?.name_en ??
                              selectedListProduct?.name_en ??
                              ""}
                          </p>
                          <span
                            className={`${styles.badge} ${
                              (previewDetail ?? selectedListProduct)?.is_active
                                ? styles.badgeOn
                                : styles.badgeOff
                            }`}
                          >
                            {(previewDetail ?? selectedListProduct)?.is_active
                              ? "노출 ON"
                              : "노출 OFF"}
                          </span>
                          {(previewDetail?.summary_ko ||
                            selectedListProduct?.summary_ko) && (
                            <p className={styles.productPreviewSummary}>
                              [요약 KO]{" "}
                              {previewDetail?.summary_ko ??
                                selectedListProduct?.summary_ko}
                            </p>
                          )}
                          {(previewDetail?.summary_en ||
                            selectedListProduct?.summary_en) && (
                            <p className={styles.productPreviewSummary}>
                              [요약 EN]{" "}
                              {previewDetail?.summary_en ??
                                selectedListProduct?.summary_en}
                            </p>
                          )}
                          {featuresPreviewText(previewDetail?.features_ko) ? (
                            <p className={styles.productPreviewSummary}>
                              [특징 KO] {featuresPreviewText(previewDetail?.features_ko)}
                            </p>
                          ) : null}
                          {featuresPreviewText(previewDetail?.features_en) ? (
                            <p className={styles.productPreviewSummary}>
                              [특징 EN] {featuresPreviewText(previewDetail?.features_en)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className={styles.productPreviewActions}>
                        <button
                          type="button"
                          className={styles.dangerButton}
                          onClick={() => void handleDelete(selectedPrId)}
                        >
                          삭제
                        </button>
                      </div>
                      {previewDetail?.files && previewDetail.files.length > 0 ? (
                        <div className={styles.productPreviewFiles}>
                          <p className={styles.productPreviewFilesTitle}>
                            첨부·PDF ({previewDetail.files.length})
                          </p>
                          <ul className={styles.productPreviewFileList}>
                            {previewDetail.files.map((f, i) => (
                              <li key={`${f.file_path}-${i}`}>
                                <a
                                  className={styles.productPreviewFileLink}
                                  href={toBackendAssetUrl(f.file_path)}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {f.origin_name || f.file_path}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  )}
                </>
              ) : selectedCaId == null ? (
                <>
                  <h3 className={styles.panelHeading}>분류 · 제품</h3>
                  <p className={styles.panelSub}>
                    왼쪽에서 분류를 고르면 이 칸에 제품 목록이 나오고, 트리에서
                    제품 줄을 누르면 여기서 미리보기를 볼 수 있습니다.
                  </p>
                </>
              ) : (
                <>
                  <div className={styles.detailHead}>
                    <div>
                      <h3 className={styles.panelHeading}>
                        {selectedCategoryRow?.name_ko ?? `ID ${selectedCaId}`}
                      </h3>
                      <p className={styles.detailPath}>
                        {getCategoryFullPath(categories, selectedCaId)}
                      </p>
                      <p className={styles.detailMeta}>
                        {depthShortLabel(selectedCategoryRow?.depth ?? 0)} ·{" "}
                        {depthRoleLabel(selectedCategoryRow?.depth ?? 0)} · 제품{" "}
                        {selectedCategoryProducts.length}개
                      </p>
                    </div>
                    {(selectedCategoryRow?.depth ?? 0) > 1 && (
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => openCreateUnderCategory(selectedCaId)}
                      >
                        + 이 분류에 제품
                      </button>
                    )}
                  </div>
                  {selectedCategoryProducts.length === 0 ? (
                    <p className={styles.panelSub}>
                      {(selectedCategoryRow?.depth ?? 0) <= 1 ? (
                        <>
                          1차(대분류)에는 제품을 직접 연결하지 않습니다.{" "}
                          <strong>2·3차 분류</strong>를 선택한 뒤 제품을
                          등록하세요.
                        </>
                      ) : (
                        <>
                          이 분류에 연결된 제품이 없습니다. 위 버튼이나 트리의{" "}
                          <strong>+ 제품</strong>을 사용하세요.
                        </>
                      )}
                    </p>
                  ) : (
                    <table className={styles.miniTable}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>상품명</th>
                          <th>영문</th>
                          <th>노출</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCategoryProducts.map((p) => (
                          <tr
                            key={p.pr_id}
                            className={
                              selectedPrId === p.pr_id
                                ? styles.miniTableRowSelected
                                : undefined
                            }
                            onClick={() => setSelectedPrId(p.pr_id)}
                          >
                            <td>{p.pr_id}</td>
                            <td>{p.name_ko}</td>
                            <td>{p.name_en}</td>
                            <td>
                              <span
                                className={`${styles.badge} ${
                                  p.is_active ? styles.badgeOn : styles.badgeOff
                                }`}
                              >
                                {p.is_active ? "ON" : "OFF"}
                              </span>
                            </td>
                            <td>
                              <div className={styles.rowActions}>
                                <button
                                  type="button"
                                  className={styles.ghostButton}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void openEdit(p.pr_id);
                                  }}
                                >
                                  수정
                                </button>
                                <button
                                  type="button"
                                  className={styles.dangerButton}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void handleDelete(p.pr_id);
                                  }}
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {modalOpen && (
        <ProductFormModal
          open
          onClose={closeProductModal}
          mode={mode}
          editPrId={editingId}
          createPresetCaIds={createPresetCaIds}
          categories={categories}
          onSaved={() => {
            void fetchProducts();
            setPreviewRev((r) => r + 1);
          }}
        />
      )}
    </div>
  );
}
