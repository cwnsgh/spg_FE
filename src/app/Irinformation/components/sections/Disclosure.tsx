"use client";

import styles from "./Disclosure.module.css";

export default function Disclosure() {
  return (
    <section className={styles.board}>
      <h2 className={styles.section_title}>공시정보</h2>
      <div className={styles.iframeWrap}>
        <iframe
          src="https://dart.fss.or.kr/html/search/SearchCompanyIR3_M.html?textCrpNM=%EC%97%90%EC%8A%A4%ED%94%BC%EC%A7%80"
          name="IR"
          title="SPG 공시정보"
          scrolling="yes"
          frameBorder="0"
          width="750"
          height="720"
          marginHeight={0}
          marginWidth={0}
          className={styles.iframe}
        />
      </div>
    </section>
  );
}

