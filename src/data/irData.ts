/**
 * 메인 홈 IR 카드용 폴백 데이터(주가·요약 등). 사용처: `home/.../BrandInfo/IRInfo.tsx`.
 * - 재무·IR공고 카드는 API 연동 후에도 로드 실패 시 폴백으로 사용됩니다.
 * - 주가: 현재 백엔드 시세 API 없음 → 메인 IR 카드에만 표시용으로 유지합니다.
 */
import { StockInfo, FinancialInfo, IRInfo } from '../types';

export const stockInfo: StockInfo = {
  currentPrice: '193,091',
  change: '550',
  changeRate: '-2.07%',
  tradingVolume: '98,258',
};

export const financialInfo: FinancialInfo = {
  revenue: '416,334',
  assets: '365,091',
  capital: '193,091',
};

export const irInfo: IRInfo = {
  title: '제34기(2024사업연도)<br>결산공고',
  date: '2025-03-26',
};




