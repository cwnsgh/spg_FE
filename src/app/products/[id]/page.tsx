"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import HeroBanner from "../../components/HeroBanner";
import Breadcrumb, { BreadcrumbItem } from "../../components/Breadcrumb";
import { getProductById } from "../data/productData";
import productBanner from "../../../assets/product_banner.png";
import styles from "./page.module.css";

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
      {/* 상단 히어로 배너: 페이지 타이틀 */}
      {/* <HeroBanner title="제품소개" backgroundImage={productBanner.src} /> */}

      {/* Breadcrumb 영역 */}
      <div className={styles.breadcrumbArea}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* 제품 상세 영역 */}
      <section className={styles.productDetail}>
        <div className={styles.productInfo}>
          {/* 제품 이미지 */}
          <div className={styles.productImage}>
            <Image
              src={product.image}
              alt={product.name}
              width={600}
              height={600}
              className={styles.image}
            />
          </div>

          {/* 제품 정보 */}
          <div className={styles.productContent}>
            <h1 className={styles.productTitle}>
              {product.nameEn}
              <span className={styles.productTitleKorean}>{product.name}</span>
            </h1>

            {product.description && (
              <p className={styles.productDescription}>{product.description}</p>
            )}

            {product.features && product.features.length > 0 && (
              <div className={styles.features}>
                <div className={styles.featuresTitle}>특징</div>
                <div className={styles.featuresDivider}></div>
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
                <div className={styles.featuresDivider}></div>
              </div>
            )}

            {/* PDF 다운로드 버튼 */}
            <div className={styles.downloadButtons}>
              {product.catalogPdfUrl && (
                <a
                  href={product.catalogPdfUrl}
                  className={`${styles.downloadButton} ${styles.catalogButton}`}
                  download
                >
                  <Image
                    src="/images/icon/download_ico.png"
                    alt="다운로드"
                    width={20}
                    height={20}
                  />
                  도면 PDF 다운로드
                </a>
              )}
              {product.technicalPdfUrl && (
                <a
                  href={product.technicalPdfUrl}
                  className={`${styles.downloadButton} ${styles.technicalButton}`}
                  download
                >
                  <Image
                    src="/images/icon/download_ico.png"
                    alt="다운로드"
                    width={20}
                    height={20}
                  />
                  기술자료 PDF 다운로드
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 제품 내용 영역 */}
        {product.content && (
          <div className={styles.contentArea}>
            <div className={styles.content}>{product.content}</div>
          </div>
        )}

        {/* 목록 버튼 */}
        <div className={styles.listButtonArea}>
          <Link href="/products" className={styles.listButton}>
            목록
          </Link>
        </div>
      </section>
    </main>
  );
}
