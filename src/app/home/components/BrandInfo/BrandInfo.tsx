/**
 * 브랜드 정보 섹션 컴포넌트
 * - 글로벌 네트워크 (GlobalNetwork)
 * - IR 정보 (IRInfo)
 */
'use client';

import React from 'react';
import GlobalNetwork from './GlobalNetwork';
import IRInfo from './IRInfo';

const BrandInfo: React.FC = () => {
  return (
    <section className="section-04 brand-info">
      <GlobalNetwork />
      <IRInfo />
    </section>
  );
};

export default BrandInfo;

