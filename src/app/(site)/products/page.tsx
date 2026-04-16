"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import HeroBanner, { BreadcrumbItem } from "../../components/HeroBanner";
import Breadcrumb from "../../components/Breadcrumb";
import ProductNavigation from "../../products/components/ProductNavigation";
import ProductGrid from "../../products/components/ProductGrid";
import ProductDepth3Select from "../../products/components/ProductDepth3Select";
import productBanner from "../../../assets/product_banner.png";
import {
  fetchProductCategoryTree,
  fetchProductList,
  type ProductCategoryNode,
  type ProductListItem,
} from "@/api/product";
import { toBackendAssetUrl } from "@/api/config";
import styles from "../../products/page.module.css";
import type { ProductSubCategory } from "../../products/data/productData";
import {
  type ProductSelection,
  parseProductSelection,
  replaceProductsUrl,
} from "../../products/utils/productSelectionUrl";

/**
 * 목록 1회 요청량을 줄여 첫 렌더/스크롤 시 메모리·디코딩 부하를 완화.
 * (서버 페이지네이션 연동 전까지의 안전한 상한)
 */
const PRODUCT_LIST_LIMIT = 48;
const PLACEHOLDER_IMAGE = "/images/products/prd_01.png";

function ProductsContentInner() {
  const searchParams = useSearchParams();

  const [tree, setTree] = useState<ProductCategoryNode[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState<string | null>(null);

  /** 사용자 클릭·뒤로가기 시에만 세팅. 없으면 URL(`parseProductSelection`) 기준 */
  const [selection, setSelection] = useState<ProductSelection | null>(null);
  const urlSyncedOnce = useRef(false);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [rows, setRows] = useState<ProductListItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCatLoading(true);
    setCatError(null);
    fetchProductCategoryTree()
      .then((data) => {
        if (!cancelled) setTree(data.tree ?? []);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setCatError(
            e instanceof Error ? e.message : "카테고리를 불러오지 못했습니다."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setCatLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedSelection = useMemo((): ProductSelection | null => {
    if (!tree.length) return null;
    if (selection) return selection;
    const q = searchParams.toString();
    const search = q ? `?${q}` : "";
    return parseProductSelection(tree, search);
  }, [tree, selection, searchParams]);

  /** GNB·브라우저 뒤로가기 등으로 Next가 `searchParams`를 바꾼 경우에만 상태 동기화 */
  const queryKey = searchParams.toString();
  useEffect(() => {
    if (!tree.length) return;
    const search = queryKey ? `?${queryKey}` : "";
    const sel = parseProductSelection(tree, search);
    if (sel) startTransition(() => setSelection(sel));
  }, [tree, queryKey]);

  /** 최초 로드 시 주소창을 `tab/sub/d3` 형태로 맞춤 (replaceState 한 번) */
  useEffect(() => {
    if (!resolvedSelection || urlSyncedOnce.current) return;
    replaceProductsUrl(resolvedSelection);
    urlSyncedOnce.current = true;
  }, [resolvedSelection]);

  /** 브라우저 뒤로/앞으로 */
  useEffect(() => {
    const onPopState = () => {
      if (!tree.length) return;
      const sel = parseProductSelection(tree, window.location.search);
      if (sel) startTransition(() => setSelection(sel));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [tree]);

  const applySelection = useCallback((next: ProductSelection) => {
    startTransition(() => {
      setSelection(next);
      replaceProductsUrl(next);
    });
  }, []);

  const roots = tree;
  const validRoot = resolvedSelection
    ? roots.find((r) => r.ca_id === resolvedSelection.rootId) ?? roots[0] ?? null
    : roots[0] ?? null;

  const subs = validRoot?.children ?? [];
  const validSub = resolvedSelection
    ? subs.length
      ? subs.find((s) => s.ca_id === resolvedSelection.subId) ?? subs[0]
      : null
    : subs.length
      ? subs[0]
      : null;

  const d3Options = validSub?.children ?? [];
  const validD3 =
    resolvedSelection &&
    d3Options.length > 0 &&
    resolvedSelection.d3Id != null &&
    d3Options.some((c) => c.ca_id === resolvedSelection.d3Id)
      ? resolvedSelection.d3Id
      : null;

  const filterCaId =
    validD3 ?? validSub?.ca_id ?? validRoot?.ca_id ?? undefined;

  const heroTabs = useMemo(
    () =>
      roots.map((r) => ({
        label: r.name_ko,
        value: r.ca_id,
      })),
    [roots]
  );

  const handleRootTab = useCallback(
    (tab: string | number) => {
      const id = Number(tab);
      const root = roots.find((r) => r.ca_id === id);
      const first = root?.children?.[0];
      applySelection({
        rootId: id,
        subId: first?.ca_id ?? null,
        d3Id: null,
      });
    },
    [roots, applySelection]
  );

  const navigationSubCategories: ProductSubCategory[] = useMemo(
    () =>
      subs.map((s) => ({
        id: String(s.ca_id),
        label: s.name_ko,
        title: { korean: s.name_ko, english: s.name_en },
        products: [],
      })),
    [subs]
  );

  const handleSubChange = useCallback(
    (subId: string) => {
      if (!validRoot) return;
      applySelection({
        rootId: validRoot.ca_id,
        subId: Number(subId),
        d3Id: null,
      });
    },
    [validRoot, applySelection]
  );

  const handleDepth3Change = useCallback(
    (caId: number | null) => {
      if (!validRoot || !validSub) return;
      applySelection({
        rootId: validRoot.ca_id,
        subId: validSub.ca_id,
        d3Id: caId,
      });
    },
    [validRoot, validSub, applySelection]
  );

  const handleSearch = useCallback(() => {
    setAppliedSearch(searchInput.trim());
  }, [searchInput]);

  useEffect(() => {
    if (filterCaId === undefined) return;
    let cancelled = false;
    setListLoading(true);
    setListError(null);
    fetchProductList({
      ca_id: filterCaId,
      search_name: appliedSearch || undefined,
      page: 1,
      limit: PRODUCT_LIST_LIMIT,
    })
      .then((data) => {
        if (!cancelled) setRows(data.list ?? []);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setListError(
            e instanceof Error ? e.message : "목록을 불러오지 못했습니다."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filterCaId, appliedSearch]);

  const gridProducts = useMemo(
    () =>
      rows.map((p) => ({
        id: String(p.pr_id),
        name: p.name_ko,
        nameEn: p.name_en ?? "",
        image: p.image_url
          ? toBackendAssetUrl(p.image_url)
          : PLACEHOLDER_IMAGE,
        detailUrl: `/products/${p.pr_id}`,
      })),
    [rows]
  );

  /** 목록 상단 큰 제목: 히어로 1뎁스 탭과 동일하게 루트(대분류)만 표시 */
  const currentTitle = {
    korean: validRoot?.name_ko ?? "",
    english: validRoot?.name_en ?? "",
  };

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const baseItems: BreadcrumbItem[] = [
      { label: "홈", href: "/" },
      { label: "제품소개", href: "/products" },
    ];
    if (validRoot?.name_ko) {
      baseItems.push({ label: validRoot.name_ko });
    }
    return baseItems;
  }, [validRoot?.name_ko]);

  if (catLoading) {
    return (
      <div className={styles.listStatus} aria-live="polite">
        카테고리를 불러오는 중입니다…
      </div>
    );
  }

  if (catError) {
    return (
      <div className={styles.errorBanner} role="alert">
        {catError}
      </div>
    );
  }

  if (!validRoot || !resolvedSelection) {
    return (
      <div className={styles.listStatus}>등록된 제품 카테고리가 없습니다.</div>
    );
  }

  return (
    <>
      <HeroBanner
        title="제품소개"
        backgroundImage={productBanner.src}
        tabs={heroTabs}
        activeTab={validRoot.ca_id}
        onTabChange={handleRootTab}
        useUrlParams={false}
      />

      <div className={styles.breadcrumbArea}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <section className={styles.products}>
        <div className={styles.titleArea}>
          <h1>
            {currentTitle.korean}
            <span className={styles.egFont}>{currentTitle.english}</span>
          </h1>
        </div>

        <div className={styles.searchArea}>
          <div className={styles.searchInputWrap}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="검색어를 입력해 주세요"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <button
              className={styles.searchBtn}
              type="button"
              aria-label="검색"
              onClick={handleSearch}
            />
          </div>
        </div>
        <div className={styles.productContent}>
          {navigationSubCategories.length > 0 && validSub ? (
            <ProductNavigation
              activeSubCategory={String(validSub.ca_id)}
              onSubCategoryChange={handleSubChange}
              subCategories={navigationSubCategories}
              categoryFiles={validRoot.files ?? []}
              subCategoryFiles={validSub.files ?? []}
            />
          ) : null}

          <div className={styles.productMainColumn}>
            {listError && (
              <div className={styles.errorBanner} role="alert">
                {listError}
              </div>
            )}
            {validSub && (
              <ProductDepth3Select
                options={d3Options.map((c) => ({
                  ca_id: c.ca_id,
                  name_ko: c.name_ko,
                }))}
                value={validD3}
                onChange={handleDepth3Change}
              />
            )}
            <ProductGrid products={gridProducts} />
          </div>
        </div>
      </section>
    </>
  );
}

function ProductsContent() {
  return (
    <Suspense fallback={<div className={styles.listStatus}>Loading…</div>}>
      <ProductsContentInner />
    </Suspense>
  );
}

export default function Products() {
  return (
    <main className={styles.main}>
      <ProductsContent />
    </main>
  );
}
