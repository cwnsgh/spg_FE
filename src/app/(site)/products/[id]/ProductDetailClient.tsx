"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import HeroBanner from "../../../components/HeroBanner";
import Breadcrumb, { BreadcrumbItem } from "../../../components/Breadcrumb";
import { getProductById, type Product } from "../../../products/data/productData";
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
  resolveActiveRootTabForProduct,
} from "../../../products/utils/productSelectionUrl";
import { devBackendAssetIframePath } from "@/app/products/utils/pdfPreviewUrl";
import styles from "../../../products/[id]/page.module.css";

const PLACEHOLDER_IMAGE = "/images/products/prd_01.png";

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
  if (
    typeof first === "object" &&
    first !== null &&
    "korean" in first
  ) {
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
  features: { korean: string; english: string }[];
  /** file_type 0 — PHP `download_links.pdf` */
  pdfUrl: string | null;
  /** file_type 1 — `download_links.dwg` */
  dwgUrl: string | null;
  /** file_type 2 — `download_links.stp` */
  stpUrl: string | null;
  content?: string;
} {
  const dl = p.download_links;
  return {
    name: p.name_ko,
    nameEn: p.name_en ?? "",
    image: p.image_url ? toBackendAssetUrl(p.image_url) : PLACEHOLDER_IMAGE,
    description: p.summary_ko ?? undefined,
    features: normalizeFeaturePairs(p.features_ko, p.features_en),
    pdfUrl: dl?.pdf ? toBackendAssetUrl(dl.pdf) : null,
    dwgUrl: dl?.dwg ? toBackendAssetUrl(dl.dwg) : null,
    stpUrl: dl?.stp ? toBackendAssetUrl(dl.stp) : null,
    content: undefined,
  };
}

/**
 * PDF: 백엔드 X-Frame-Options 회피 후 `<object application/pdf>`로 브라우저 기본 뷰어 표시
 * - 개발: `/__backend_asset` 동일 출처
 * - 그 외: CORS 되면 fetch→blob, 아니면 새 창 링크
 */
function ProductPdfPreview({
  pdfUrl,
  productName,
}: {
  pdfUrl: string;
  productName: string;
}) {
  const devProxySrc = useMemo(
    () => devBackendAssetIframePath(pdfUrl),
    [pdfUrl]
  );

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => !devBackendAssetIframePath(pdfUrl));

  useEffect(() => {
    if (devProxySrc) {
      setBlobUrl(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    setLoading(true);
    setBlobUrl(null);

    fetch(pdfUrl, { mode: "cors", credentials: "omit" })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.blob();
      })
      .then((blob) => {
        const u = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(u);
          return;
        }
        objectUrl = u;
        setBlobUrl(u);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pdfUrl, devProxySrc]);

  const docSrc = devProxySrc ?? blobUrl;

  return (
    <div className={styles.productPdfViewer}>
      {docSrc ? (
        <object
          type="application/pdf"
          data={docSrc}
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

function mapStaticProductToView(product: Product) {
  return {
    name: product.name,
    nameEn: product.nameEn,
    image: product.image,
    description: product.description,
    features: product.features ?? [],
    /** 예전 목업: `catalogPdfUrl`=도면(DWG), `technicalPdfUrl`=PDF */
    pdfUrl: product.technicalPdfUrl ?? null,
    dwgUrl: product.catalogPdfUrl ?? null,
    stpUrl: null as string | null,
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

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "홈", href: "/" },
    { label: "제품소개", href: "/products" },
    { label: view.name },
  ];

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

            {view.description && (
              <p className={styles.productDescription}>{view.description}</p>
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
                <a
                  href={view.pdfUrl}
                  className={`${styles.downloadButton} ${styles.technicalButton}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PDF 다운로드
                  <Image
                    src="/images/icon/download_ico.png"
                    alt="다운로드"
                    width={20}
                    height={20}
                  />
                </a>
              )}
              {view.dwgUrl && (
                <a
                  href={view.dwgUrl}
                  className={`${styles.downloadButton} ${styles.catalogButton}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  2D 도면 다운로드
                  <Image
                    src="/images/icon/download_ico_b.png"
                    alt="다운로드"
                    width={20}
                    height={20}
                  />
                </a>
              )}
              {view.stpUrl && (
                <a
                  href={view.stpUrl}
                  className={`${styles.downloadButton} ${styles.technicalButton}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  3D 모델 (STP)
                  <Image
                    src="/images/icon/download_ico.png"
                    alt="다운로드"
                    width={20}
                    height={20}
                  />
                </a>
              )}
            </div>
          </div>
        </div>

        {view.pdfUrl && (
          <ProductPdfPreview pdfUrl={view.pdfUrl} productName={view.name} />
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
