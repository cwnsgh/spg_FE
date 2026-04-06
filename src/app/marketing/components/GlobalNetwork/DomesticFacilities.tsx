"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  ApiError,
  FranchiseItem,
  getFranchiseAreas,
  getFranchiseList,
} from "@/api";
import { normalizeExternalUrl } from "@/app/marketing/externalUrl";
import styles from "./DomesticFacilities.module.css";

declare global {
  interface Window {
    naver: any;
  }
}

type FacilityCategory = "domestic" | "specialty" | "defense";

interface Facility {
  id: string;
  name: string;
  address: string;
  phone: string;
  region: string;
  mapUrl?: string;
  websiteUrl?: string;
}

const NAVER_MAP_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

const CATEGORY_TO_GF_TYPE: Record<FacilityCategory, number> = {
  domestic: 2,
  specialty: 4,
  defense: 5,
};

function mapFranchiseToFacility(item: FranchiseItem): Facility {
  return {
    id: String(item.gf_id),
    name: item.gf_subject,
    address: item.gf_addr,
    phone: item.gf_tel || item.gf_contact || "-",
    region: item.gf_area || "기타",
    mapUrl: item.gf_map_url || undefined,
    websiteUrl: item.gf_url || undefined,
  };
}

export default function DomesticFacilities() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState<FacilityCategory>(
    (urlCategory === "specialty"
      ? "specialty"
      : urlCategory === "defense"
        ? "defense"
        : "domestic") as FacilityCategory
  );
  const [activeRegion, setActiveRegion] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [regions, setRegions] = useState<string[]>(["전체"]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [mapStatusMessage, setMapStatusMessage] = useState("");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const currentMarkerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (urlCategory === "specialty") {
      setActiveCategory("specialty");
    } else if (urlCategory === "defense") {
      setActiveCategory("defense");
    } else if (urlCategory === "domestic") {
      setActiveCategory("domestic");
    }
  }, [urlCategory]);

  useEffect(() => {
    setActiveRegion("전체");
    setSearchQuery("");
  }, [activeCategory]);

  useEffect(() => {
    let isMounted = true;

    async function loadFacilities() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const gfType = CATEGORY_TO_GF_TYPE[activeCategory];
        const [areas, listData] = await Promise.all([
          getFranchiseAreas(gfType),
          getFranchiseList({
            gf_type: gfType,
            page: 1,
            limit: 200,
          }),
        ]);

        if (!isMounted) return;

        setRegions(["전체", ...areas]);
        setFacilities(listData.items.map(mapFranchiseToFacility));
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof ApiError
            ? error.message
            : "사업장 정보를 불러오지 못했습니다.";

        setErrorMessage(message);
        setFacilities([]);
        setRegions(["전체"]);
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
  }, [activeCategory]);

  const filteredByRegion = useMemo(() => {
    if (activeRegion === "전체") return facilities;
    return facilities.filter((facility) => facility.region === activeRegion);
  }, [facilities, activeRegion]);

  const filteredFacilities = useMemo(() => {
    if (!searchQuery.trim()) return filteredByRegion;

    const query = searchQuery.toLowerCase();
    return filteredByRegion.filter(
      (facility) =>
        facility.name.toLowerCase().includes(query) ||
        facility.address.toLowerCase().includes(query)
    );
  }, [filteredByRegion, searchQuery]);

  const showAddressOnMap = useCallback(
    (address: string, facilityName: string) => {
      if (
        !mapRef.current ||
        !window.naver ||
        !window.naver.maps ||
        !window.naver.maps.Service ||
        !address
      ) {
        return;
      }

      console.log("네이버 geocode 요청", {
        facilityName,
        address,
      });

      window.naver.maps.Service.geocode(
        {
          query: address,
        },
        (status: string, response: any) => {
          if (status !== window.naver.maps.Service.Status.OK) {
            console.error("네이버 지도 주소 검색 실패", {
              status,
              facilityName,
              address,
              response,
            });
            setMapStatusMessage(
              `"${facilityName}" 주소를 지도에서 찾지 못했습니다. 콘솔 로그를 확인해 주세요.`
            );
            return;
          }

          const firstAddress = response?.v2?.addresses?.[0];
          if (!firstAddress) {
            console.warn("네이버 지도 주소 검색 결과 없음", {
              facilityName,
              address,
              response,
            });
            setMapStatusMessage(
              `"${facilityName}" 주소 검색 결과가 없습니다. 주소 데이터를 확인해 주세요.`
            );
            return;
          }

          const location = new window.naver.maps.LatLng(
            Number(firstAddress.y),
            Number(firstAddress.x)
          );

          if (!currentMarkerRef.current) {
            currentMarkerRef.current = new window.naver.maps.Marker({
              position: location,
              map: mapRef.current,
              title: facilityName,
            });
          } else {
            currentMarkerRef.current.setPosition(location);
            currentMarkerRef.current.setTitle(facilityName);
          }

          mapRef.current.panTo(location);
          mapRef.current.setZoom(15);
          setMapStatusMessage("");
        }
      );
    },
    []
  );

  const showMarkerOnNaverMap = useCallback(
    (facilityId: string) => {
      const facility = facilities.find((item) => item.id === facilityId);
      if (facility && mapRef.current) {
        showAddressOnMap(facility.address, facility.name);
      }
    },
    [facilities, showAddressOnMap]
  );

  useEffect(() => {
    const initMap = () => {
      if (!mapContainerRef.current || mapRef.current) {
        return;
      }

      if (!window.naver || !window.naver.maps || !window.naver.maps.Map) {
        setTimeout(initMap, 100);
        return;
      }

      mapRef.current = new window.naver.maps.Map(mapContainerRef.current, {
        center: new window.naver.maps.LatLng(36.5, 127.5),
        zoom: 7,
        zoomControl: true,
        zoomControlOptions: {
          position: window.naver.maps.Position.TOP_RIGHT,
        },
      });

      console.log("네이버 지도 초기화 완료", {
        clientId: NAVER_MAP_CLIENT_ID,
      });

      setTimeout(() => {
        if (mapRef.current && window.naver?.maps?.Event) {
          window.naver.maps.Event.trigger(mapRef.current, "resize");
        }
      }, 0);

      setMapStatusMessage("");
      setIsMapReady(true);
    };

    if (!NAVER_MAP_CLIENT_ID) {
      setMapStatusMessage("네이버 지도 키가 설정되지 않았습니다.");
      return;
    }

    const existingScript = document.querySelector(
      `script[src*="oapi.map.naver.com/openapi/v3/maps.js"]`
    );

    if (existingScript) {
      if (window.naver?.maps?.Map) {
        initMap();
        return;
      }

      const handleExistingScriptLoad = () => {
        initMap();
      };

      const handleExistingScriptError = () => {
        setMapStatusMessage("네이버 지도 API를 불러오지 못했습니다.");
      };

      existingScript.addEventListener("load", handleExistingScriptLoad);
      existingScript.addEventListener("error", handleExistingScriptError);

      return () => {
        existingScript.removeEventListener("load", handleExistingScriptLoad);
        existingScript.removeEventListener("error", handleExistingScriptError);
      };
    }

    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_CLIENT_ID}&submodules=geocoder`;
    script.async = true;

    script.onload = () => {
      initMap();
    };

    script.onerror = () => {
      setMapStatusMessage("네이버 지도 API를 불러오지 못했습니다.");
    };

    document.head.appendChild(script);

    return () => {
      if (currentMarkerRef.current) {
        currentMarkerRef.current.setMap(null);
        currentMarkerRef.current = null;
      }
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isMapReady && mapRef.current && filteredFacilities.length > 0) {
      showMarkerOnNaverMap(filteredFacilities[0].id);
    }
  }, [filteredFacilities, isMapReady, showMarkerOnNaverMap]);

  useEffect(() => {
    if (mapRef.current && filteredFacilities.length > 0) {
      showMarkerOnNaverMap(filteredFacilities[0].id);
    }
  }, [filteredFacilities, showMarkerOnNaverMap]);

  const handleShowMap = (facility: Facility) => {
    showMarkerOnNaverMap(facility.id);

    const normalizedMapUrl = normalizeExternalUrl(facility.mapUrl);

    if (!mapRef.current && normalizedMapUrl) {
      window.open(normalizedMapUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className={styles.domesticFacilities}>
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

      <div className={styles.facilityContent}>
        <div className={styles.facilityList}>
          <div className={styles.searchBox}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="센터명(직접입력)"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <button
              className={styles.searchBtn}
              type="button"
              aria-label="검색"
            >
              <img src="/images/icon/search_ico.png" alt="검색" />
            </button>
          </div>
          <ul className={styles.facilityItems}>
            {isLoading && (
              <li className={styles.facilityItem}>
                사업장 정보를 불러오는 중입니다.
              </li>
            )}

            {!isLoading && errorMessage && (
              <li className={styles.facilityItem}>{errorMessage}</li>
            )}

            {!isLoading && !errorMessage && filteredFacilities.length === 0 && (
              <li className={styles.facilityItem}>표시할 사업장이 없습니다.</li>
            )}

            {!isLoading &&
              !errorMessage &&
              filteredFacilities.map((facility) => (
                <li key={facility.id} className={styles.facilityItem}>
                  <h3 className={styles.facilityName}>{facility.name}</h3>
                  <p className={styles.facilityAddress}>{facility.address}</p>
                  <p className={styles.facilityPhone}>{facility.phone}</p>
                  {normalizeExternalUrl(facility.websiteUrl) && (
                    <p className={styles.facilityWebsite}>
                      <span className={styles.websiteLabel}>W.</span>
                      <a
                        href={normalizeExternalUrl(facility.websiteUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.websiteLink}
                      >
                        {facility.websiteUrl}
                      </a>
                    </p>
                  )}
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      handleShowMap(facility);
                    }}
                    className={styles.facilityMapBtn}
                    type="button"
                  >
                    지도 보기
                  </button>
                </li>
              ))}
          </ul>
        </div>

        <div className={styles.facilityMap}>
          <div className={styles.mapContainer}>
            <div
              ref={mapContainerRef}
              className={styles.mapCanvas}
              id="naver-map"
            />
            {mapStatusMessage && (
              <div className={styles.mapPlaceholder}>{mapStatusMessage}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
