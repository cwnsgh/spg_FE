"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
// @ts-ignore
import { Swiper, SwiperSlide } from "swiper/react";
// @ts-ignore
import { Autoplay, Navigation } from "swiper/modules";
// @ts-ignore
import type { Swiper as SwiperType } from "swiper";
import { branchData } from "@/data/branchData";
import styles from "./GlobalNetwork.module.css";
import "swiper/css";
import "swiper/css/navigation";

const GlobalNetwork: React.FC = () => {
  const prevButtonRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const totalImages = branchData.length;

  // 모든 이미지가 로드되었는지 확인
  const handleImageLoad = () => {
    setImagesLoaded((prev) => prev + 1);
  };

  // 모든 이미지 로드 후 Swiper 완전히 재초기화
  useEffect(() => {
    if (imagesLoaded === totalImages && swiperRef.current) {
      // DOM 렌더링 완료 대기
      const timeoutId = setTimeout(() => {
        if (swiperRef.current) {
          const swiper = swiperRef.current;
          
          // Autoplay 완전히 정지
          if (swiper.autoplay) {
            swiper.autoplay.stop();
          }
          
          // Swiper 크기 및 슬라이드 완전히 재계산
          swiper.updateSize();
          swiper.updateSlides();
          swiper.updateSlidesClasses();
          swiper.update();
          
          // loop 모드에서 첫 번째 슬라이드로 이동 (transition 없이)
          swiper.slideToLoop(0, 0, false);
          
          // 한 프레임 후 다시 한 번 확실하게 위치 설정
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (swiperRef.current) {
                const swiper = swiperRef.current;
                swiper.updateSize();
                swiper.update();
                swiper.slideToLoop(0, 0, false);
                
                // Navigation 업데이트
                if (swiper.navigation) {
                  swiper.navigation.update();
                }
                
                // Autoplay 시작 (이미지 로드 완료 후)
                if (swiper.autoplay) {
                  setTimeout(() => {
                    if (swiperRef.current?.autoplay) {
                      swiperRef.current.autoplay.start();
                    }
                  }, 500);
                }
              }
            });
          });
        }
      }, 150);
      
      return () => clearTimeout(timeoutId);
    }
  }, [imagesLoaded, totalImages]);

  return (
    <div className={`${styles.globalNetwork} global-network`}>
      <div className={`${styles.topTxt} top-txt`}>
        <p className="eg-font">Global Network</p>
        <h2>
          SPG는 국내 뿐만 아니라 전세계
          <br />
          수십개의 지사를 보유하고 있습니다.
        </h2>
        <p className="eg eg-font">
          SPG operates dozens of branches both in Korea
          <br />
          and across the globe.
        </p>
        <Link href="#" className={`${styles.moreView} more-view eg-font`}>
          SEE ALL +
        </Link>
      </div>
      <div className={`${styles.btmContents} btm-contents`}>
        <div className={`${styles.leftBtn} left-btn`} ref={prevButtonRef}>
          <img
            src="/images/icon/arrow_04.png"
            style={{ transform: "rotate(180deg)" }}
            alt="이전"
          />
        </div>
        <Swiper
          className={`${styles.spgBranch} spg-branch swiper-container`}
          modules={[Autoplay, Navigation]}
          slidesPerView={2.5}
          spaceBetween={30}
          loop={true}
          autoplay={
            imagesLoaded === totalImages
              ? {
                  delay: 3000,
                  disableOnInteraction: false,
                }
              : false
          }
          onSwiper={(swiper: SwiperType) => {
            swiperRef.current = swiper;
            // Navigation 버튼 연결
            if (prevButtonRef.current && swiper.params.navigation) {
              const navParams = swiper.params.navigation as any;
              navParams.prevEl = prevButtonRef.current;
              navParams.nextEl = null;
              swiper.navigation.init();
              swiper.navigation.update();
            }
            
            // 이미지가 로드되지 않았을 경우 autoplay 비활성화
            if (imagesLoaded < totalImages && swiper.autoplay) {
              swiper.autoplay.stop();
            }
          }}
          onSlideChange={(swiper: SwiperType) => {
            // 이미지 로드 완료 후 슬라이드 변경 시 업데이트
            if (imagesLoaded === totalImages && swiperRef.current) {
              requestAnimationFrame(() => {
                if (swiperRef.current) {
                  swiperRef.current.update();
                }
              });
            }
          }}
        >
          {branchData.map((branch, index) => (
            <SwiperSlide key={index}>
              <div className="region-img">
                <img
                  src={branch.imgPath}
                  alt={branch.alt}
                  onLoad={handleImageLoad}
                  onError={handleImageLoad}
                />
              </div>
              <div className="branch-region">
                <span className="region-ko">{branch.regionKo}</span>
                <span className="region-eg eg-font">{branch.regionEg}</span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default GlobalNetwork;
