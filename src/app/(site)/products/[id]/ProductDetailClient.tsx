"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb, { BreadcrumbItem } from "../../../components/Breadcrumb";
import { getProductById, type Product } from "../../../products/data/productData";
import {
  fetchProductDetail,
  type ProductDetailPayload,
} from "@/api/product";
import { toBackendAssetUrl } from "@/api/config";
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
  catalogPdfUrl: string | null;
  technicalPdfUrl: string | null;
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
    catalogPdfUrl: dl?.dwg ? toBackendAssetUrl(dl.dwg) : null,
    technicalPdfUrl: dl?.pdf ? toBackendAssetUrl(dl.pdf) : null,
    stpUrl: dl?.stp ? toBackendAssetUrl(dl.stp) : null,
    content: undefined,
  };
}

function mapStaticProductToView(product: Product) {
  return {
    name: product.name,
    nameEn: product.nameEn,
    image: product.image,
    description: product.description,
    features: product.features ?? [],
    catalogPdfUrl: product.catalogPdfUrl ?? null,
    technicalPdfUrl: product.technicalPdfUrl ?? null,
    stpUrl: null as string | null,
    content: product.content,
  };
}

export default function ProductDetailClient({ id }: { id: string }) {
  const useApi = isNumericProductId(id);

  const [apiProduct, setApiProduct] = useState<ProductDetailPayload | null>(
    null
  );
  const [loadError, setLoadError] = useState(false);
  /** 숫자 id(API)는 첫 페인트부터 로딩으로 두어 notFound 오동작 방지 */
  const [loading, setLoading] = useState(useApi);

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

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "홈", href: "/" },
    { label: "제품소개", href: "/products" },
    { label: view.name },
  ];

  return (
    <main className={styles.main}>
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
              {view.catalogPdfUrl && (
                <a
                  href={view.catalogPdfUrl}
                  className={`${styles.downloadButton} ${styles.catalogButton}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  도면 다운로드
                  <Image
                    src="/images/icon/download_ico_b.png"
                    alt="다운로드"
                    width={20}
                    height={20}
                  />
                </a>
              )}
              {view.technicalPdfUrl && (
                <a
                  href={view.technicalPdfUrl}
                  className={`${styles.downloadButton} ${styles.technicalButton}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  기술자료 PDF
                  <Image
                    src="/images/icon/download_ico.png"
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

        {view.content && (
          <div className={styles.contentArea}>
            <div className={styles.content}>{view.content}</div>
          </div>
        )}

        <div className={styles.listButtonArea}>
          <Link href="/products" className={styles.listButton}>
            목록
          </Link>
        </div>
      </section>
    </main>
  );
}
