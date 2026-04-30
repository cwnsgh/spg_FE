"use client";

/** 마케팅 글로벌 네트워크 해외 시설 탭 — `GlobalNetwork.tsx`에서 overseas 탭일 때만 마운트. */
import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ApiError, FranchiseItem, getFranchiseList } from "@/api";
import { normalizeExternalUrl } from "@/app/marketing/externalUrl";
import styles from "./OverseasFacilities.module.css";

interface Facility {
  id: string;
  name: string;
  address: string;
  region: string;
  phone: string;
  image: string;
  mapUrl?: string;
  websiteUrl?: string;
  position?: { x: number; y: number };
}

const OVERSEAS_GF_TYPE: Record<"branch" | "dealer", number> = {
  branch: 1,
  dealer: 3,
};

const DEFAULT_FACILITY_IMAGE = "/images/facilities/recruit_01.png";

const facilityMetaByName: Record<
  string,
  { image?: string; position?: { x: number; y: number } }
> = {
  "SPG USA, INC": {
    image: "/images/facilities/recruit_01.png",
    position: { x: 25, y: 45 },
  },
  "QINGDAO SUNGSHIN MOTOR CO.,LTD": {
    image: "/images/facilities/recruit_02.png",
    position: { x: 77.5, y: 46 },
  },
  "SPG MOTOR(SUZHOU) CO., LTD": {
    image: "/images/facilities/recruit_03.png",
    position: { x: 77.3, y: 49 },
  },
  "SPG VINA COMPANY LIMITED": {
    image: "/images/facilities/recruit_01.png",
    position: { x: 74.3, y: 57.5 },
  },
};

function mapFranchiseToFacility(item: FranchiseItem): Facility {
  const meta = facilityMetaByName[item.gf_subject] ?? {};

  return {
    id: String(item.gf_id),
    name: item.gf_subject,
    address: item.gf_addr || item.gf_area || item.gf_nation || "-",
    region: item.gf_continent || "기타",
    phone: item.gf_tel || item.gf_contact || "-",
    image: meta.image ?? DEFAULT_FACILITY_IMAGE,
    mapUrl: item.gf_map_url || undefined,
    websiteUrl: item.gf_url || undefined,
    position: meta.position,
  };
}

function getRegionOrder(region: string) {
  const orderMap: Record<string, number> = {
    아시아: 0,
    북아메리카: 1,
    남아메리카: 2,
    유럽: 3,
    중동: 4,
    아프리카: 5,
    오세아니아: 6,
  };

  return orderMap[region] ?? 99;
}

export default function OverseasFacilities() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [activeType, setActiveType] = useState<"branch" | "dealer">(
    (urlCategory === "dealer" ? "dealer" : "branch") as "branch" | "dealer"
  );
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [popupPositions, setPopupPositions] = useState<
    Record<string, { left: number; top: number }>
  >({});
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Record<string, HTMLDivElement>>({});
  const popupRefs = useRef<Record<string, HTMLDivElement>>({});

  // URL 파라미터 변경 시 상태 업데이트
  useEffect(() => {
    if (urlCategory === "dealer") {
      setActiveType("dealer");
    } else if (urlCategory === "branch") {
      setActiveType("branch");
    }
  }, [urlCategory]);

  useEffect(() => {
    setSelectedFacility(null);
  }, [activeType]);

  useEffect(() => {
    let isMounted = true;

    async function loadFacilities() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const listData = await getFranchiseList({
          gf_type: OVERSEAS_GF_TYPE[activeType],
          page: 1,
          limit: 200,
        });

        if (!isMounted) return;

        setFacilities(listData.items.map(mapFranchiseToFacility));
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof ApiError
            ? error.message
            : "해외 사업장 정보를 불러오지 못했습니다.";

        setErrorMessage(message);
        setFacilities([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFacilities();

    return () => {
      isMounted = false;
    };
  }, [activeType]);

  const facilitiesWithMarker = useMemo(
    () => facilities.filter((facility) => facility.position),
    [facilities]
  );

  useEffect(() => {
    if (!selectedFacility) {
      setPopupPositions({});
      return;
    }

    const facility = facilitiesWithMarker.find((f) => f.id === selectedFacility);
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
  }, [facilitiesWithMarker, selectedFacility]);

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

      const facility = facilitiesWithMarker.find((f) => f.id === selectedFacility);
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
  }, [selectedFacility, facilitiesWithMarker]);

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
  const groupedByRegion = useMemo(
    () =>
      facilities.reduce(
    (acc, facility) => {
      const region = facility.region || "기타";
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(facility);
      return acc;
    },
    {} as Record<string, Facility[]>
      ),
    [facilities]
  );

  const orderedRegions = useMemo(
    () => Object.keys(groupedByRegion).sort((a, b) => getRegionOrder(a) - getRegionOrder(b)),
    [groupedByRegion]
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
        {facilitiesWithMarker.map((facility) => (
          <div
            key={facility.id}
            ref={(el) => {
              if (el) markerRefs.current[facility.id] = el;
            }}
            className={styles.mapMarker}
            style={{
              left: `${facility.position?.x ?? 0}%`,
              top: `${facility.position?.y ?? 0}%`,
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
        {facilitiesWithMarker.map((facility) => {
          const position = popupPositions[facility.id];
          const normalizedMapUrl = normalizeExternalUrl(facility.mapUrl);
          const normalizedWebsiteUrl = normalizeExternalUrl(facility.websiteUrl);
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
                {(normalizedMapUrl || normalizedWebsiteUrl) && (
                  <div className={styles.popupButtonWrapper}>
                    {normalizedMapUrl && (
                      <a
                        href={normalizedMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.popupDetailBtn}
                      >
                        지도 보기
                      </a>
                    )}
                    {normalizedWebsiteUrl && (
                      <a
                        href={normalizedWebsiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.popupDetailBtn}
                      >
                        웹사이트
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 대륙별 상세정보 */}
      <div className={styles.facilitiesDetail}>
        {isLoading && (
          <p className={styles.statusMessage}>
            해외 사업장 정보를 불러오는 중입니다.
          </p>
        )}

        {!isLoading && errorMessage && (
          <p className={styles.statusMessage}>{errorMessage}</p>
        )}

        {!isLoading && !errorMessage && facilities.length === 0 && (
          <p className={styles.statusMessage}>표시할 해외 사업장이 없습니다.</p>
        )}

        {!isLoading &&
          !errorMessage &&
          orderedRegions.map((region) => (
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
                    {(normalizeExternalUrl(facility.mapUrl) ||
                      normalizeExternalUrl(facility.websiteUrl)) && (
                      <div className={styles.cardActions}>
                        {normalizeExternalUrl(facility.mapUrl) && (
                          <a
                            href={normalizeExternalUrl(facility.mapUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.cardMapBtn}
                          >
                            지도 보기
                          </a>
                        )}
                        {normalizeExternalUrl(facility.websiteUrl) && (
                          <a
                            href={normalizeExternalUrl(facility.websiteUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.cardMapBtn}
                          >
                            웹사이트
                          </a>
                        )}
                      </div>
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
