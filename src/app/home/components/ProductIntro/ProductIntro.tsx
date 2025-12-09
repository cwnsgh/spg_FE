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
// @ts-ignore
import { Swiper, SwiperSlide } from "swiper/react";
// @ts-ignore
import { Navigation } from "swiper/modules";
// @ts-ignore
import type { Swiper as SwiperType } from "swiper";
import { productData } from "@/data/productData";
import { ProductData } from "../../../types";
import "swiper/css";
import styles from "./ProductIntro.module.css";

const ProductIntro: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const currentProduct = productData[activeIndex];

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
  };

  return (
    <section className={styles.prdIntro}>
      <div className={styles.title}>
        <p className="eg-font">Products</p>
        <h2>
          SPG제품군
          <Link href="#" className={styles.moreView}>
            SEE ALL +
          </Link>
        </h2>
      </div>
      <div className={styles.prdContent}>
        {/* A: 텍스트 영역 */}
        <div className={styles.prdTextArea}>
          <h3 className={styles.prdName}>
            <span className={styles.nameKr}>{currentProduct.nameKr}</span>|
            <span className={`${styles.nameEg} eg-font`}>
              {currentProduct.nameEg}
            </span>
          </h3>
          <div className={styles.prdDetail}>
            <p
              className={styles.ko}
              dangerouslySetInnerHTML={{ __html: currentProduct.ko }}
            />
            <p
              className={`${styles.eg} eg-font`}
              dangerouslySetInnerHTML={{ __html: currentProduct.eg }}
            />
          </div>
          <ul className={styles.prdKeword}>
            {currentProduct.keywords.map((keyword, index) => (
              <li key={index}>{keyword}</li>
            ))}
          </ul>
        </div>
        {/* B: 이미지 Swiper 영역 */}
        <div className={styles.prdImgArea}>
          <Swiper
            className={`${styles.prdSwiper} swiper-container`}
            modules={[Navigation]}
            slidesPerView={1.5}
            spaceBetween={90}
            allowTouchMove={true}
            loop={true}
            onSwiper={(swiper: SwiperType) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={handleSlideChange}
          >
            {productData.map((product, index) => (
              <SwiperSlide key={index}>
                <img src={product.imgPath} alt={product.nameKr} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      {/* C: 제품 메뉴 */}
      <ul className={styles.prdMenu}>
        {productData.map((product, index) => (
          <li
            key={index}
            className={activeIndex === index ? styles.on : ""}
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
