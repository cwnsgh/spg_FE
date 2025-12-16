"use client";

import React, { useRef, useEffect } from "react";
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
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          onSwiper={(swiper: SwiperType) => {
            swiperRef.current = swiper;
            // Swiper 초기화 후 navigation 버튼 연결
            setTimeout(() => {
              if (prevButtonRef.current && swiper.params.navigation) {
                const navParams = swiper.params.navigation as any;
                navParams.prevEl = prevButtonRef.current;
                navParams.nextEl = null;
                swiper.navigation.init();
                swiper.navigation.update();
              }
            }, 0);
          }}
        >
          {branchData.map((branch, index) => (
            <SwiperSlide key={index}>
              <div className="region-img">
                <img src={branch.imgPath} alt={branch.alt} />
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
