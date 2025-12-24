"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./OverseasFacilities.module.css";

interface Facility {
  id: string;
  name: string;
  address: string;
  position: { x: number; y: number };
  region: string;
  phone: string;
  image: string;
  googleMapUrl?: string;
}

const overseasBranches: Facility[] = [
  {
    id: "branch-1",
    name: "SPG USA, INC",
    address: "1726 Wright Blvd.",
    position: { x: 25, y: 45 },
    region: "미주",
    phone: "00-000-000-0000",
    image: "/images/facilities/recruit_01.png",
    googleMapUrl:
      "https://www.google.com/maps/place/1726+Wright+Blvd,+Schaumburg,+IL+60193+%EB%AF%B8%EA%B5%AD/@41.9939902,-88.1034414,18z/data=!4m5!3m4!1s0x880fa944d8476eed:0x894bbc104d45a11f!8m2!3d41.9939464!4d-88.1023632?shorturl=1",
  },
  {
    id: "branch-2",
    name: "QINGDAO SUNGSHIN MOTOR CO.,LTD",
    address: "No.3 YANGHUI ROAD, LANCUN TOWN, JIMO DISTRICT,QINGDAO CITY",
    position: { x: 77.5, y: 46 },
    region: "아시아",
    phone: "00-000-000-0000",
    image: "/images/facilities/recruit_02.png",
    googleMapUrl:
      "https://www.google.com/maps/place/Lancunzhen,+Jimo,+%EC%B9%AD%EB%8B%A4%EC%98%A4%EC%8B%9C+%EC%82%B0%EB%91%A5%EC%84%B1+%EC%A4%91%EA%B5%AD/@36.3783308,120.328263,11z/data=!4m5!3m4!1s0x359677f65d93aec3:0xd7693092ea50620b!8m2!3d36.407693!4d120.185515?shorturl=1",
  },
  {
    id: "branch-3",
    name: "SPG MOTOR(SUZHOU) CO., LTD",
    address: "168 HONGYE ROAD, SUZHOU INDUSTRIAL PARK, SUZHOU CHINA",
    position: { x: 77.3, y: 49 },
    region: "아시아",
    phone: "00-000-000-0000",
    image: "/images/facilities/recruit_03.png",
    googleMapUrl:
      "https://www.google.com/maps/place/168+Hong+Ye+Lu,+Wuzhong+Qu,+Suzhou+Shi,+Jiangsu+Sheng,+%EC%A4%91%EA%B5%AD+215001/@30.9758114,121.1216683,7z/data=!4m6!3m5!1s0x35b3a77426cfa871:0x1fc72dc6ac188ef9!8m2!3d31.2791377!4d120.6621552?shorturl=1",
  },
  {
    id: "branch-4",
    name: "SPG VINA COMPANY LIMITED",
    address: "LOT NO.L-2A-CN, MY PHUOC INDUSTRIAL PARK 2",
    position: { x: 74.3, y: 57.5 },
    region: "아시아",
    phone: "00-000-000-0000",
    image: "/images/facilities/recruit_01.png",
    googleMapUrl:
      "https://www.google.com/maps/place/My+Phuoc+3+Industrial+Park+Accommodation+GP9/@11.1270981,106.6356935,17z/data=!4m5!3m4!1s0x3174cea45f15ae7f:0x9f0d5cbb7ce116f9!8m2!3d11.1270981!4d106.6378822?shorturl=1",
  },
];

const overseasDealers: Facility[] = [
  {
    id: "dealer-1",
    name: "SPG VINA COMPANY LIMITED",
    address: "LOT NO.L-2A-CN, MY PHUOC INDUSTRIAL PARK 2",
    position: { x: 73.3, y: 25.5 },
    region: "아시아",
    phone: "00-000-000-0000",
    image: "/images/facilities/recruit_01.png",
  },
  {
    id: "dealer-2",
    name: "SPG MOTOR(SUZHOU) CO., LTD",
    address: "168 HONGYE ROAD, SUZHOU INDUSTRIAL PARK, SUZHOU CHINA",
    position: { x: 77.3, y: 49 },
    region: "아시아",
    phone: "00-000-000-0000",
    image: "/images/facilities/recruit_02.png",
  },
];

export default function OverseasFacilities() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [activeType, setActiveType] = useState<"branch" | "dealer">(
    (urlCategory === "dealer" ? "dealer" : "branch") as "branch" | "dealer"
  );
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [popupPositions, setPopupPositions] = useState<
    Record<string, { left: number; top: number }>
  >({});
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Record<string, HTMLDivElement>>({});
  const popupRefs = useRef<Record<string, HTMLDivElement>>({});

  const facilities =
    activeType === "branch" ? overseasBranches : overseasDealers;

  // URL 파라미터 변경 시 상태 업데이트
  useEffect(() => {
    if (urlCategory === "dealer") {
      setActiveType("dealer");
    } else if (urlCategory === "branch") {
      setActiveType("branch");
    }
  }, [urlCategory]);

  useEffect(() => {
    if (!selectedFacility) {
      setPopupPositions({});
      return;
    }

    const facility = facilities.find((f) => f.id === selectedFacility);
    if (!facility) return;

    const marker = markerRefs.current[facility.id];

    if (marker && mapContainerRef.current) {
      const markerRect = marker.getBoundingClientRect();
      const containerRect = mapContainerRef.current.getBoundingClientRect();
      const markerLeft = markerRect.left - containerRect.left;
      const markerTop = markerRect.top - containerRect.top;

      // 초기 위치 설정 (팝업이 렌더링되면 높이를 측정해서 다시 계산)
      setPopupPositions({
        [facility.id]: {
          left: markerLeft + 15,
          top: markerTop - 10,
        },
      });
    }
  }, [facilities, selectedFacility]);

  // 팝업이 렌더링된 후 높이를 측정해서 위치 재계산
  useEffect(() => {
    if (!selectedFacility) return;

    // 팝업이 DOM에 렌더링될 때까지 약간의 지연
    const timer = setTimeout(() => {
      const popup = popupRefs.current[selectedFacility];
      if (!popup) return;

      // HTML과 동일하게 팝업 높이 측정
      const popupHeight = popup.offsetHeight;
      if (popupHeight === 0) return; // 아직 높이가 계산되지 않음

      const facility = facilities.find((f) => f.id === selectedFacility);
      if (!facility) return;

      const marker = markerRefs.current[facility.id];
      if (!marker || !mapContainerRef.current) return;

      const markerRect = marker.getBoundingClientRect();
      const containerRect = mapContainerRef.current.getBoundingClientRect();
      const markerLeft = markerRect.left - containerRect.left;
      const markerTop = markerRect.top - containerRect.top;

      // HTML 파일과 동일한 로직
      // 마커는 transform: translate(-50%, -100%)이 적용되어 있음
      // markerTop은 마커 div의 상단 위치
      const popupLeft = markerLeft + 15;
      const popupBottom = markerTop - 10;
      const popupTop = popupBottom - popupHeight;

      setPopupPositions({
        [selectedFacility]: {
          left: popupLeft,
          top: popupTop,
        },
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [selectedFacility, facilities]);

  const handleMarkerClick = (facilityId: string) => {
    setSelectedFacility(selectedFacility === facilityId ? null : facilityId);
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // 마커나 팝업 내부를 클릭한 경우가 아닌지 확인
    const isMarkerClick = Object.values(markerRefs.current).some(
      (marker) => marker && (marker === target || marker.contains(target))
    );

    const isPopupClick = Object.values(popupRefs.current).some(
      (popup) => popup && (popup === target || popup.contains(target))
    );

    // 마커나 팝업이 아닌 곳을 클릭한 경우에만 팝업 닫기
    if (!isMarkerClick && !isPopupClick) {
      setSelectedFacility(null);
    }
  };

  // 대륙별로 그룹화
  const groupedByRegion = facilities.reduce(
    (acc, facility) => {
      const region = facility.region || "기타";
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(facility);
      return acc;
    },
    {} as Record<string, Facility[]>
  );

  return (
    <section className={styles.facilitiesMap}>
      {/* 해외지사/해외대리점 탭 */}
      <ul className={styles.facilityTypeTabs}>
        <li
          className={`${styles.tabItem} ${
            activeType === "branch" ? styles.active : ""
          }`}
          onClick={() => setActiveType("branch")}
        >
          해외지사
        </li>
        <li
          className={`${styles.tabItem} ${
            activeType === "dealer" ? styles.active : ""
          }`}
          onClick={() => setActiveType("dealer")}
        >
          해외대리점
        </li>
      </ul>

      {/* 지도 */}
      <div
        className={styles.mapContainer}
        ref={mapContainerRef}
        onClick={handleClickOutside}
      >
        <div className={styles.backMap}>
          <img
            src="/images/overseas_map.png"
            alt="해외 지사 지도"
            className={styles.mapImage}
          />
        </div>

        {/* 마커들 */}
        {facilities.map((facility) => (
          <div
            key={facility.id}
            ref={(el) => {
              if (el) markerRefs.current[facility.id] = el;
            }}
            className={styles.mapMarker}
            style={{
              left: `${facility.position.x}%`,
              top: `${facility.position.y}%`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleMarkerClick(facility.id);
            }}
          >
            <img
              src="/images/icon/map_marker.png"
              alt={facility.name}
              className={styles.markerImage}
            />
          </div>
        ))}

        {/* 팝업들 */}
        {facilities.map((facility) => {
          const position = popupPositions[facility.id];
          if (!position || selectedFacility !== facility.id) return null;

          return (
            <div
              key={`popup-${facility.id}`}
              ref={(el) => {
                if (el) popupRefs.current[facility.id] = el;
              }}
              className={styles.makerPopup}
              style={{
                left: `${position.left}px`,
                top: `${position.top}px`,
              }}
            >
              <div className={styles.popupContent}>
                <button
                  className={styles.popupCloseBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFacility(null);
                  }}
                  aria-label="팝업 닫기"
                >
                  ×
                </button>
                <h3 className={styles.popupCompanyName}>{facility.name}</h3>
                <div className={styles.popupAddressWrapper}>
                  <p className={styles.popupAddress}>{facility.address}</p>
                </div>
                {activeType === "branch" && facility.googleMapUrl && (
                  <div className={styles.popupButtonWrapper}>
                    <a
                      href={facility.googleMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.popupDetailBtn}
                    >
                      지도 보기
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 대륙별 상세정보 */}
      <div className={styles.facilitiesDetail}>
        {Object.keys(groupedByRegion).map((region) => (
          <div key={region} className={styles.regionSection}>
            <h2 className={styles.regionTitle}>{region}</h2>
            <div className={styles.facilityCards}>
              {groupedByRegion[region].map((facility) => (
                <div key={facility.id} className={styles.facilityCard}>
                  <div className={styles.cardHeader}>
                    <img
                      src="/images/icon/map_ico.png"
                      alt="건물 아이콘"
                      className={styles.cardIcon}
                    />
                    <h3 className={styles.cardCompanyName}>{facility.name}</h3>
                  </div>
                  <img
                    src={facility.image}
                    alt={facility.name}
                    className={styles.cardBuildingImage}
                  />
                  <div className={styles.cardInfo}>
                    <div className={styles.cardInfoText}>
                      <p className={styles.cardAddress}>
                        <span className={styles.label}>A.</span>{" "}
                        {facility.address}
                      </p>
                      <p className={styles.cardPhone}>
                        <span className={styles.label}>T.</span>{" "}
                        {facility.phone}
                      </p>
                    </div>
                    {activeType === "branch" && facility.googleMapUrl && (
                      <a
                        href={facility.googleMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.cardMapBtn}
                      >
                        지도 보기
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
