/**
 * 제품 소개 섹션 컴포넌트
 * - 데이터: 공개 API 1뎁스(대분류) 카테고리 (`fetchProductCategoryTree` → `tree`)
 * - 제품 정보 텍스트 영역 (A) / 이미지 Swiper (B) / 메뉴 (C)
 * - 메뉴 클릭 및 Swiper 드래그 시 동기화
 */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
// @ts-ignore
import { Swiper, SwiperSlide } from "swiper/react";
// @ts-ignore
import { Navigation } from "swiper/modules";
// @ts-ignore
import type { Swiper as SwiperType } from "swiper";
import { fetchProductCategoryTree, type ProductCategoryNode } from "@/api";
import { toBackendAssetUrl } from "@/api/config";
import "swiper/css";
import styles from "./ProductIntro.module.css";

const DEFAULT_SLIDE_IMAGE = "/images/section02_prd_img.png";

function categoryImageSrc(node: ProductCategoryNode): string {
  const u = node.image_url?.trim();
  if (!u) return DEFAULT_SLIDE_IMAGE;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return toBackendAssetUrl(u);
}

/** 같은 인덱스 = 한 줄(한글) + 그 아래 회색(영문). 관리자에서 줄 수를 맞춰 두면 됩니다. */
function pairedKeywordLines(node: ProductCategoryNode): { ko: string; en: string }[] {
  const toLines = (raw: unknown): string[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map((s) => String(s).trim());
  };
  const ko = toLines(node.keywords_ko);
  const en = toLines(node.keywords_en);
  const n = Math.max(ko.length, en.length);
  const out: { ko: string; en: string }[] = [];
  for (let i = 0; i < n; i++) {
    const k = (ko[i] ?? "").trim();
    const e = (en[i] ?? "").trim();
    if (!k && !e) continue;
    if (k && e) out.push({ ko: k, en: e });
    else if (k) out.push({ ko: k, en: "" });
    else out.push({ ko: "", en: e });
  }
  return out;
}

const ProductIntro: React.FC = () => {
  const [roots, setRoots] = useState<ProductCategoryNode[]>([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const prevButtonRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLDivElement>(null);
  const rootsRef = useRef<ProductCategoryNode[]>([]);
  rootsRef.current = roots;

  const current = roots[activeIndex] ?? null;
  const slideCount = roots.length;
  const canLoop = slideCount > 1;

  const updateProgressBar = useCallback((swiper: SwiperType) => {
    if (typeof window === "undefined") return;
    const progressBar = document.querySelector(
      ".prd-swiper-progress-bar"
    ) as HTMLElement | null;
    if (!progressBar) return;
    const total = rootsRef.current.length || 1;
    const currentIndex =
      swiper.realIndex !== undefined ? swiper.realIndex : swiper.activeIndex;
    const progress = ((currentIndex + 1) / total) * 100;
    progressBar.style.width = `${progress}%`;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    void fetchProductCategoryTree()
      .then((payload) => {
        if (cancelled) return;
        const tree = payload.tree ?? [];
        const depth1 = tree.filter((n) => n.depth === 1);
        setRoots(depth1.length ? depth1 : tree);
        setActiveIndex(0);
      })
      .catch(() => {
        if (!cancelled) {
          setRoots([]);
          setLoadError("제품 분류를 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMenuClick = (index: number) => {
    if (index < 0 || index >= roots.length) return;
    setActiveIndex(index);
    if (swiperRef.current) {
      if (canLoop && typeof swiperRef.current.slideToLoop === "function") {
        swiperRef.current.slideToLoop(index);
      } else {
        swiperRef.current.slideTo(index);
      }
    }
  };

  const handleSlideChange = (swiper: SwiperType) => {
    const idx = swiper.realIndex ?? swiper.activeIndex;
    setActiveIndex(Math.min(Math.max(0, idx), Math.max(0, roots.length - 1)));
    updateProgressBar(swiper);
  };

  useEffect(() => {
    return () => {
      if (swiperRef.current) {
        swiperRef.current.destroy(true, true);
        swiperRef.current = null;
      }
    };
  }, []);

  const swiperKey =
    slideCount > 0 ? roots.map((r) => r.ca_id).join("-") : "empty";

  return (
    <section className="section-02 prd-intro">
      <div className="title">
        <p className="eg-font">Products</p>
        <h2>
          SPG제품군
          <Link href="/products" className="more-view">
            SEE ALL +
          </Link>
        </h2>
      </div>
      <div className="prd-content">
        {loading ? (
          <div className="prd-text-area">
            <p className="ko">불러오는 중…</p>
          </div>
        ) : loadError ? (
          <div className="prd-text-area">
            <p className="ko">{loadError}</p>
          </div>
        ) : slideCount === 0 ? (
          <div className="prd-text-area">
            <p className="ko">표시할 대분류(1뎁스) 카테고리가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="prd-text-area">
              <h3 className="prd-name">
                <span className="name-kr">{current?.name_ko ?? "—"}</span>|
                <span className="name-eg eg-font">{current?.name_en ?? ""}</span>
              </h3>
              <div className="prd-detail">
                {current?.desc_ko?.trim() ? (
                  <p
                    className="ko"
                    dangerouslySetInnerHTML={{ __html: current.desc_ko }}
                  />
                ) : null}
                {current?.desc_en?.trim() ? (
                  <p
                    className="eg eg-font"
                    dangerouslySetInnerHTML={{ __html: current.desc_en }}
                  />
                ) : null}
              </div>
              {current && pairedKeywordLines(current).length > 0 ? (
                <ul className="prd-keword">
                  {pairedKeywordLines(current).map((line, index) => (
                    <li key={`${current.ca_id}-${index}`}>
                      <div className={styles.kwPair}>
                        {line.ko ? (
                          <span className={styles.kwKo}>{line.ko}</span>
                        ) : null}
                        {line.en ? (
                          <span className={`${styles.kwEn} eg-font`}>{line.en}</span>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="prd-img-area">
              <Swiper
                key={swiperKey}
                className="prd-swiper swiper-container"
                modules={[Navigation]}
                slidesPerView={1.5}
                spaceBetween={90}
                allowTouchMove={true}
                loop={canLoop}
                navigation={{
                  prevEl: prevButtonRef.current,
                  nextEl: nextButtonRef.current,
                }}
                onSwiper={(swiper: SwiperType) => {
                  swiperRef.current = swiper;
                  setTimeout(() => {
                    if (
                      prevButtonRef.current &&
                      nextButtonRef.current &&
                      swiper.params.navigation &&
                      typeof swiper.params.navigation === "object"
                    ) {
                      swiper.params.navigation.prevEl = prevButtonRef.current;
                      swiper.params.navigation.nextEl = nextButtonRef.current;
                      swiper.navigation.init();
                      swiper.navigation.update();
                    }
                  }, 0);
                  updateProgressBar(swiper);
                  if (typeof window !== "undefined" && window.innerWidth <= 1050) {
                    const containerWidth = swiper.el.offsetWidth;
                    swiper.params.slidesPerView = 1.15;
                    swiper.params.spaceBetween = containerWidth * 0.055;
                    swiper.update();
                  }
                }}
                onSlideChange={handleSlideChange}
                onResize={(swiper: SwiperType) => {
                  if (window.innerWidth <= 1050) {
                    const containerWidth = swiper.el.offsetWidth;
                    swiper.params.slidesPerView = 1.15;
                    swiper.params.spaceBetween = containerWidth * 0.055;
                    swiper.update();
                  } else {
                    swiper.params.slidesPerView = 1.5;
                    swiper.params.spaceBetween = 90;
                    swiper.update();
                  }
                }}
              >
                {roots.map((product, index) => (
                  <SwiperSlide key={product.ca_id}>
                    <Image
                      src={categoryImageSrc(product)}
                      alt={product.name_ko}
                      width={600}
                      height={400}
                      className="product-image"
                      loading={index < 2 ? "eager" : "lazy"}
                    />
                  </SwiperSlide>
                ))}
                <div className="prd-swiper-controls">
                  <div className="prd-swiper-progress">
                    <div className="prd-swiper-progress-bar"></div>
                  </div>
                  <div className="prd-swiper-nav">
                    <div className="prd-swiper-button-prev" ref={prevButtonRef}>
                      <Image
                        src="/images/icon/arrow_04.png"
                        alt="이전"
                        width={10}
                        height={10}
                      />
                    </div>
                    <div className="prd-swiper-button-next" ref={nextButtonRef}>
                      <Image
                        src="/images/icon/arrow_04.png"
                        alt="다음"
                        width={10}
                        height={10}
                      />
                    </div>
                  </div>
                </div>
              </Swiper>
            </div>
          </>
        )}
      </div>
      {!loading && slideCount > 0 ? (
        <ul className="prd-menu">
          {roots.map((product, index) => (
            <li
              key={product.ca_id}
              className={activeIndex === index ? "on" : ""}
              onClick={() => handleMenuClick(index)}
            >
              {product.name_ko}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
};

export default ProductIntro;
