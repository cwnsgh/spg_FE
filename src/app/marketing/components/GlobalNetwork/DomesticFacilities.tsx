"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./DomesticFacilities.module.css";

// Google Maps 타입 선언
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface Facility {
  id: string;
  name: string;
  address: string;
  phone: string;
  region: string;
  city: string;
  googleMapUrl?: string;
}

// 국내 대리점 데이터
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
  {
    id: "domestic-2",
    name: "삼익상공사",
    address: "충청남도 천안시 서북구 두정중1길 35, 1층(두정동) 31101",
    phone: "041-547-6625~6",
    region: "충청남도",
    city: "천안시",
    googleMapUrl:
      "https://www.google.com/maps?q=충청남도+천안시+서북구+두정중1길+35",
  },
  {
    id: "domestic-3",
    name: "(주)모터앤기어",
    address: "인천광역시 연수구 송도동 214 스마트밸리 지식산업센터 A동 814호",
    phone: "032-816-3697",
    region: "인천광역시",
    city: "연수구",
    googleMapUrl: "https://www.google.com/maps?q=인천광역시+연수구+송도동+214",
  },
  {
    id: "domestic-4",
    name: "삼성체인",
    address: "인천광역시 동구 송림동 294 산업용품상가 46-1",
    phone: "032-589-7000",
    region: "인천광역시",
    city: "동구",
    googleMapUrl: "https://www.google.com/maps?q=인천광역시+동구+송림동+294",
  },
  {
    id: "domestic-5",
    name: "(주)모터114",
    address: "서울특별시 금천구 가산동 481-10 벽산디지털밸리 2차 408호",
    phone: "02-2113-1000",
    region: "서울특별시",
    city: "금천구",
    googleMapUrl:
      "https://www.google.com/maps?q=서울특별시+금천구+가산동+481-10",
  },
  {
    id: "domestic-6",
    name: "(주)혜성자동화시스템",
    address: "서울특별시 종로구 장사동 216",
    phone: "02-2269-4397",
    region: "서울특별시",
    city: "종로구",
    googleMapUrl: "https://www.google.com/maps?q=서울특별시+종로구+장사동+216",
  },
  {
    id: "domestic-7",
    name: "(주)성신일렉트릭",
    address: "서울특별시 금천구 가산동 429-1 뉴티캐슬 B/D 1410호",
    phone: "02-2626-9000",
    region: "서울특별시",
    city: "금천구",
    googleMapUrl:
      "https://www.google.com/maps?q=서울특별시+금천구+가산동+429-1",
  },
  {
    id: "domestic-8",
    name: "(주)동신전자시스템",
    address: "경기 시흥시 서해안로 1670번길 135-1 (계수동489-5)",
    phone: "031-318-4074",
    region: "경기도",
    city: "시흥시",
    googleMapUrl:
      "https://www.google.com/maps?q=경기+시흥시+서해안로+1670번길+135-1",
  },
  {
    id: "domestic-9",
    name: "원일산업(주)",
    address: "서울특별시 금천구 가산동 327-32 대륭테크노타운 12차 518호",
    phone: "02-883-4896",
    region: "서울특별시",
    city: "금천구",
    googleMapUrl:
      "https://www.google.com/maps?q=서울특별시+금천구+가산동+327-32",
  },
  {
    id: "domestic-10",
    name: "(주)한일모텍",
    address: "경기도 군포시 엘에스로 115번길 50",
    phone: "02-804-0613",
    region: "경기도",
    city: "군포시",
    googleMapUrl:
      "https://www.google.com/maps?q=경기도+군포시+엘에스로+115번길+50",
  },
  {
    id: "domestic-11",
    name: "153KOREA(주)",
    address: "서울 구로구 구로동로47길 6, 153코리아빌딩",
    phone: "02-2613-6124",
    region: "서울특별시",
    city: "구로구",
    googleMapUrl: "https://www.google.com/maps?q=서울+구로구+구로동로47길+6",
  },
  {
    id: "domestic-12",
    name: "(주)삼익상공사",
    address: "부산광역시 사상구 괘법동 570-11",
    phone: "051-324-5512~3",
    region: "부산광역시",
    city: "사상구",
    googleMapUrl:
      "https://www.google.com/maps?q=부산광역시+사상구+괘법동+570-11",
  },
  {
    id: "domestic-13",
    name: "(주)제일하이테크",
    address: "대구광역시 북구 산격2동 1629 산업용재관 12동 10호 & 11호",
    phone: "053-604-1555",
    region: "대구광역시",
    city: "북구",
    googleMapUrl: "https://www.google.com/maps?q=대구광역시+북구+산격2동+1629",
  },
  {
    id: "domestic-14",
    name: "(주)영진상사",
    address: "광주광역시 광산구 도천동 621-18",
    phone: "062-954-4020",
    region: "광주광역시",
    city: "광산구",
    googleMapUrl:
      "https://www.google.com/maps?q=광주광역시+광산구+도천동+621-18",
  },
  {
    id: "domestic-15",
    name: "진우자동화",
    address: "광주광역시 광산구 장덕동 992-8 B-118",
    phone: "062-954-1511~2",
    region: "광주광역시",
    city: "광산구",
    googleMapUrl:
      "https://www.google.com/maps?q=광주광역시+광산구+장덕동+992-8",
  },
];

// 전문 특판점 데이터
const specialtyStores: Facility[] = [
  {
    id: "specialty-1",
    name: "이지솔루텍",
    address: "인천광역시 남동구 능허대로 583, 6층 622호(고잔동,금호오션타워)",
    phone: "070-8251-6471",
    region: "인천광역시",
    city: "남동구",
    googleMapUrl:
      "https://www.google.com/maps?q=인천광역시+남동구+능허대로+583",
  },
  {
    id: "specialty-2",
    name: "제이케이 주식회사",
    address:
      "인천광역시 남동구 호구포로 50, 6층 618호(고잔동, 엘아이지식산업센터)",
    phone: "032-207-7894",
    region: "인천광역시",
    city: "남동구",
    googleMapUrl: "https://www.google.com/maps?q=인천광역시+남동구+호구포로+50",
  },
  {
    id: "specialty-3",
    name: "(주)디에스콘",
    address: "경기도 안산시 상록구 팔곡두레길 25-15 (팔곡이동)",
    phone: "031-492-2546",
    region: "경기도",
    city: "안산시",
    googleMapUrl:
      "https://www.google.com/maps?q=경기도+안산시+상록구+팔곡두레길+25-15",
  },
  {
    id: "specialty-4",
    name: "삼성체인",
    address: "인천광역시 동구 송림동 294 산업용품상가 46-1",
    phone: "032-589-7000",
    region: "인천광역시",
    city: "동구",
    googleMapUrl: "https://www.google.com/maps?q=인천광역시+동구+송림동+294",
  },
  {
    id: "specialty-5",
    name: "(주)모터114",
    address: "서울특별시 금천구 가산동 481-10 벽산디지털밸리 2차 408호",
    phone: "02-2113-1000",
    region: "서울특별시",
    city: "금천구",
    googleMapUrl:
      "https://www.google.com/maps?q=서울특별시+금천구+가산동+481-10",
  },
  {
    id: "specialty-6",
    name: "(주)혜성자동화시스템",
    address: "서울특별시 종로구 장사동 216",
    phone: "02-2269-4397",
    region: "서울특별시",
    city: "종로구",
    googleMapUrl: "https://www.google.com/maps?q=서울특별시+종로구+장사동+216",
  },
  {
    id: "specialty-7",
    name: "(주)성신일렉트릭",
    address: "서울특별시 금천구 가산동 429-1 뉴티캐슬 B/D 1410호",
    phone: "02-2626-9000",
    region: "서울특별시",
    city: "금천구",
    googleMapUrl:
      "https://www.google.com/maps?q=서울특별시+금천구+가산동+429-1",
  },
  {
    id: "specialty-8",
    name: "(주)동신전자시스템",
    address: "경기 시흥시 서해안로 1670번길 135-1 (계수동489-5)",
    phone: "031-318-4074",
    region: "경기도",
    city: "시흥시",
    googleMapUrl:
      "https://www.google.com/maps?q=경기+시흥시+서해안로+1670번길+135-1",
  },
  {
    id: "specialty-9",
    name: "원일산업(주)",
    address: "서울특별시 금천구 가산동 327-32 대륭테크노타운 12차 518호",
    phone: "02-883-4896",
    region: "서울특별시",
    city: "금천구",
    googleMapUrl:
      "https://www.google.com/maps?q=서울특별시+금천구+가산동+327-32",
  },
  {
    id: "specialty-10",
    name: "(주)한일모텍",
    address: "경기도 군포시 엘에스로 115번길 50",
    phone: "02-804-0613",
    region: "경기도",
    city: "군포시",
    googleMapUrl:
      "https://www.google.com/maps?q=경기도+군포시+엘에스로+115번길+50",
  },
  {
    id: "specialty-11",
    name: "153KOREA(주)",
    address: "서울 구로구 구로동로47길 6, 153코리아빌딩",
    phone: "02-2613-6124",
    region: "서울특별시",
    city: "구로구",
    googleMapUrl: "https://www.google.com/maps?q=서울+구로구+구로동로47길+6",
  },
  {
    id: "specialty-12",
    name: "(주)삼익상공사",
    address: "부산광역시 사상구 괘법동 570-11",
    phone: "051-324-5512~3",
    region: "부산광역시",
    city: "사상구",
    googleMapUrl:
      "https://www.google.com/maps?q=부산광역시+사상구+괘법동+570-11",
  },
  {
    id: "specialty-13",
    name: "(주)제일하이테크",
    address: "대구광역시 북구 산격2동 1629 산업용재관 12동 10호 & 11호",
    phone: "053-604-1555",
    region: "대구광역시",
    city: "북구",
    googleMapUrl: "https://www.google.com/maps?q=대구광역시+북구+산격2동+1629",
  },
  {
    id: "specialty-14",
    name: "(주)영진상사",
    address: "광주광역시 광산구 도천동 621-18",
    phone: "062-954-4020",
    region: "광주광역시",
    city: "광산구",
    googleMapUrl:
      "https://www.google.com/maps?q=광주광역시+광산구+도천동+621-18",
  },
  {
    id: "specialty-15",
    name: "진우자동화",
    address: "광주광역시 광산구 장덕동 992-8 B-118",
    phone: "062-954-1511~2",
    region: "광주광역시",
    city: "광산구",
    googleMapUrl:
      "https://www.google.com/maps?q=광주광역시+광산구+장덕동+992-8",
  },
];

// 국방대리점 데이터
const defenseAgencies: Facility[] = [
  {
    id: "defense-1",
    name: "(주)현대체인",
    address: "대구광역시 중구 북성로 53 (북성로2가)",
    phone: "053-252-9590",
    region: "대구광역시",
    city: "중구",
    googleMapUrl: "https://www.google.com/maps?q=대구광역시+중구+북성로+53",
  },
  {
    id: "defense-2",
    name: "삼익상공사",
    address: "충청남도 천안시 서북구 두정중1길 35, 1층(두정동) 31101",
    phone: "041-547-6625~6",
    region: "충청남도",
    city: "천안시",
    googleMapUrl:
      "https://www.google.com/maps?q=충청남도+천안시+서북구+두정중1길+35",
  },
  {
    id: "defense-3",
    name: "(주)모터앤기어",
    address: "인천광역시 연수구 송도동 214 스마트밸리 지식산업센터 A동 814호",
    phone: "032-816-3697",
    region: "인천광역시",
    city: "연수구",
    googleMapUrl: "https://www.google.com/maps?q=인천광역시+연수구+송도동+214",
  },
  {
    id: "defense-4",
    name: "삼성체인",
    address: "인천광역시 동구 송림동 294 산업용품상가 46-1",
    phone: "032-589-7000",
    region: "인천광역시",
    city: "동구",
    googleMapUrl: "https://www.google.com/maps?q=인천광역시+동구+송림동+294",
  },
  {
    id: "defense-5",
    name: "(주)모터114",
    address: "서울특별시 금천구 가산동 481-10 벽산디지털밸리 2차 408호",
    phone: "02-2113-1000",
    region: "서울특별시",
    city: "금천구",
    googleMapUrl:
      "https://www.google.com/maps?q=서울특별시+금천구+가산동+481-10",
  },
  {
    id: "defense-6",
    name: "(주)혜성자동화시스템",
    address: "서울특별시 종로구 장사동 216",
    phone: "02-2269-4397",
    region: "서울특별시",
    city: "종로구",
    googleMapUrl: "https://www.google.com/maps?q=서울특별시+종로구+장사동+216",
  },
  {
    id: "defense-7",
    name: "(주)성신일렉트릭",
    address: "서울특별시 금천구 가산동 429-1 뉴티캐슬 B/D 1410호",
    phone: "02-2626-9000",
    region: "서울특별시",
    city: "금천구",
    googleMapUrl:
      "https://www.google.com/maps?q=서울특별시+금천구+가산동+429-1",
  },
  {
    id: "defense-8",
    name: "(주)동신전자시스템",
    address: "경기 시흥시 서해안로 1670번길 135-1 (계수동489-5)",
    phone: "031-318-4074",
    region: "경기도",
    city: "시흥시",
    googleMapUrl:
      "https://www.google.com/maps?q=경기+시흥시+서해안로+1670번길+135-1",
  },
  {
    id: "defense-9",
    name: "원일산업(주)",
    address: "서울특별시 금천구 가산동 327-32 대륭테크노타운 12차 518호",
    phone: "02-883-4896",
    region: "서울특별시",
    city: "금천구",
    googleMapUrl:
      "https://www.google.com/maps?q=서울특별시+금천구+가산동+327-32",
  },
  {
    id: "defense-10",
    name: "(주)한일모텍",
    address: "경기도 군포시 엘에스로 115번길 50",
    phone: "02-804-0613",
    region: "경기도",
    city: "군포시",
    googleMapUrl:
      "https://www.google.com/maps?q=경기도+군포시+엘에스로+115번길+50",
  },
  {
    id: "defense-11",
    name: "153KOREA(주)",
    address: "서울 구로구 구로동로47길 6, 153코리아빌딩",
    phone: "02-2613-6124",
    region: "서울특별시",
    city: "구로구",
    googleMapUrl: "https://www.google.com/maps?q=서울+구로구+구로동로47길+6",
  },
  {
    id: "defense-12",
    name: "(주)삼익상공사",
    address: "부산광역시 사상구 괘법동 570-11",
    phone: "051-324-5512~3",
    region: "부산광역시",
    city: "사상구",
    googleMapUrl:
      "https://www.google.com/maps?q=부산광역시+사상구+괘법동+570-11",
  },
  {
    id: "defense-13",
    name: "(주)제일하이테크",
    address: "대구광역시 북구 산격2동 1629 산업용재관 12동 10호 & 11호",
    phone: "053-604-1555",
    region: "대구광역시",
    city: "북구",
    googleMapUrl: "https://www.google.com/maps?q=대구광역시+북구+산격2동+1629",
  },
  {
    id: "defense-14",
    name: "(주)영진상사",
    address: "광주광역시 광산구 도천동 621-18",
    phone: "062-954-4020",
    region: "광주광역시",
    city: "광산구",
    googleMapUrl:
      "https://www.google.com/maps?q=광주광역시+광산구+도천동+621-18",
  },
  {
    id: "defense-15",
    name: "진우자동화",
    address: "광주광역시 광산구 장덕동 992-8 B-118",
    phone: "062-954-1511~2",
    region: "광주광역시",
    city: "광산구",
    googleMapUrl:
      "https://www.google.com/maps?q=광주광역시+광산구+장덕동+992-8",
  },
];

const GOOGLE_MAPS_API_KEY = "AIzaSyBmE12fWgmp2fcMkkISWonn2svRHF4_cI8";

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

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const currentMarkerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

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

  // 주소를 좌표로 변환하고 마커 표시 함수
  const showAddressOnMap = (address: string, facilityName: string) => {
    if (!mapRef.current || !geocoderRef.current) {
      return;
    }

    geocoderRef.current.geocode(
      { address: address },
      (results: any, status: string) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;

          // 마커가 없으면 생성, 있으면 위치만 업데이트
          if (!currentMarkerRef.current) {
            currentMarkerRef.current = new window.google.maps.Marker({
              position: location,
              map: mapRef.current,
              title: facilityName,
            });
          } else {
            // 기존 마커의 위치와 제목만 업데이트
            currentMarkerRef.current.setPosition(location);
            currentMarkerRef.current.setTitle(facilityName);
          }

          // 지도를 마커 위치로 부드럽게 이동
          mapRef.current.panTo(location);
          mapRef.current.setZoom(15);
        } else if (status === "REQUEST_DENIED") {
          console.error(
            "지도 기능을 사용하려면 Geocoding API가 필요합니다.\nGoogle Cloud Console에서 Geocoding API를 활성화해주세요."
          );
        }
      }
    );
  };

  // 지도에 마커 표시 함수
  const showMarkerOnGoogleMap = (facilityId: string) => {
    const facility = facilities.find((f) => f.id === facilityId);
    if (facility && mapRef.current) {
      showAddressOnMap(facility.address, facility.name);
    }
  };

  // Google Maps API 스크립트 로드
  useEffect(() => {
    // 지도 초기화 함수
    const initMap = () => {
      if (!mapContainerRef.current || mapRef.current) {
        return;
      }

      // window.google.maps가 완전히 준비될 때까지 기다림
      if (!window.google || !window.google.maps || !window.google.maps.Map) {
        setTimeout(initMap, 100);
        return;
      }

      // 기본 지도 생성 (한국 중심)
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        zoom: 7,
        center: { lat: 36.5, lng: 127.5 },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      geocoderRef.current = new window.google.maps.Geocoder();
      setIsMapReady(true);
    };

    // 이미 스크립트가 로드되어 있는지 확인
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com"]`
    );
    if (existingScript) {
      // 이미 로드되어 있으면 지도만 초기화
      if (
        window.google &&
        window.google.maps &&
        mapContainerRef.current &&
        !mapRef.current
      ) {
        initMap();
      } else {
        // API가 아직 준비되지 않았으면 대기
        const checkInterval = setInterval(() => {
          if (
            window.google &&
            window.google.maps &&
            mapContainerRef.current &&
            !mapRef.current
          ) {
            initMap();
            clearInterval(checkInterval);
          }
        }, 100);
        return () => clearInterval(checkInterval);
      }
      return;
    }

    // 스크립트 로드
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&language=ko&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // 스크립트 로드 완료 후 지도 초기화
      initMap();
    };

    script.onerror = () => {
      console.error("구글 지도 API를 로드할 수 없습니다.");
    };

    document.head.appendChild(script);

    return () => {
      // cleanup: 스크립트는 제거하지 않음 (다른 컴포넌트에서 사용할 수 있음)
      // 지도 인스턴스만 정리
      if (currentMarkerRef.current) {
        currentMarkerRef.current.setMap(null);
        currentMarkerRef.current = null;
      }
    };
  }, []);

  // 지도가 준비되면 첫 번째 항목 표시
  useEffect(() => {
    if (
      isMapReady &&
      mapRef.current &&
      geocoderRef.current &&
      filteredFacilities.length > 0
    ) {
      showMarkerOnGoogleMap(filteredFacilities[0].id);
    }
  }, [isMapReady, filteredFacilities]);

  // 필터링된 시설이 변경되면 첫 번째 항목 자동 표시
  useEffect(() => {
    if (mapRef.current && filteredFacilities.length > 0) {
      showMarkerOnGoogleMap(filteredFacilities[0].id);
    }
  }, [filteredFacilities]);

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
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      showMarkerOnGoogleMap(facility.id);
                    }}
                    className={styles.facilityMapBtn}
                  >
                    지도 보기
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* 지도 */}
        <div className={styles.facilityMap}>
          <div
            ref={mapContainerRef}
            className={styles.mapContainer}
            id="google-map"
          />
        </div>
      </div>
    </section>
  );
}
