/**
 * 제품 소개 섹션 컴포넌트
 * - 제품 정보 텍스트 영역 (A)
 * - 제품 이미지 Swiper (B)
 * - 제품 메뉴 (C)
 * - 메뉴 클릭 및 Swiper 드래그 시 동기화
 */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
// @ts-ignore
import { Swiper, SwiperSlide } from "swiper/react";
// @ts-ignore
import { Navigation } from "swiper/modules";
// @ts-ignore
import type { Swiper as SwiperType } from "swiper";
import { productData } from "@/data/productData";
import { ProductData } from "@/types";
import "swiper/css";
import styles from "./ProductIntro.module.css";

const ProductIntro: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const prevButtonRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLDivElement>(null);
  const currentProduct = productData[activeIndex];

  const updateProgressBar = (swiper: SwiperType) => {
    if (typeof window === "undefined") return;
    const progressBar = document.querySelector(
      ".prd-swiper-progress-bar"
    ) as HTMLElement;
    if (progressBar) {
      const totalSlides = productData.length;
      const currentIndex =
        swiper.realIndex !== undefined ? swiper.realIndex : swiper.activeIndex;
      const progress = ((currentIndex + 1) / totalSlides) * 100;
      progressBar.style.width = progress + "%";
    }
  };

  const handleMenuClick = (index: number) => {
    setActiveIndex(index);
    if (swiperRef.current) {
      if (typeof swiperRef.current.slideToLoop === "function") {
        swiperRef.current.slideToLoop(index);
      } else {
        swiperRef.current.slideTo(index);
      }
    }
  };

  const handleSlideChange = (swiper: SwiperType) => {
    const idx = swiper.realIndex ?? swiper.activeIndex;
    setActiveIndex(idx);
    // Progress bar 업데이트
    updateProgressBar(swiper);
  };

  // Cleanup: 컴포넌트 언마운트 시 Swiper 정리
  useEffect(() => {
    return () => {
      if (swiperRef.current) {
        swiperRef.current.destroy(true, true);
        swiperRef.current = null;
      }
    };
  }, []);

  return (
    <section className="section-02 prd-intro">
      <div className="title">
        <p className="eg-font">Products</p>
        <h2>
          SPG제품군
          <Link href="#" className="more-view">
            SEE ALL +
          </Link>
        </h2>
      </div>
      <div className="prd-content">
        {/* A: 텍스트 영역 */}
        <div className="prd-text-area">
          <h3 className="prd-name">
            <span className="name-kr">{currentProduct.nameKr}</span>|
            <span className="name-eg eg-font">{currentProduct.nameEg}</span>
          </h3>
          <div className="prd-detail">
            <p
              className="ko"
              dangerouslySetInnerHTML={{ __html: currentProduct.ko }}
            />
            <p
              className="eg eg-font"
              dangerouslySetInnerHTML={{ __html: currentProduct.eg }}
            />
          </div>
          <ul className="prd-keword">
            {currentProduct.keywords.map((keyword, index) => (
              <li key={index}>{keyword}</li>
            ))}
          </ul>
        </div>
        {/* B: 이미지 Swiper 영역 */}
        <div className="prd-img-area">
          <Swiper
            className="prd-swiper swiper-container"
            modules={[Navigation]}
            slidesPerView={1.5}
            spaceBetween={90}
            allowTouchMove={true}
            loop={true}
            navigation={{
              prevEl: prevButtonRef.current,
              nextEl: nextButtonRef.current,
            }}
            onSwiper={(swiper: SwiperType) => {
              swiperRef.current = swiper;
              // Navigation 버튼 재설정 (버튼이 렌더링된 후)
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
              // 초기 progress bar 업데이트
              updateProgressBar(swiper);
              // 모바일에서 slidesPerView와 spaceBetween 조정
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
            {productData.map((product, index) => (
              <SwiperSlide key={index}>
                <Image
                  src={product.imgPath}
                  alt={product.nameKr}
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
      </div>
      {/* C: 제품 메뉴 */}
      <ul className="prd-menu">
        {productData.map((product, index) => (
          <li
            key={index}
            className={activeIndex === index ? "on" : ""}
            onClick={() => handleMenuClick(index)}
          >
            {product.nameKr}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ProductIntro;
