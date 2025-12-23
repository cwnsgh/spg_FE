"use client";

import styles from "./Directions.module.css";

export default function Directions() {
  const locations = [
    {
      name: "본사",
      address: "인천광역시 남동구 청능대로289번길 45<br/>(고잔동,남동공단 678 12L) 21633",
      phone: "032-820-8200",
      fax: "032-812-4806",
      mapUrl: `https://www.google.com/maps?q=${encodeURIComponent("인천광역시 남동구 청능대로289번길 45")}&output=embed`,
      mapLabel: "SPG",
    },
    {
      name: "송도연구소",
      address: "인천광역시 연수구 송도과학로 16번길 13-30 21984",
      phone: "032-820-8200",
      fax: "032-822-9076",
      mapUrl: `https://www.google.com/maps?q=${encodeURIComponent("인천광역시 연수구 송도과학로 16번길 13-30")}&output=embed`,
      mapLabel: "SPG Songdo",
    },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>찾아오시는 길</h2>

      {locations.map((location, index) => (
        <div key={index} className={styles.locationSection}>
          <div className={styles.infoColumn}>
            <h3 className={styles.locationName}>{location.name}</h3>
            <div className={styles.infoItems}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>주소</span>
                <span 
                  className={styles.infoValue}
                  dangerouslySetInnerHTML={{ __html: location.address }}
                />
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>전화번호</span>
                <span className={styles.infoValue}>{location.phone}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>팩스</span>
                <span className={styles.infoValue}>{location.fax}</span>
              </div>
            </div>
          </div>
          <div className={styles.mapColumn}>
            <iframe
              src={location.mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${location.mapLabel} 지도`}
              className={styles.map}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
