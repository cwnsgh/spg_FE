/**
 * 메인 배너 컴포넌트 — `(site)/page.tsx` 메인 홈 상단.
 * - Swiper를 사용한 메인 배너 슬라이더
 * - 원형 진행 바 페이지네이션 (반응형: 모바일 26px/r9, PC 34px/r12)
 */
"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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

const PAGINATION_BREAKPOINT = 1050;

function getBulletConfig() {
  if (typeof window === "undefined") {
    return { size: 34, radius: 12, circumference: 2 * Math.PI * 12 };
  }
  const isMobile = window.innerWidth <= PAGINATION_BREAKPOINT;
  const size = isMobile ? 26 : 34;
  const radius = isMobile ? 9 : 12;
  const circumference = 2 * Math.PI * radius;
  return { size, radius, circumference };
}

const MainBanner: React.FC = () => {
  const swiperRef = useRef<SwiperType | null>(null);

  const updatePaginationViewport = useCallback((swiper: SwiperType) => {
    const { size, radius, circumference } = getBulletConfig();
    swiper.pagination.bullets.forEach((bullet: HTMLElement) => {
      const svg = bullet.querySelector(".progress-ring") as SVGSVGElement;
      const circle = bullet.querySelector(
        ".progress-ring-circle"
      ) as SVGCircleElement;
      if (svg && circle) {
        const center = size / 2;
        svg.setAttribute("width", String(size));
        svg.setAttribute("height", String(size));
        circle.setAttribute("cx", String(center));
        circle.setAttribute("cy", String(center));
        circle.setAttribute("r", String(radius));
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = `${circumference}`;
      }
    });
  }, []);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;

    const { circumference } = getBulletConfig();
    swiper.pagination.bullets.forEach((bullet: HTMLElement) => {
      const circle = bullet.querySelector(
        ".progress-ring-circle"
      ) as SVGCircleElement;
      if (circle) {
        circle.style.strokeLinecap = "round";
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = `${circumference}`;
      }
    });

    const handleResize = () => {
      if (swiperRef.current) updatePaginationViewport(swiperRef.current);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (swiperRef.current) {
        swiperRef.current.destroy(true, true);
        swiperRef.current = null;
      }
    };
  }, [updatePaginationViewport]);

  const handleAutoplayTimeLeft = (
    swiper: SwiperType,
    _timeLeft: number,
    percentage: number
  ) => {
    const realIndex = swiper.realIndex;
    const activeBullet = swiper.pagination.bullets[realIndex];
    const { circumference } = getBulletConfig();

    if (activeBullet) {
      const circle = activeBullet.querySelector(
        ".progress-ring-circle"
      ) as SVGCircleElement;
      if (circle) {
        const offset = percentage * circumference;
        circle.style.strokeDashoffset = `${offset}`;
      }
    }

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
    const { circumference } = getBulletConfig();
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
    const { size, radius } = getBulletConfig();
    const center = size / 2;
    return `
      <span class="${className}">
        <svg class="progress-ring" width="${size}" height="${size}" style="overflow: visible;">
          <circle class="progress-ring-circle" cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>
    `;
  };

  return (
    <section className={`${styles.mainBnr} section-01`} aria-label="메인 배너">
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
                <Image
                  src={slide.imgPath}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  quality={85}
                  className={styles.bannerImage}
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className={styles.txt}>
                <h2>
                  {slide.title}
                  <br />
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
