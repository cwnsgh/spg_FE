/**
 * 글로벌 네트워크 컴포넌트
 * - 전세계 지사 정보를 Swiper로 표시
 */
'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
// @ts-ignore
import { Swiper, SwiperSlide } from 'swiper/react';
// @ts-ignore
import { Autoplay } from 'swiper/modules';
// @ts-ignore
import type { Swiper as SwiperType } from 'swiper';
import { branchData } from '@/data/branchData';
import 'swiper/css';
import styles from './GlobalNetwork.module.css';

const GlobalNetwork: React.FC = () => {
  const prevButtonRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <div className={styles.globalNetwork}>
      <div className={styles.topTxt}>
        <p className="eg-font">Global Network</p>
        <h2>
          SPG는 국내 뿐만 아니라 전세계<br />
          수십개의 지사를 보유하고 있습니다.
        </h2>
        <p className={`${styles.eg} eg-font`}>
          SPG operates dozens of branches both in Korea<br />
          and across the globe.
        </p>
        <Link href="#" className={`${styles.moreView} eg-font`}>
          SEE ALL +
        </Link>
      </div>
      <div className={styles.btmContents}>
        <div
          className={styles.leftBtn}
          ref={prevButtonRef}
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <img
            src="/images/icon/arrow_04.png"
            style={{ transform: 'rotate(180deg)' }}
            alt="이전"
          />
        </div>
        <Swiper
          className={`${styles.spgBranch} swiper-container`}
          modules={[Autoplay]}
          slidesPerView={2.5}
          spaceBetween={30}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          onSwiper={(swiper: SwiperType) => {
            swiperRef.current = swiper;
          }}
        >
          {branchData.map((branch, index) => (
            <SwiperSlide key={index}>
              <div className={`${styles.regionImg} region-img`}>
                <img src={branch.imgPath} alt={branch.alt} />
              </div>
              <div className={`${styles.branchRegion} branch-region`}>
                <span className={`${styles.regionKo} region-ko`}>{branch.regionKo}</span>
                <span className={`${styles.regionEg} region-eg eg-font`}>{branch.regionEg}</span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default GlobalNetwork;

