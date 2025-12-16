/**
 * 메인 배너 컴포넌트
 * - Swiper를 사용한 메인 배너 슬라이더
 * - 원형 진행 바가 있는 페이지네이션 포함
 */
"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
// @ts-ignore
import { Swiper, SwiperSlide } from "swiper/react";
// @ts-ignore
import { Autoplay, Pagination } from "swiper/modules";
// @ts-ignore
import type { Swiper as SwiperType } from "swiper";
import { mainBannerData } from "@/data/mainBannerData";
import "swiper/css";
import "swiper/css/pagination";
import styles from "./MainBanner.module.css";

const MainBanner: React.FC = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    // Swiper 초기화 후 진행 바 설정
    if (swiperRef.current) {
      const swiper = swiperRef.current;
      const circumference = 2 * Math.PI * 12;

      // 초기 진행 바 설정
      swiper.pagination.bullets.forEach((bullet: HTMLElement) => {
        const circle = bullet.querySelector(
          ".progress-ring-circle"
        ) as SVGCircleElement;
        if (circle) {
          circle.style.strokeDasharray = `${circumference} ${circumference}`;
          circle.style.strokeDashoffset = `${circumference}`;
        }
      });
    }
  }, []);

  const handleAutoplayTimeLeft = (
    swiper: SwiperType,
    timeLeft: number,
    percentage: number
  ) => {
    const realIndex = swiper.realIndex;
    const activeBullet = swiper.pagination.bullets[realIndex];
    const circumference = 2 * Math.PI * 12;

    if (activeBullet) {
      const circle = activeBullet.querySelector(
        ".progress-ring-circle"
      ) as SVGCircleElement;
      if (circle) {
        const offset = percentage * circumference;
        circle.style.strokeDashoffset = `${offset}`;
      }
    }

    // 비활성 버튼 초기화
    swiper.pagination.bullets.forEach((bullet: HTMLElement, index: number) => {
      if (index !== realIndex) {
        const circle = bullet.querySelector(
          ".progress-ring-circle"
        ) as SVGCircleElement;
        if (circle) {
          circle.style.strokeDashoffset = `${circumference}`;
        }
      }
    });
  };

  const handleSlideChange = (swiper: SwiperType) => {
    const circumference = 2 * Math.PI * 12;
    swiper.pagination.bullets.forEach((bullet: HTMLElement) => {
      const circle = bullet.querySelector(
        ".progress-ring-circle"
      ) as SVGCircleElement;
      if (circle) {
        circle.style.strokeDashoffset = `${circumference}`;
      }
    });
  };

  const renderBullet = (index: number, className: string) => {
    return `
      <span class="${className}">
        <svg class="progress-ring" width="34" height="34">
          <circle class="progress-ring-circle" cx="17" cy="17" r="12" fill="none" stroke="#fff" stroke-width="2"/>
        </svg>
      </span>
    `;
  };

  return (
    <section className={`${styles.mainBnr} section-01 main-bnr`}>
      <Swiper
        className={`${styles.mainSwiper} main-swiper swiper-container`}
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        spaceBetween={0}
        loop={true}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        pagination={{
          el: ".main-swiper .swiper-pagination",
          clickable: true,
          renderBullet: renderBullet,
        }}
        onSwiper={(swiper: SwiperType) => {
          swiperRef.current = swiper;
        }}
        onAutoplayTimeLeft={handleAutoplayTimeLeft}
        onSlideChange={handleSlideChange}
      >
        {mainBannerData.map((slide, index) => (
          <SwiperSlide key={index}>
            <Link href={slide.href || "#"}>
              <div className={styles.bnr}>
                <img src={slide.imgPath} alt={slide.title} />
              </div>
              <div className={styles.txt}>
                <h2>
                  {slide.title}
                  {slide.titleEm && <em>{slide.titleEm}</em>}의 정밀 모터 기술
                </h2>
                <p dangerouslySetInnerHTML={{ __html: slide.description }} />
              </div>
            </Link>
          </SwiperSlide>
        ))}
        <div className="swiper-pagination"></div>
      </Swiper>
    </section>
  );
};

export default MainBanner;
