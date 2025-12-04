"use client";

import styles from "./BusinessLocationList.module.css";

interface BusinessLocationListProps {
  businessType: "overseas" | "domestic";
  subType: "branches" | "agents";
}

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  imageUrl?: string;
  region: string;
}

export default function BusinessLocationList({
  businessType,
  subType,
}: BusinessLocationListProps) {
  // 임시 데이터
  const mockLocations: Location[] = [
    {
      id: "1",
      name: "SPG USA, INC",
      address: "A. 1000 Regulus",
      phone: "T. 000-000-0000",
      region: "미주",
    },
    {
      id: "2",
      name: "SPG MOTOR(SUZHOU) CO., LTD",
      address: "A. 100 RENHE ROAD, SUZHOU, INDUSTRIAL PARK, SUZHOU, CHINA",
      phone: "T. 000-000-0000",
      region: "아시아",
    },
    {
      id: "3",
      name: "QINGDAO GUNGCHUN MOTOR CO.,LTD",
      address:
        "A. NO.1 FENGSHU ROAD, LAIYANG TOWN, JIAOZHOU CITY, QINGDAO CITY",
      phone: "T. 000-000-0000",
      region: "아시아",
    },
  ];

  const locationsByRegion = mockLocations.reduce(
    (acc, location) => {
      if (!acc[location.region]) {
        acc[location.region] = [];
      }
      acc[location.region].push(location);
      return acc;
    },
    {} as Record<string, Location[]>
  );

  return (
    <div className={styles.container}>
      {Object.entries(locationsByRegion).map(([region, locations]) => (
        <div key={region} className={styles.regionSection}>
          <h3 className={styles.regionTitle}>{region}</h3>
          <div className={styles.locationGrid}>
            {locations.map((location) => (
              <div key={location.id} className={styles.locationCard}>
                <div className={styles.imagePlaceholder}>
                  {location.imageUrl ? (
                    <img
                      src={location.imageUrl}
                      alt={location.name}
                      className={styles.image}
                    />
                  ) : (
                    <div className={styles.placeholder}>이미지</div>
                  )}
                </div>
                <div className={styles.content}>
                  <h4 className={styles.name}>{location.name}</h4>
                  <p className={styles.address}>{location.address}</p>
                  <p className={styles.phone}>{location.phone}</p>
                  <button className={styles.detailButton}>상세보기</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


