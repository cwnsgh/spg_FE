/**
 * 제품 소개 섹션 — `(site)/page.tsx` 메인 홈.
 * - 데이터: (임시) 하드코딩 슬라이드 — 원복 시 아래 `fetchProductCategoryTree` useEffect 주석 해제
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
import { Navigation, Autoplay } from "swiper/modules";
// @ts-ignore
import type { Swiper as SwiperType } from "swiper";
// import { fetchProductCategoryTree, type ProductCategoryNode } from "@/api";
// import { toBackendAssetUrl } from "@/api/config";
import "swiper/css";
import styles from "./ProductIntro.module.css";

const DEFAULT_SLIDE_IMAGE = "/images/section02_prd_img.png";

/** 메인 제품군 임시 슬라이드 (API 1뎁스 대체). 2~5번은 여기에 객체 추가 */
type ProductIntroSlide = {
  ca_id: string;
  name_ko: string;
  name_en: string;
  desc_ko: string;
  desc_en: string;
  /** 특징: 한 줄에 한글(필수) + 선택 영문 */
  keywords_lines: { ko: string; en: string }[];
  image_url: string;
};

const HARDCODED_PRODUCT_INTRO_SLIDES: ProductIntroSlide[] = [
  {
    ca_id: "hard-sdd-1",
    name_ko: "SDD 로봇 액츄에이터",
    name_en: "SDD Actuator for Robotics",
    desc_ko:
      "로봇의 관절을 구동하는 시스템 중 하나로, 고배율 감속기 없이 낮은 감속비(일반적으로 10:1 이하)와 고토크 모터를 결합한 형태를 의미합니다.",
    desc_en:
      "It refers to a system that drives the joints of a robot, combining a high-torque motor with a low reduction ratio (generally 10:1 or less) without a high-ratio reducer.",
    keywords_lines: [
      { ko: "일체형 설계", en: "Integral design" },
      { ko: "탁월한 열 성능", en: "Exceptional thermal performance" },
      {
        ko: "고정밀 및 고강도 기어",
        en: "High precision and high rigidity gear",
      },
      { ko: "부드러운 작동 및 저소음", en: "Smooth operation and low noise" },
      { ko: "컴팩트하고 가벼운 구조", en: "Compact and lightweight structure" },
    ],
    image_url: "/images/productintro/productintro_1.png",
  },
  {
    ca_id: "hard-ksh-2",
    name_ko: "KSH 로봇감속기",
    name_en: "KSH STRAIN WAVE GEAR",
    desc_ko:
      "협동로봇 관절에 적용되는 대표적인 로봇감속기로, 타원형 캠의 회전을 이용해 금속 탄성체의 파동형 변형을 유도함으로써 회전 속도를 줄이고 토크를 높이는 초정밀 감속기입니다.",
    desc_en:
      "It is a representative robot reducer applied to collaborative robot joints, an ultra-precision reducer that reduces rotational speed and increases torque by inducing wave-like deformation of a metal elastic body using the rotation of an elliptical cam.",
    keywords_lines: [
      { ko: "컴팩트·심플한 디자인", en: "Compact and simple design" },
      { ko: "고토크용량", en: "High torque capacity" },
      { ko: "고강성", en: "High stiffness" },
      { ko: "제로백래쉬", en: "Non-backlash" },
      {
        ko: "우수한 위치결정정도와 회전정도",
        en: "High positioning and rotational accuracies",
      },
      { ko: "입출력축이 동축", en: "Coaxial input and output" },
    ],
    image_url: "/images/productintro/productintro_2.png",
  },
  {
    ca_id: "hard-ksr-3",
    name_ko: "KSR 로봇감속기",
    name_en: "KSR Cycloidal Robot Reducer",
    desc_ko:
      "모터의 회전 속도를 줄이고 토크(회전력)를 높이기 위해 사용되는 고정밀 초소형 감속기입니다. 주로 산업용 로봇의 관절, 반도체 제조 장치, 정밀 기계 등 고부하와 고정밀 제어가 동시에 필요한 곳에 필수적으로 사용됩니다.",
    desc_en:
      "This is a high-precision micro-reducer used to reduce motor rotational speed and increase torque. It is essential for applications requiring both high load and high-precision control, such as industrial robot joints, semiconductor manufacturing equipment, and precision machinery.",
    keywords_lines: [
      { ko: "고강성 및 고토크", en: "High rigidity and high torque" },
      { ko: "저백래시", en: "Low backlash" },
      { ko: "2단 감속 구조", en: "2-stage reduction" },
      { ko: "충격 저항성", en: "Shock resistance" },
    ],
    image_url: "/images/productintro/productintro_3.png",
  },
  {
    ca_id: "hard-planetary-4",
    name_ko: "정밀 유성감속기",
    name_en: "Planetary Gearhead",
    desc_ko:
      "중심에 있는 태양 기어(Sun Gear)를 중심으로 여러 개의 유성 기어(Planet Gears)가 회전하며 동력을 전달하는 방식의 감속 장치입니다. 구조가 태양계의 행성 궤도와 유사하여 붙여진 이름입니다.",
    desc_en: `It is a reduction gear system in which multiple "Planet Gears" rotate around a central "Sun Gear" to transmit power. It is named after its structure, which resembles the orbits of the planets in the solar system.`,
    keywords_lines: [
      { ko: "Helical Gear 적용", en: "Helical Gear" },
      { ko: "소형, 경량, 콤팩트 디자인", en: "Compact size" },
      { ko: "고정밀, 고강성", en: "High Precision, High Durability" },
      { ko: "고효율", en: "High efficiency" },
      { ko: "다양한 모터에 간편하게 취부", en: "Easy Mount" },
      { ko: "풍부한 감속비", en: "The wide range of reduction gear ratio" },
    ],
    image_url: "/images/productintro/productintro_4.png",
  },
  {
    ca_id: "hard-ac-geared-5",
    name_ko: "표준 AC 기어드모터",
    name_en: "Standard AC Geared Motor",
    desc_ko:
      "다양한 프레임 사이즈와 감속비로 폭넓은 범용성을 제공하는 산업용 표준 구동 솔루션 입니다.",
    desc_en:
      "It is an industrial standard drive solution that offers wide versatility with various frame sizes and reduction ratios.",
    keywords_lines: [
      { ko: "높은 신뢰성", en: "High reliability" },
      { ko: "글로벌 규격 인증", en: "Compliance with global standards" },
    ],
    image_url: "/images/productintro/productintro_5.png",
  },
];

// ——— API 1뎁스 기준 사용 시 아래 헬퍼 + useEffect 주석 해제 ———
// function categoryImageSrc(node: ProductCategoryNode): string {
//   const u = node.image_url?.trim();
//   if (!u) return DEFAULT_SLIDE_IMAGE;
//   if (u.startsWith("http://") || u.startsWith("https://")) return u;
//   return toBackendAssetUrl(u);
// }
//
// function pairedKeywordLines(node: ProductCategoryNode): { ko: string; en: string }[] {
//   const toLines = (raw: unknown): string[] => {
//     if (!Array.isArray(raw)) return [];
//     return raw.map((s) => String(s).trim());
//   };
//   const ko = toLines(node.keywords_ko);
//   const en = toLines(node.keywords_en);
//   const n = Math.max(ko.length, en.length);
//   const out: { ko: string; en: string }[] = [];
//   for (let i = 0; i < n; i++) {
//     const k = (ko[i] ?? "").trim();
//     const e = (en[i] ?? "").trim();
//     if (!k && !e) continue;
//     if (k && e) out.push({ ko: k, en: e });
//     else if (k) out.push({ ko: k, en: "" });
//     else out.push({ ko: "", en: e });
//   }
//   return out;
// }

const AUTOPLAY_MS = 2000;

const ProductIntro: React.FC = () => {
  const [roots] = useState<ProductIntroSlide[]>(HARDCODED_PRODUCT_INTRO_SLIDES);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const prevButtonRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLDivElement>(null);
  const textScrollRef = useRef<HTMLDivElement>(null);
  const rootsRef = useRef<ProductIntroSlide[]>([]);
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

  // useEffect(() => {
  //   let cancelled = false;
  //   setLoading(true);
  //   setLoadError("");
  //   void fetchProductCategoryTree()
  //     .then((payload) => {
  //       if (cancelled) return;
  //       const tree = payload.tree ?? [];
  //       const depth1 = tree.filter((n) => n.depth === 1);
  //       setRoots(depth1.length ? depth1 : tree);
  //       setActiveIndex(0);
  //     })
  //     .catch(() => {
  //       if (!cancelled) {
  //         setRoots([]);
  //         setLoadError("제품 분류를 불러오지 못했습니다.");
  //       }
  //     })
  //     .finally(() => {
  //       if (!cancelled) setLoading(false);
  //     });
  //   return () => {
  //     cancelled = true;
  //   };
  // }, []);

  const handleMenuClick = (index: number) => {
    if (index < 0 || index >= roots.length) return;
    setActiveIndex(index);
    if (swiperRef.current) {
      if (canLoop && typeof swiperRef.current.slideToLoop === "function") {
        swiperRef.current.slideToLoop(index);
      } else {
        swiperRef.current.slideTo(index);
      }
      swiperRef.current.autoplay?.start?.();
    }
  };

  /** 텍스트 영역 스크롤이 끝/처음일 때 휠이 페이지 스크롤로 이어지도록 (레이어에 휠이 걸리는 느낌 완화) */
  useEffect(() => {
    const el = textScrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const canScroll = el.scrollHeight > el.clientHeight + 2;
      if (!canScroll) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const delta = e.deltaY;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
      if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
        e.preventDefault();
        window.scrollBy({ top: delta, behavior: "auto" });
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [slideCount]);

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
    <section className={`section-02 prd-intro ${styles.productIntro}`}>
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
        {slideCount === 0 ? (
          <div className="prd-text-area">
            <p className="ko">표시할 제품 소개 항목이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className={`prd-text-area ${styles.textArea}`}>
              <h3 className={`prd-name ${styles.prdName}`}>
                <span className="name-kr">{current?.name_ko ?? "—"}</span>
                <span className={styles.nameSep} aria-hidden="true">
                  |
                </span>
                <span className="name-eg eg-font">
                  {current?.name_en ?? ""}
                </span>
              </h3>
              <div ref={textScrollRef} className={styles.textScroll}>
                <div className="prd-detail">
                  {current?.desc_ko?.trim() ? (
                    <p className="ko">{current.desc_ko}</p>
                  ) : null}
                  {current?.desc_en?.trim() ? (
                    <p className="eg eg-font">{current.desc_en}</p>
                  ) : null}
                </div>
                {current && current.keywords_lines.length > 0 ? (
                  <ul className="prd-keword">
                    {current.keywords_lines.map((line, index) => (
                      <li key={`${current.ca_id}-${index}`}>
                        <div className={styles.kwPair}>
                          {line.ko ? (
                            <span className={styles.kwKo}>{line.ko}</span>
                          ) : null}
                          {line.en?.trim() ? (
                            <span className={`${styles.kwEn} eg-font`}>
                              {line.en}
                            </span>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
            <div className={`prd-img-area ${styles.imgArea}`}>
              <Swiper
                key={swiperKey}
                className="prd-swiper swiper-container"
                modules={[Navigation, Autoplay]}
                slidesPerView={1.5}
                spaceBetween={90}
                allowTouchMove={true}
                loop={canLoop}
                autoplay={
                  canLoop
                    ? {
                        delay: AUTOPLAY_MS,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                      }
                    : false
                }
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
                  if (
                    typeof window !== "undefined" &&
                    window.innerWidth <= 1050
                  ) {
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
                    <div
                      className={styles.slideImageFrame}
                      onClick={() => handleMenuClick(index)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleMenuClick(index);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${product.name_ko} 슬라이드로 이동`}
                    >
                      <Image
                        src={product.image_url}
                        alt={product.name_ko}
                        fill
                        className={`product-image ${styles.slideImage}`}
                        sizes="(max-width: 1050px) 88vw, 32vw"
                        loading={index < 2 ? "eager" : "lazy"}
                      />
                    </div>
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
      {slideCount > 0 ? (
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
