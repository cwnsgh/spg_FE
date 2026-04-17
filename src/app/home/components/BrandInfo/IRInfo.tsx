/**
 * IR 정보 컴포넌트
 * - 주가정보: 백엔드 API 없음 → `irData` 표시, 카드는 IR정보 페이지로 이동
 * - 재무제표: `getFinancials`(손익·재무상태표) 최신 연도 요약
 * - IR정보: IR공고(`ir_notice`) 최신 1건
 * - 호버 시 다른 카드에 off 클래스 추가
 */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getBoardPosts, getFinancials, type BoardPostItem } from "@/api";
import {
  financialInfo as defaultFinancial,
  irInfo as defaultIr,
  stockInfo as defaultStock,
} from "@/data/irData";
import type { StockInfo } from "@/types";
import { rowValueByLabelCandidates } from "./irFinancialSummary";

const IR_ANNOUNCEMENT_PATH = "/Irinformation/announcement";
const IR_LIBRARY_TAB = "/Irinformation?tab=4";
const IR_HOME_PATH = "/Irinformation";
const STOCK_API_SERVICE_KEY =
  "3611f4488ca6aaaa3606943b06eb59dc33fa9fbfa1918fa4842adc2cb68d8abb";
const STOCK_API_URL =
  "https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo";
const STOCK_ITEM_NAME_KR = "에스피지";
const STOCK_ITEM_CODE = "058610";

function formatKoreanNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  const normalized = String(value).replace(/,/g, "").trim();
  if (!normalized) return "";
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return String(value);
  return parsed.toLocaleString("ko-KR");
}

function toSignedChange(value: string | number | null | undefined) {
  const normalized = String(value ?? "").replace(/,/g, "").trim();
  if (!normalized) return "";
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return String(value ?? "");
  const abs = Math.abs(parsed).toLocaleString("ko-KR");
  if (parsed > 0) return `+${abs}`;
  if (parsed < 0) return `-${abs}`;
  return abs;
}

function toRateText(value: string | number | null | undefined) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  return normalized.endsWith("%") ? normalized : `${normalized}%`;
}

function formatBaseDate(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!/^\d{8}$/.test(raw)) return "";
  const year = raw.slice(0, 4);
  const month = raw.slice(4, 6);
  const day = raw.slice(6, 8);
  return `${year}.${month}.${day}`;
}

function mapStockItemToDisplay(item: Record<string, unknown>): StockInfo {
  return {
    currentPrice:
      formatKoreanNumber(item.clpr as string | number | undefined) ||
      defaultStock.currentPrice,
    change:
      toSignedChange(
        (item.vs as string | number | undefined) ??
          (item.cmpPrevddPrc as string | number | undefined)
      ) || defaultStock.change,
    changeRate:
      toRateText(
        (item.fltRt as string | number | undefined) ??
          (item.vsRt as string | number | undefined)
      ) || defaultStock.changeRate,
    tradingVolume:
      formatKoreanNumber(
        (item.trqu as string | number | undefined) ??
          (item.trPrc as string | number | undefined)
      ) || defaultStock.tradingVolume,
  };
}

async function fetchStockItem() {
  const queryCandidates = [STOCK_ITEM_NAME_KR, STOCK_ITEM_CODE, "SPG"];

  for (const query of queryCandidates) {
    const stockUrl = new URL(STOCK_API_URL);
    stockUrl.searchParams.set("serviceKey", STOCK_API_SERVICE_KEY);
    stockUrl.searchParams.set("resultType", "json");
    stockUrl.searchParams.set("numOfRows", "50");
    stockUrl.searchParams.set("pageNo", "1");
    stockUrl.searchParams.set("likeItmsNm", query);

    const response = await fetch(stockUrl.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("[IRInfo] stock API HTTP error:", response.status, query);
      continue;
    }

    const json = (await response.json()) as {
      response?: {
        body?: {
          totalCount?: number;
          items?: { item?: Record<string, unknown> | Record<string, unknown>[] };
        };
      };
    };

    const stockItems = json?.response?.body?.items?.item;
    const itemList = Array.isArray(stockItems)
      ? stockItems
      : stockItems
        ? [stockItems]
        : [];

    const exactByName = itemList.find(
      (item) => String(item.itmsNm ?? "").trim() === STOCK_ITEM_NAME_KR
    );
    const exactByCode = itemList.find(
      (item) => String(item.srtnCd ?? "").trim() === STOCK_ITEM_CODE
    );
    const matched = exactByName ?? exactByCode ?? itemList[0];

    if (matched) {
      console.info("[IRInfo] stock API success:", {
        query,
        totalCount: json?.response?.body?.totalCount,
        itmsNm: matched.itmsNm,
        srtnCd: matched.srtnCd,
        basDt: matched.basDt,
      });
      return matched;
    }
  }

  return null;
}

function sortBoardPostsNewestFirst(items: BoardPostItem[]) {
  const toTime = (value: string) => {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  return [...items].sort((left, right) => {
    const noticePriority =
      Number(Boolean(right.is_notice)) - Number(Boolean(left.is_notice));
    if (noticePriority !== 0) return noticePriority;
    return toTime(right.datetime) - toTime(left.datetime);
  });
}

const IRInfo: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [stockDisplay, setStockDisplay] = useState<StockInfo>(defaultStock);
  const [stockBaseDate, setStockBaseDate] = useState("");
  const [financialDisplay, setFinancialDisplay] = useState(defaultFinancial);
  const [irTitleHtml, setIrTitleHtml] = useState(defaultIr.title);
  const [irDate, setIrDate] = useState(defaultIr.date);
  const [irBoardHref, setIrBoardHref] = useState("/Irinformation?tab=1");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [stockItem, incomeRes, balanceRes, boardRes] = await Promise.all([
          fetchStockItem(),
          getFinancials({ type: 2 }),
          getFinancials({ type: 1 }),
          getBoardPosts({ bo_table: "ir_notice", page: 1 }),
        ]);

        if (cancelled) return;

        if (stockItem) {
          setStockDisplay(mapStockItemToDisplay(stockItem));
          setStockBaseDate(formatBaseDate(stockItem.basDt));
        } else {
          console.warn("[IRInfo] stock API no matching item; fallback used");
          setStockDisplay(defaultStock);
          setStockBaseDate("");
        }

        setFinancialDisplay({
          revenue: rowValueByLabelCandidates(incomeRes.financial_data, [
            "매출액",
          ]),
          assets: rowValueByLabelCandidates(balanceRes.financial_data, [
            "자산총계",
          ]),
          capital: rowValueByLabelCandidates(balanceRes.financial_data, [
            "자본총계",
          ]),
        });

        const sorted = sortBoardPostsNewestFirst(boardRes.list ?? []);
        const top = sorted[0];
        if (top) {
          setIrTitleHtml(top.subject);
          setIrDate(top.datetime);
          setIrBoardHref(`${IR_ANNOUNCEMENT_PATH}/${top.id}`);
        } else {
          setIrTitleHtml(defaultIr.title);
          setIrDate(defaultIr.date);
          setIrBoardHref("/Irinformation?tab=1");
        }
      } catch (error) {
        if (cancelled) return;
        console.error("[IRInfo] load failed:", error);
        setStockDisplay(defaultStock);
        setStockBaseDate("");
        setFinancialDisplay(defaultFinancial);
        setIrTitleHtml(defaultIr.title);
        setIrDate(defaultIr.date);
        setIrBoardHref("/Irinformation?tab=1");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="ir">
      <div className="top-txt">
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
      <div className="btm-contents">
        {/* 주가정보 — 시세 API 연동 시 `irData`/이 카드만 교체하면 됩니다. */}
        <Link
          href={IR_HOME_PATH}
          className={`stock-info ${hoveredIndex !== null && hoveredIndex !== 0 ? "off" : ""}`}
          onMouseEnter={() => handleMouseEnter(0)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="title">
            <h3>
              주가정보
              <span className="eg">Stock Information</span>
            </h3>
            <div className="more-view">
              <img src="/images/icon/arrow_01.png" alt="" />
            </div>
          </div>
          <div className="detail">
            <div className="curr-info">
              <h4>
                현재가
                <span className="eg">Current Price</span>
              </h4>
              <p className="price-wrap">
                <span className="curr-price eg-font">
                  {stockDisplay.currentPrice}
                </span>
                KRW
              </p>
            </div>
            <ul>
              <li>
                <h4>
                  전일대비
                  <span className="eg">Change</span>
                </h4>
                <p className="change-price eg-font">{stockDisplay.change}</p>
              </li>
              <li>
                <h4>
                  등락률
                  <span className="eg">Change Rate</span>
                </h4>
                <p className="change-rate eg-font">{stockDisplay.changeRate}</p>
              </li>
              <li>
                <h4>
                  거래량
                  <span className="eg">Trading Volume</span>
                </h4>
                <p className="trading-volu eg-font">
                  {stockDisplay.tradingVolume}
                </p>
              </li>
            </ul>
          </div>
          <p className="stock-base-date">
            기준일 {stockBaseDate || "-"}
          </p>
        </Link>
        {/* 재무제표 */}
        <Link
          href={IR_LIBRARY_TAB}
          className={`financial-info ${hoveredIndex !== null && hoveredIndex !== 1 ? "off" : ""}`}
          onMouseEnter={() => handleMouseEnter(1)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="title">
            <h3>
              재무제표
              <span className="eg">Financial Statements</span>
            </h3>
            <div className="more-view">
              <img src="/images/icon/arrow_01.png" alt="" />
            </div>
          </div>
          <dl className="detail">
            <dt>
              매출액
              <span className="eg">Revenue</span>
            </dt>
            <dd className="eg-font">{financialDisplay.revenue}</dd>
            <dt>
              자산
              <span className="eg">Assets</span>
            </dt>
            <dd className="eg-font">{financialDisplay.assets}</dd>
            <dt>
              자본
              <span className="eg">Capital</span>
            </dt>
            <dd className="eg-font">{financialDisplay.capital}</dd>
          </dl>
        </Link>
        {/* IR정보 */}
        <Link
          href={irBoardHref}
          className={`ir-info ${hoveredIndex !== null && hoveredIndex !== 2 ? "off" : ""}`}
          onMouseEnter={() => handleMouseEnter(2)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="title">
            <h3>
              IR정보
              <span className="eg">Investor Relations</span>
            </h3>
            <div className="more-view">
              <img src="/images/icon/arrow_01.png" alt="" />
            </div>
          </div>
          <div className="detail">
            <div className="board-item">
              <h4 dangerouslySetInnerHTML={{ __html: irTitleHtml }} />
              <p className="date">{irDate}</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default IRInfo;
