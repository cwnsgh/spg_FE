"use client";

import styles from "./ProductDepth3Select.module.css";

export interface Depth3Option {
  ca_id: number;
  name_ko: string;
}

interface ProductDepth3SelectProps {
  options: Depth3Option[];
  value: number | null;
  onChange: (caId: number | null) => void;
}

/**
 * 2뎁스 아래에 3뎁스가 있을 때만 표시. `null` = 전체(2뎁스 ca_id 기준 하위 전부).
 */
export default function ProductDepth3Select({
  options,
  value,
  onChange,
}: ProductDepth3SelectProps) {
  if (options.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <label htmlFor="product-depth3" className={styles.srOnly}>
        세부 카테고리
      </label>
      <div className={styles.selectShell}>
        <select
          id="product-depth3"
          className={styles.select}
          value={value === null ? "" : String(value)}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? null : Number(v));
          }}
        >
          <option value="">전체</option>
          {options.map((o) => (
            <option key={o.ca_id} value={String(o.ca_id)}>
              {o.name_ko}
            </option>
          ))}
        </select>
        <span className={styles.caret} aria-hidden />
      </div>
    </div>
  );
}
