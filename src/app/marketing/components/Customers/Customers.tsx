"use client";

import styles from "./Customers.module.css";

interface Client {
  imgPath: string;
  name: string;
}

const domesticClients: Client[] = [
  { imgPath: "/images/clients/domestic_01.png", name: "삼성전자" },
  { imgPath: "/images/clients/domestic_02.png", name: "LG전자" },
  { imgPath: "/images/clients/domestic_03.png", name: "동부대우전자" },
  { imgPath: "/images/clients/domestic_04.png", name: "코웨이" },
  { imgPath: "/images/clients/domestic_05.png", name: "우성 자동문" },
  { imgPath: "/images/clients/domestic_06.png", name: "위니아" },
  { imgPath: "/images/clients/domestic_07.png", name: "현대자동차" },
  { imgPath: "/images/clients/domestic_08.png", name: "기아" },
  { imgPath: "/images/clients/domestic_09.png", name: "DMS" },
  { imgPath: "/images/clients/domestic_10.png", name: "위닉스" },
  { imgPath: "/images/clients/domestic_11.png", name: "파세코" },
  { imgPath: "/images/clients/domestic_12.png", name: "보우시스템" },
];

const overseasClients: Client[] = [
  {
    imgPath: "/images/clients/overseas_01.png",
    name: "GE imagination at work",
  },
  {
    imgPath: "/images/clients/overseas_02.png",
    name: "Sumitomo drive technologies",
  },
  { imgPath: "/images/clients/overseas_03.png", name: "Electrolux" },
  { imgPath: "/images/clients/overseas_04.png", name: "Mabe" },
  { imgPath: "/images/clients/overseas_05.png", name: "Whirlpool" },
  { imgPath: "/images/clients/overseas_06.png", name: "Amana" },
  { imgPath: "/images/clients/overseas_07.png", name: "Arcelik" },
  { imgPath: "/images/clients/overseas_08.png", name: "Bosch" },
  { imgPath: "/images/clients/overseas_09.png", name: "suspa" },
  { imgPath: "/images/clients/overseas_10.png", name: "ulvac" },
  { imgPath: "/images/clients/overseas_11.png", name: "haier" },
  { imgPath: "/images/clients/overseas_12.png", name: "Stryker" },
];

export default function Customers() {
  return (
    <section className={styles.majorClients}>
      <section className={styles.domesticClients}>
        <h2>국내</h2>
        <ul className={styles.clientsList}>
          {domesticClients.map((client) => (
            <li key={client.imgPath}>
              <img
                src={client.imgPath}
                alt={client.name}
                className={styles.clientImage}
              />
            </li>
          ))}
        </ul>
      </section>
      <section className={styles.overseasClients}>
        <h2>해외</h2>
        <ul className={styles.clientsList}>
          {overseasClients.map((client) => (
            <li key={client.imgPath}>
              <img
                src={client.imgPath}
                alt={client.name}
                className={styles.clientImage}
              />
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
