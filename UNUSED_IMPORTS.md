# import 되지 않는 모듈 (정적 스캔)

`node scripts/find-unused-modules.mjs` 로 생성·검증한 목록입니다.

- **포함**: `src` 이하 `.ts` / `.tsx` 중, 다른 파일의 `import` / `export … from` / `import()` 로 **해석되지 않는** 경로
- **제외**: Next 라우트 엔트리(`page`, `layout`, `route`, `loading`, `error`, `not-found`, `template`, `default` 등), `middleware.ts`, `instrumentation*.ts`
- **주의**: 동적 경로 조합, CSS만 연결, 런타임 `eval` 등은 스크립트가 잡지 못할 수 있습니다. 삭제 전에 한 번 더 검색해 주세요.

## 목록 (12)

| 경로 | 비고 |
|------|------|
| `src/app/aboutUs/components/sections/History.tsx` | 플레이스홀더. 실제 연혁은 `CompanyHistory.tsx` 사용 |
| `src/app/components/Navigation.tsx` | 구버전 상단바. 현재는 `Header/Header.tsx` |
| `src/app/components/PageHeader.tsx` | 빈 스텁 |
| `src/app/customersupport/components/InquirySection/InquiryFilter.tsx` | UI 스텁 |
| `src/app/customersupport/components/InquirySection/InquiryTable.tsx` | 목업 테이블 스텁 |
| `src/app/customersupport/components/InquirySection/InquiryTypeTabs.tsx` | 탭 스텁 |
| `src/app/marketing/components/GlobalNetwork/BusinessLocationList.tsx` | 빈 컨테이너 스텁 |
| `src/app/marketing/components/GlobalNetwork/BusinessTypeTabs.tsx` | 빈 컨테이너 스텁 |
| `src/app/marketing/components/GlobalNetwork/NetworkMap.tsx` | 빈 컨테이너 스텁 |
| `src/app/products/components/ProductCard.tsx` | `ProductGrid`가 자체 카드 마크업 사용 |
| `src/app/products/components/ProductSidebar.tsx` | 레거시 사이드바. 목록 페이지에서 미사용 |
| `src/data/productData.ts` | 레거시. 제품 데이터는 `src/app/products/data/productData.ts` 사용 |

스크립트 재실행:

```bash
node scripts/find-unused-modules.mjs
```

---

# 합칠 수 있는 컴포넌트 후보

**이미 쓰이는 코드** 기준으로, 역할이 비슷해 한 파일·한 컴포넌트로 묶을 수 있는 것들입니다.

## 1. IR 게시판 래퍼 (우선순위 높음)

아래는 각각 **한 줄짜리 설정만 다른** `IRBoardList` / `IRBoardDetail` 래퍼입니다.

- `IRAnnouncement.tsx`, `IRContent.tsx`, `IREvent.tsx` → 예: `<IRBoardList boardTable="…" detailBasePath="…" title="…" />` 한 곳에서 호출
- `IRAnnouncementDetail.tsx`, `IRContentDetail.tsx`, `IREventDetail.tsx` → 예: `<IRBoardDetail boardTable="…" listPath="…" … />` 로 통합

**효과**: 파일 수 감소, 보드 테이블 상수를 `IRTabs` 근처 한곳에서 관리하기 쉬움.

## 2. 마케팅 GlobalNetwork 빈 스텁 3종

- `BusinessTypeTabs.tsx`, `NetworkMap.tsx`, `BusinessLocationList.tsx` — 모두 빈 `div` 스텁

**선택**: (A) 사용 계획 없으면 **삭제**가 가장 깔끔함. (B) 당분간 보관이면 `GlobalNetworkPlaceholder.tsx` 하나에 `kind` prop으로 합치기.

## 3. 문의 섹션 스텁 3종

- `InquiryTypeTabs.tsx`, `InquiryTable.tsx`, `InquiryFilter.tsx` — 미연결

**선택**: (A) 삭제. (B) `InquirySectionStubs.tsx` 등으로 합쳐 두고 나중에 `InquirySection`에 연결.

## 4. 구버전 Navigation 묶음

- `Navigation.tsx`가 `ProductInquiryButton`, `MobileMenu`, `SearchButton`만 사용하고, `Navigation` 자체가 미사용

**선택**: 전부 **삭제**해도 현재 빌드에는 영향 없음. (디자인 복구 시 `Header`와 통합 검토.)

## 5. 제품 `ProductCard` vs `ProductGrid`

- 그리드 안에 카드 마크업이 인라인으로 있음

**선택**: 카드 UI를 `ProductCard`로 빼서 `ProductGrid`가 import하도록 **역으로 합치기**(재사용·스타일 일원화). 지금은 `ProductCard` 파일만 고아 상태.

## 6. `src/data/productData.ts` vs `src/app/products/data/productData.ts`

- 이름만 비슷하고 **역할이 다름**. 고아 파일은 삭제하거나, 진짜 공용 타입·목업만 `src/data`로 옮기고 한쪽으로 통일하는 편이 유지보수에 유리함.

## 7. 국내 / 해외 시설 (`DomesticFacilities` / `OverseasFacilities`)

- 둘 다 가맹 API·URL 정규화·지도 등 패턴이 비슷함

**선택**: 공통 훅(`useFranchiseList` 등)이나 소형 프레젠테이션 컴포넌트로 **로직만 분리**하는 정도를 권장. UI를 한 파일로 합치면 파일이 길어져 가독성이 떨어질 수 있음.

---

요약: **삭제만 해도 되는 고아 12개**는 위 목록과 같고, **합치기 가치가 큰 것**은 특히 **IR 래퍼 6개**와 **제품 카드·그리드 정리**, **이름이 겹치는 productData 정리**입니다.
