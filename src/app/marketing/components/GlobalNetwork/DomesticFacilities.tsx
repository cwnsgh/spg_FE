"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./DomesticFacilities.module.css";

interface Facility {
  id: string;
  name: string;
  address: string;
  phone: string;
  region: string;
  city: string;
  googleMapUrl?: string;
}

// 임시 데이터 (나중에 실제 데이터로 교체)
const domesticAgencies: Facility[] = [
  {
    id: "domestic-1",
    name: "(주)현대체인",
    address: "대구광역시 중구 북성로 53 (북성로2가)",
    phone: "053-252-9590",
    region: "대구광역시",
    city: "중구",
    googleMapUrl: "https://www.google.com/maps?q=대구광역시+중구+북성로+53",
  },
  // 나머지 데이터는 나중에 추가
];

const specialtyStores: Facility[] = [];
const defenseAgencies: Facility[] = [];

export default function DomesticFacilities() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState<
    "domestic" | "specialty" | "defense"
  >(
    (urlCategory === "specialty"
      ? "specialty"
      : urlCategory === "defense"
        ? "defense"
        : "domestic") as "domestic" | "specialty" | "defense"
  );
  const [activeRegion, setActiveRegion] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState("");

  // URL 파라미터 변경 시 상태 업데이트
  useEffect(() => {
    if (urlCategory === "specialty") {
      setActiveCategory("specialty");
    } else if (urlCategory === "defense") {
      setActiveCategory("defense");
    } else if (urlCategory === "domestic") {
      setActiveCategory("domestic");
    }
  }, [urlCategory]);

  const facilities =
    activeCategory === "domestic"
      ? domesticAgencies
      : activeCategory === "specialty"
        ? specialtyStores
        : defenseAgencies;

  // 지역 필터링
  const filteredByRegion = useMemo(() => {
    if (activeRegion === "전체") return facilities;
    return facilities.filter((f) => f.region === activeRegion);
  }, [facilities, activeRegion]);

  // 검색 필터링
  const filteredFacilities = useMemo(() => {
    if (!searchQuery) return filteredByRegion;
    const query = searchQuery.toLowerCase();
    return filteredByRegion.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.address.toLowerCase().includes(query)
    );
  }, [filteredByRegion, searchQuery]);

  // 사용 가능한 지역 목록
  const regions = useMemo(() => {
    const regionSet = new Set(facilities.map((f) => f.region));
    return ["전체", ...Array.from(regionSet).sort()];
  }, [facilities]);

  return (
    <section className={styles.domesticFacilities}>
      {/* 카테고리 탭 */}
      <ul className={styles.facilityCategoryTabs}>
        <li
          className={`${styles.tabItem} ${
            activeCategory === "domestic" ? styles.active : ""
          }`}
          onClick={() => setActiveCategory("domestic")}
        >
          국내 대리점
        </li>
        <li
          className={`${styles.tabItem} ${
            activeCategory === "specialty" ? styles.active : ""
          }`}
          onClick={() => setActiveCategory("specialty")}
        >
          전문 특판점
        </li>
        <li
          className={`${styles.tabItem} ${
            activeCategory === "defense" ? styles.active : ""
          }`}
          onClick={() => setActiveCategory("defense")}
        >
          국방대리점
        </li>
      </ul>

      {/* 지역 탭 */}
      <ul className={styles.regionTabs}>
        {regions.map((region) => (
          <li
            key={region}
            className={`${styles.regionItem} ${
              activeRegion === region ? styles.active : ""
            }`}
            onClick={() => setActiveRegion(region)}
          >
            {region}
          </li>
        ))}
      </ul>

      {/* 시설 콘텐츠 */}
      <div className={styles.facilityContent}>
        {/* 시설 리스트 */}
        <div className={styles.facilityList}>
          <div className={styles.searchBox}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="센터명(직접입력)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className={styles.searchBtn}>
              <img src="/images/icon/search_ico.png" alt="검색" />
            </button>
          </div>
          <ul className={styles.facilityItems}>
            {filteredFacilities.map((facility) => (
              <li key={facility.id} className={styles.facilityItem}>
                <h3 className={styles.facilityName}>{facility.name}</h3>
                <p className={styles.facilityAddress}>{facility.address}</p>
                <p className={styles.facilityPhone}>{facility.phone}</p>
                {facility.googleMapUrl && (
                  <a
                    href={facility.googleMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.facilityMapBtn}
                  >
                    지도 보기
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* 지도 */}
        <div className={styles.facilityMap}>
          <div className={styles.mapContainer} id="google-map">
            {/* Google Maps는 나중에 구현 */}
            <div className={styles.mapPlaceholder}>Google Maps 지도 영역</div>
          </div>
        </div>
      </div>
    </section>
  );
}
