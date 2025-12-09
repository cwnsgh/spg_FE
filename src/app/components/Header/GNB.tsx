/**
 * GNB (Global Navigation Bar) 컴포넌트
 * - 메인 네비게이션 메뉴와 서브메뉴 표시
 */
"use client";

import React from "react";
import Link from "next/link";
import { MenuItem } from "../../../types";
import styles from "./GNB.module.css";

interface GNBProps {
  menuData: MenuItem[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isScrolled: boolean;
}

const GNB: React.FC<GNBProps> = ({
  menuData,
  onMouseEnter,
  onMouseLeave,
  isScrolled,
}) => {
  return (
    <ul
      className={`${styles.gnb} ${isScrolled ? styles.scrolled : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {menuData.map((menu, index) => (
        <li key={index}>
          <Link href={menu.href} prefetch={true}>
            {menu.label}
          </Link>
          {menu.subMenu && (
            <ul className={styles.subMenu}>
              {menu.subMenu.map((subItem, subIndex) => (
                <li key={subIndex}>
                  <Link href={subItem.href} prefetch={false}>
                    {subItem.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
};

export default GNB;
