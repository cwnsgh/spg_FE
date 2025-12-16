/**
 * IR 정보 컴포넌트
 * - 주가정보, 재무제표, IR정보 카드
 * - 호버 시 다른 카드에 off 클래스 추가
 */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { stockInfo, financialInfo, irInfo } from "@/data/irData";
import styles from "./IRInfo.module.css";

const IRInfo: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className={styles.ir}>
      <div className={styles.topTxt}>
        <h2>
          <span className="eg-font">IR</span>세계 최대의 기어드모터 및<br />
          정밀감속기 전문기업으로서 성장하겠습니다.
        </h2>
        <p className="eg-font">
          We aspire to become the world&apos;s leading company
          <br />
          specializing in geared motors and precision reducers.
        </p>
      </div>
      <div className={styles.btmContents}>
        {/* 주가정보 */}
        <Link
          href="#"
          className={`${styles.stockInfo} ${hoveredIndex !== null && hoveredIndex !== 0 ? styles.off : ""}`}
          onMouseEnter={() => handleMouseEnter(0)}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.title}>
            <h3>
              주가정보
              <span className={styles.eg}>Stock Information</span>
            </h3>
            <div className={styles.moreView}>
              <img src="/images/icon/arrow_01.png" alt="" />
            </div>
          </div>
          <div className={styles.detail}>
            <div className={styles.currInfo}>
              <h4>
                현재가
                <span className={styles.eg}>Current Price</span>
              </h4>
              <p className={styles.priceWrap}>
                <span className={`${styles.currPrice} eg-font`}>
                  {stockInfo.currentPrice}
                </span>
                KRW
              </p>
            </div>
            <ul>
              <li>
                <h4>
                  전일대비
                  <span className={styles.eg}>Change</span>
                </h4>
                <p className={`change-price eg-font`}>{stockInfo.change}</p>
              </li>
              <li>
                <h4>
                  동락률
                  <span className={styles.eg}>Change Rate</span>
                </h4>
                <p className={`change-rate eg-font`}>{stockInfo.changeRate}</p>
              </li>
              <li>
                <h4>
                  거래량
                  <span className={styles.eg}>Trading Volume</span>
                </h4>
                <p className={`trading-volu eg-font`}>
                  {stockInfo.tradingVolume}
                </p>
              </li>
            </ul>
          </div>
        </Link>
        {/* 재무제표 */}
        <Link
          href="#"
          className={`${styles.financialInfo} ${hoveredIndex !== null && hoveredIndex !== 1 ? styles.off : ""}`}
          onMouseEnter={() => handleMouseEnter(1)}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.title}>
            <h3>
              재무제표
              <span className={styles.eg}>Financial Statements</span>
            </h3>
            <div className={styles.moreView}>
              <img src="/images/icon/arrow_01.png" alt="" />
            </div>
          </div>
          <dl className={styles.detail}>
            <dt>
              매출액
              <span className={styles.eg}>Revenue</span>
            </dt>
            <dd className="eg-font">{financialInfo.revenue}</dd>
            <dt>
              자산
              <span className={styles.eg}>Assets</span>
            </dt>
            <dd className="eg-font">{financialInfo.assets}</dd>
            <dt>
              자본
              <span className={styles.eg}>Capital</span>
            </dt>
            <dd className="eg-font">{financialInfo.capital}</dd>
          </dl>
        </Link>
        {/* IR정보 */}
        <Link
          href="#"
          className={`${styles.irInfo} ${hoveredIndex !== null && hoveredIndex !== 2 ? styles.off : ""}`}
          onMouseEnter={() => handleMouseEnter(2)}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.title}>
            <h3>
              IR정보
              <span className={styles.eg}>Investor Relations</span>
            </h3>
            <div className={styles.moreView}>
              <img src="/images/icon/arrow_01.png" alt="" />
            </div>
          </div>
          <div className={styles.detail}>
            <div className={`${styles.boardItem} board-item`}>
              <h4 dangerouslySetInnerHTML={{ __html: irInfo.title }} />
              <p className={styles.date}>{irInfo.date}</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default IRInfo;
