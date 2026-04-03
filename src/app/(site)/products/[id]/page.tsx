"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb, { BreadcrumbItem } from "../../../components/Breadcrumb";
import { getProductById } from "../../../products/data/productData";
import styles from "../../../products/[id]/page.module.css";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "홈", href: "/" },
    { label: "제품소개", href: "/products" },
    { label: product.name },
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
              src={product.image}
              alt={product.name}
              width={600}
              height={600}
              className={styles.image}
            />
          </div>

          <div className={styles.productContent}>
            <h1 className={styles.productTitle}>
              <span className={styles.productTitleEnglish}>{product.nameEn}</span>
              <span className={styles.productTitleKorean}>{product.name}</span>
            </h1>

            {product.description && (
              <p className={styles.productDescription}>{product.description}</p>
            )}

            {product.features && product.features.length > 0 && (
              <div className={styles.features}>
                <div className={styles.featuresTitle}>특징</div>
                <ul className={styles.featuresList}>
                  {product.features.map((feature, index) => (
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
              {product.catalogPdfUrl && (
                <a
                  href={product.catalogPdfUrl}
                  className={`${styles.downloadButton} ${styles.catalogButton}`}
                  download
                >
                  도면 PDF 다운로드
                  <Image
                    src="/images/icon/download_ico_b.png"
                    alt="다운로드"
                    width={20}
                    height={20}
                  />
                </a>
              )}
              {product.technicalPdfUrl && (
                <a
                  href={product.technicalPdfUrl}
                  className={`${styles.downloadButton} ${styles.technicalButton}`}
                  download
                >
                  기술자료 PDF 다운로드
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

        {product.content && (
          <div className={styles.contentArea}>
            <div className={styles.content}>{product.content}</div>
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
