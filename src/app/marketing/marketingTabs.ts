/**
 * 마케팅 페이지 URL 쿼리 `tab` 값과 상수 매핑.
 * 사용처: `marketing/page.tsx`, `MainTabs.tsx`.
 */
export const MARKETING_TAB_VALUES = {
  globalNetwork: "global-network",
  customers: "customers",
} as const;

export type MarketingTabValue =
  (typeof MARKETING_TAB_VALUES)[keyof typeof MARKETING_TAB_VALUES];

export function resolveMarketingTab(tabParam: string | null): MarketingTabValue {
  if (tabParam === "1" || tabParam === MARKETING_TAB_VALUES.customers) {
    return MARKETING_TAB_VALUES.customers;
  }

  return MARKETING_TAB_VALUES.globalNetwork;
}
