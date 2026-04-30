/**
 * 헤더 스크롤·호버 상태 훅.
 * 사용처: `components/Header/Header.tsx` — 스크롤 시 헤더 스타일 전환.
 */
'use client';

import { useEffect, useState, useRef } from 'react';

export const useHeaderScroll = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const updateHeaderClass = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 0 || isHovering);
    };

    // 초기 상태 확인
    updateHeaderClass();

    // 스크롤 이벤트
    window.addEventListener('scroll', updateHeaderClass, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateHeaderClass);
    };
  }, [isHovering]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    setIsScrolled(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setIsScrolled(scrollTop > 0);
  };

  return {
    isScrolled,
    headerRef,
    handleMouseEnter,
    handleMouseLeave,
  };
};

