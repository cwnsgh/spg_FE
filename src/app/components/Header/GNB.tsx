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
  isMenuOpen?: boolean;
}

const GNB: React.FC<GNBProps> = ({
  menuData,
  onMouseEnter,
  onMouseLeave,
  isScrolled,
  isMenuOpen = false,
}) => {
  if (isMenuOpen) {
    return null;
  }

  return (
    <ul
      className={`${styles.gnb} ${isScrolled ? styles.scrolled : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {menuData.map((menu, index) => (
        <li key={index}>
          <Link
            href={menu.href}
            prefetch={true}
            onClick={(e) => {
              // 서브메뉴가 열려있을 때도 메인 링크 클릭 허용
              e.stopPropagation();
            }}
          >
            {menu.label}
          </Link>
          {menu.subMenu && (
            <ul className={styles.subMenu}>
              {menu.subMenu.map((subItem, subIndex) => (
                <li key={subIndex}>
                  <Link
                    href={subItem.href}
                    prefetch={false}
                    onClick={(e) => {
                      // 링크 클릭 시 정상적으로 이동하도록 이벤트 전파 허용
                      // stopPropagation 제거하여 링크가 정상 작동하도록 함
                    }}
                  >
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
