"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import HeroBanner from "../../../components/HeroBanner";
import Breadcrumb, { BreadcrumbItem } from "../../../components/Breadcrumb";
import {
  getProductById,
  type Product,
} from "../../../products/data/productData";
import {
  fetchProductCategoryTree,
  fetchProductDetail,
  type ProductCategoryNode,
  type ProductDetailPayload,
} from "@/api/product";
import { toBackendAssetUrl } from "@/api/config";
import productBanner from "../../../../assets/product_banner.png";
import {
  buildProductsUrl,
  buildProductsUrlForTreePath,
  findCategoryPathInTree,
  resolveActiveRootTabForProduct,
} from "../../../products/utils/productSelectionUrl";
import {
  devBackendAssetIframePath,
  toSameOriginAssetUrlForFetch,
} from "@/app/products/utils/pdfPreviewUrl";
import styles from "../../../products/[id]/page.module.css";

const PLACEHOLDER_IMAGE = "/images/products/prd_01.png";

/** `<a download>`용: 경로 제거·위험 문자 최소 제거(백엔드 신뢰 값 전제) */
function safeDownloadFileName(value: string | null | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  const base = raw.replace(/^.*[/\\]/, "").replace(/[/\\]+/g, "");
  if (!base) return undefined;
  return base.length > 220 ? base.slice(0, 220) : base;
}

function pickOriginName(
  dl: ProductDetailPayload["download_links"],
  kind: "pdf" | "dwg" | "stp"
): string | undefined {
  if (!dl) return undefined;
  const originKey = `${kind}_origin_name` as const;
  const nameKey = `${kind}_name` as const;
  const rec = dl as Record<string, string | null | undefined>;
  return safeDownloadFileName(rec[originKey] ?? rec[nameKey]);
}

/** API에 원본 파일명이 없을 때: 제품명 기반 제안명(업로드명과 다를 수 있음) */
const FALLBACK_KIND_SUFFIX: Record<"pdf" | "dwg" | "stp", string> = {
  pdf: "_catalog",
  dwg: "_2d",
  stp: "_3d",
};

function fallbackDownloadNameFromProduct(
  nameKo: string,
  nameEn: string | null | undefined,
  ext: "pdf" | "dwg" | "stp"
): string | undefined {
  const baseRaw = nameKo.trim() || (nameEn?.trim() ?? "");
  if (!baseRaw) return undefined;
  let base = baseRaw
    .replace(/[/\\:*?"<>|]+/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.\s]+$/g, "")
    .trim();
  if (!base) return undefined;

  const suffix = FALLBACK_KIND_SUFFIX[ext];
  const tail = `${suffix}.${ext}`;
  const maxBase = 220 - tail.length;
  if (maxBase < 1) {
    return safeDownloadFileName(`product${tail}`);
  }
  if (base.length > maxBase) {
    base = base.slice(0, maxBase).replace(/[.\s]+$/g, "").trim();
    if (!base) base = "product";
  }
  return safeDownloadFileName(`${base}${tail}`);
}

/** URL 경로의 실제 확장자(예: zip)와 제안명 확장자가 다르면 URL 쪽에 맞춤 */
function extensionFromUrlPath(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const seg = pathname.split("/").pop() || "";
    const dot = seg.lastIndexOf(".");
    if (dot < 0) return "";
    return seg.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/gi, "");
  } catch {
    return "";
  }
}

function finalDownloadName(
  suggested: string | undefined,
  url: string
): string {
  const extUrl = extensionFromUrlPath(url);
  const name = suggested?.trim();
  if (!name) {
    const fallback = extUrl ? `download.${extUrl}` : "download";
    return safeDownloadFileName(fallback) ?? fallback;
  }
  const safe = safeDownloadFileName(name) ?? name;
  if (!extUrl) return safe;
  const lower = safe.toLowerCase();
  if (lower.endsWith(`.${extUrl}`)) return safe;
  const withoutExt = safe.replace(/\.[^./\\]+$/, "");
  const base = withoutExt || "download";
  return safeDownloadFileName(`${base}.${extUrl}`) ?? `${base}.${extUrl}`;
}

/**
 * 원격 URL을 fetch→blob 후 `<a download>`로 저장해 **제안 파일명** 적용.
 * 백엔드 절대 URL은 CORS에 막히기 쉬우므로, 가능하면 `/__backend_asset` 등 동일 출처 프록시로 fetch.
 * 실패 시 새 탭으로 원본 URL 오픈(이름은 URL에 따름).
 */
async function downloadRemoteFileWithSuggestedName(
  url: string,
  suggestedFileName: string | undefined
): Promise<void> {
  const fileName = finalDownloadName(suggestedFileName, url);
  const fetchUrl = toSameOriginAssetUrlForFetch(url);
  try {
    const res = await fetch(fetchUrl, { mode: "cors", credentials: "omit" });
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2_000);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function ProductAssetDownloadButton({
  url,
  downloadName,
  className,
  children,
}: {
  url: string;
  downloadName?: string;
  className: string;
  children: ReactNode;
}) {
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await downloadRemoteFileWithSuggestedName(url, downloadName);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={busy}
    >
      {busy ? "다운로드 중…" : children}
    </button>
  );
}

function isNumericProductId(id: string): boolean {
  return /^\d+$/.test(id);
}

/** API는 문자열 배열, 예전 목업은 `{ korean, english }[]` 둘 다 수용 */
function normalizeFeaturePairs(
  koRaw: unknown,
  enRaw: unknown
): { korean: string; english: string }[] {
  if (!Array.isArray(koRaw) || koRaw.length === 0) return [];
  const first = koRaw[0];
  if (typeof first === "object" && first !== null && "korean" in first) {
    return koRaw as { korean: string; english: string }[];
  }
  const en = Array.isArray(enRaw) ? enRaw : [];
  return koRaw.map((k, i) => ({
    korean: String(k),
    english: String(en[i] ?? ""),
  }));
}

function mapApiProductToView(p: ProductDetailPayload): {
  name: string;
  nameEn: string;
  image: string;
  description?: string;
  descriptionEn?: string;
  features: { korean: string; english: string }[];
  /** file_type 0 — PHP `download_links.pdf` */
  pdfUrl: string | null;
  /** file_type 1 — `download_links.dwg` */
  dwgUrl: string | null;
  /** file_type 2 — `download_links.stp` */
  stpUrl: string | null;
  pdfDownloadName?: string;
  dwgDownloadName?: string;
  stpDownloadName?: string;
  content?: string;
} {
  const dl = p.download_links;
  return {
    name: p.name_ko,
    nameEn: p.name_en ?? "",
    image: p.image_url ? toBackendAssetUrl(p.image_url) : PLACEHOLDER_IMAGE,
    description: p.summary_ko ?? undefined,
    descriptionEn: p.summary_en ?? undefined,
    features: normalizeFeaturePairs(p.features_ko, p.features_en),
    pdfUrl: dl?.pdf ? toBackendAssetUrl(dl.pdf) : null,
    dwgUrl: dl?.dwg ? toBackendAssetUrl(dl.dwg) : null,
    stpUrl: dl?.stp ? toBackendAssetUrl(dl.stp) : null,
    pdfDownloadName:
      pickOriginName(dl, "pdf") ??
      (dl?.pdf
        ? fallbackDownloadNameFromProduct(p.name_ko, p.name_en, "pdf")
        : undefined),
    dwgDownloadName:
      pickOriginName(dl, "dwg") ??
      (dl?.dwg
        ? fallbackDownloadNameFromProduct(p.name_ko, p.name_en, "dwg")
        : undefined),
    stpDownloadName:
      pickOriginName(dl, "stp") ??
      (dl?.stp
        ? fallbackDownloadNameFromProduct(p.name_ko, p.name_en, "stp")
        : undefined),
    content: undefined,
  };
}

/** Chromium 내장 PDF에 툴바 숨김 요청(지원 여부는 브라우저에 따름). */
function withChromiumPdfObjectFlags(src: string): string {
  if (!src || src.includes("#")) return src;
  return `${src}#toolbar=0&navpanes=0`;
}

/**
 * PDF: fetch(동일 출처 프록시 우선) → `File`로 제목 후보를 붙인 blob URL → `<object>` 기본 뷰어.
 * - 브라우저 상단/탭에 보이는 이름은 **완전히 보장되지 않음**(뷰어가 PDF 메타데이터·URL을 쓰기도 함).
 * - fetch 실패 시에만 `/__backend_asset` 직링크 폴백(이름은 URL에 따름).
 */
function ProductPdfPreview({
  pdfUrl,
  productName,
  suggestedFileName,
}: {
  pdfUrl: string;
  productName: string;
  /** 다운로드와 동일 규칙(원본명·제품명 fallback) — 뷰어에 쓸 파일명 후보 */
  suggestedFileName?: string;
}) {
  const [docSrc, setDocSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const displayFileName = finalDownloadName(suggestedFileName, pdfUrl);
    const fetchUrl = toSameOriginAssetUrlForFetch(pdfUrl);

    setLoading(true);
    setDocSrc(null);

    fetch(fetchUrl, { mode: "cors", credentials: "omit" })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.blob();
      })
      .then((blob) => {
        const file = new File([blob], displayFileName, {
          type: blob.type || "application/pdf",
        });
        const u = URL.createObjectURL(file);
        if (cancelled) {
          URL.revokeObjectURL(u);
          return;
        }
        objectUrl = u;
        setDocSrc(u);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        const iframeSrc = devBackendAssetIframePath(pdfUrl);
        if (iframeSrc) {
          setDocSrc(iframeSrc);
        } else {
          setDocSrc(null);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pdfUrl, suggestedFileName]);

  return (
    <div className={styles.productPdfViewer}>
      {docSrc ? (
        <div className={styles.productPdfEmbed}>
          <object
            type="application/pdf"
            data={withChromiumPdfObjectFlags(docSrc)}
            title={`${productName} PDF`}
            className={styles.productPdfObject}
          >
            <div className={styles.productPdfFallback}>
              <p>이 브라우저에서 PDF를 바로 표시하지 못했습니다.</p>
              <a
                href={pdfUrl}
                className={styles.productPdfFallbackLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                PDF 파일 열기
              </a>
            </div>
          </object>
        </div>
      ) : loading ? (
        <p className={styles.productPdfLoading} role="status">
          PDF 불러오는 중…
        </p>
      ) : (
        <div className={styles.productPdfFallback}>
          <p>
            보안 설정(X-Frame-Options·CORS) 때문에 여기서는 PDF를 띄울 수
            없습니다.
          </p>
          <a
            href={pdfUrl}
            className={styles.productPdfFallbackLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            PDF 파일 열기
          </a>
        </div>
      )}
    </div>
  );
}

function mapStaticProductToView(
  product: Product
): ReturnType<typeof mapApiProductToView> {
  return {
    name: product.name,
    nameEn: product.nameEn,
    image: product.image,
    description: product.description,
    descriptionEn: product.descriptionEn,
    features: product.features ?? [],
    /** 예전 목업: `catalogPdfUrl`=도면(DWG), `technicalPdfUrl`=PDF */
    pdfUrl: product.technicalPdfUrl ?? null,
    dwgUrl: product.catalogPdfUrl ?? null,
    stpUrl: null as string | null,
    pdfDownloadName: product.technicalPdfUrl
      ? fallbackDownloadNameFromProduct(product.name, product.nameEn, "pdf")
      : undefined,
    dwgDownloadName: product.catalogPdfUrl
      ? fallbackDownloadNameFromProduct(product.name, product.nameEn, "dwg")
      : undefined,
    stpDownloadName: undefined,
    content: product.content,
  };
}

export default function ProductDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const useApi = isNumericProductId(id);

  const [apiProduct, setApiProduct] = useState<ProductDetailPayload | null>(
    null
  );
  const [loadError, setLoadError] = useState(false);
  /** 숫자 id(API)는 첫 페인트부터 로딩으로 두어 notFound 오동작 방지 */
  const [loading, setLoading] = useState(useApi);

  const [categoryTree, setCategoryTree] = useState<ProductCategoryNode[]>([]);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setCatLoading(true);
    fetchProductCategoryTree()
      .then((payload) => {
        if (!cancelled) setCategoryTree(payload.tree ?? []);
      })
      .catch(() => {
        if (!cancelled) setCategoryTree([]);
      })
      .finally(() => {
        if (!cancelled) setCatLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!useApi) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    setApiProduct(null);
    fetchProductDetail(Number(id))
      .then((data) => {
        if (!cancelled) setApiProduct(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, useApi]);

  const view = useMemo(() => {
    if (useApi) {
      if (!apiProduct) return null;
      return mapApiProductToView(apiProduct);
    }
    const staticP = getProductById(id);
    if (!staticP) return null;
    return mapStaticProductToView(staticP);
  }, [id, useApi, apiProduct]);

  const heroTabs = useMemo(
    () =>
      categoryTree.map((r) => ({
        label: r.name_ko,
        value: r.ca_id,
      })),
    [categoryTree]
  );

  const activeRootTab = useMemo(() => {
    if (!categoryTree.length) return undefined;
    if (useApi && apiProduct?.categories?.length) {
      const tab = resolveActiveRootTabForProduct(
        categoryTree,
        apiProduct.categories
      );
      if (tab != null) return tab;
    }
    return categoryTree[0].ca_id;
  }, [categoryTree, useApi, apiProduct]);

  const handleRootTab = useCallback(
    (tab: string | number) => {
      const rootId = Number(tab);
      const root = categoryTree.find((r) => r.ca_id === rootId);
      const firstSub = root?.children?.[0];
      router.push(
        buildProductsUrl({
          rootId,
          subId: firstSub?.ca_id ?? null,
          d3Id: null,
        })
      );
    },
    [categoryTree, router]
  );

  const listHref = useMemo(() => {
    if (activeRootTab == null || !categoryTree.length) return "/products";
    const root = categoryTree.find((r) => r.ca_id === activeRootTab);
    const firstSub = root?.children?.[0];
    return buildProductsUrl({
      rootId: activeRootTab,
      subId: firstSub?.ca_id ?? null,
      d3Id: null,
    });
  }, [categoryTree, activeRootTab]);

  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [{ label: "홈", href: "/" }];

    let pathInTree: ProductCategoryNode[] | null = null;
    if (useApi && apiProduct?.categories?.length && categoryTree.length) {
      const deepest = [...apiProduct.categories].sort(
        (a, b) => b.depth - a.depth || a.ca_id - b.ca_id
      )[0];
      pathInTree = findCategoryPathInTree(categoryTree, deepest.ca_id);
    }

    if (pathInTree?.length) {
      const rootId = pathInTree[0].ca_id;
      items.push({
        label: "제품소개",
        href: buildProductsUrl({ rootId, subId: null, d3Id: null }),
      });
      pathInTree.forEach((node, index) => {
        items.push({
          label: node.name_ko,
          href: buildProductsUrlForTreePath(pathInTree!, index),
        });
      });
    } else {
      items.push({ label: "제품소개", href: "/products" });
    }

    if (view?.name) {
      items.push({ label: view.name });
    }
    return items;
  }, [view?.name, categoryTree, useApi, apiProduct?.categories]);

  if (useApi && loading) {
    return (
      <main className={styles.main}>
        <p className={styles.loadingMsg} aria-live="polite">
          제품 정보를 불러오는 중입니다…
        </p>
      </main>
    );
  }

  if (useApi && loadError) {
    notFound();
  }

  if (!view) {
    notFound();
  }

  if (catLoading) {
    return (
      <main className={styles.main}>
        <p className={styles.loadingMsg} aria-live="polite">
          제품 화면을 준비하는 중입니다…
        </p>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <HeroBanner
        title="제품소개"
        backgroundImage={productBanner.src}
        tabs={heroTabs.length > 0 ? heroTabs : undefined}
        activeTab={heroTabs.length > 0 ? activeRootTab : undefined}
        onTabChange={heroTabs.length > 0 ? handleRootTab : undefined}
        useUrlParams={false}
      />

      <div className={styles.breadcrumbArea}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <section className={styles.productDetail}>
        <div className={styles.productInfo}>
          <div className={styles.productImage}>
            <Image
              src={view.image}
              alt={view.name}
              width={600}
              height={600}
              sizes="(max-width: 770px) 100vw, 600px"
              className={styles.image}
            />
          </div>

          <div className={styles.productContent}>
            <h1 className={styles.productTitle}>
              <span className={styles.productTitleEnglish}>{view.nameEn}</span>
              <span className={styles.productTitleKorean}>{view.name}</span>
            </h1>

            {(view.description || view.descriptionEn) && (
              <>
                {view.description ? (
                  <p className={styles.productDescription}>
                    {view.description}
                  </p>
                ) : null}
                {view.descriptionEn ? (
                  <p className={styles.productDescriptionEn}>
                    {view.descriptionEn}
                  </p>
                ) : null}
              </>
            )}

            {view.features.length > 0 && (
              <div className={styles.features}>
                <div className={styles.featuresTitle}>특징</div>
                <ul className={styles.featuresList}>
                  {view.features.map((feature, index) => (
                    <li key={index} className={styles.featureItem}>
                      <span className={styles.featureKorean}>
                        {feature.korean}
                      </span>
                      <span className={styles.featureEnglish}>
                        {feature.english}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.downloadButtons}>
              {view.pdfUrl && (
                <ProductAssetDownloadButton
                  url={view.pdfUrl}
                  downloadName={view.pdfDownloadName}
                  className={`${styles.downloadButton} ${styles.technicalButton}`}
                >
                  PDF 다운로드
                  <Image
                    src="/images/icon/download_ico.png"
                    alt="다운로드"
                    width={20}
                    height={20}
                  />
                </ProductAssetDownloadButton>
              )}
              {view.dwgUrl && (
                <ProductAssetDownloadButton
                  url={view.dwgUrl}
                  downloadName={view.dwgDownloadName}
                  className={`${styles.downloadButton} ${styles.catalogButton}`}
                >
                  2D 도면 다운로드
                  <Image
                    src="/images/icon/download_ico_b.png"
                    alt="다운로드"
                    width={20}
                    height={20}
                  />
                </ProductAssetDownloadButton>
              )}
              {view.stpUrl && (
                <ProductAssetDownloadButton
                  url={view.stpUrl}
                  downloadName={view.stpDownloadName}
                  className={`${styles.downloadButton} ${styles.technicalButton}`}
                >
                  3D 모델 (STP)
                  <Image
                    src="/images/icon/download_ico.png"
                    alt="다운로드"
                    width={20}
                    height={20}
                  />
                </ProductAssetDownloadButton>
              )}
            </div>
          </div>
        </div>

        {view.pdfUrl && (
          <ProductPdfPreview
            pdfUrl={view.pdfUrl}
            productName={view.name}
            suggestedFileName={view.pdfDownloadName}
          />
        )}

        {view.content && (
          <div className={styles.contentArea}>
            <div className={styles.content}>{view.content}</div>
          </div>
        )}

        <div className={styles.listButtonArea}>
          <Link href={listHref} className={styles.listButton}>
            목록
          </Link>
        </div>
      </section>
    </main>
  );
}
