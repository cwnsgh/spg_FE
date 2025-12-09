/**
 * 햄버거 메뉴 상태 관리 훅
 */
'use client';

import { useState, useEffect } from 'react';

export const useHamburgerMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // 메뉴가 열려있을 때 body 스크롤 방지
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return {
    isMenuOpen,
    toggleMenu,
    closeMenu,
  };
};




