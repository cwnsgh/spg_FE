# 정적 빌드(`out/`)를 자체 서버에 옮길 때

`next.config.ts`에서 프로덕션은 `output: "export"`라서 `npm run build` 결과물은 **`out/` 폴더**입니다. 이 폴더를 카페24 웹호스팅, nginx, Apache 등 **어디에 올리든** 동작 원리는 같습니다.  
**반드시 코드를 고쳐야 하는 것**과 **서버 설정만으로 되는 것**을 나눴습니다.

---

## 1. 코드를 안 고치고 할 수 있는 것 (권장)

빌드 전 **환경 변수**만 맞추면, 같은 저장소 그대로 두고 배포 환경만 바꿀 수 있습니다.

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_API_BASE_URL` | 브라우저에서 호출하는 API 베이스. 예: `https://당신백엔드도메인/api` (끝 슬래시 없이) |
| `NEXT_PUBLIC_BACKEND_ORIGIN` | `API_BASE_URL`이 상대경로(`/api/proxy`)일 때만 자산 origin 추론에 사용. 절대 URL API를 쓰면 보통 불필요 |
| `NEXT_PUBLIC_BACKEND_ASSET_PROXY_PREFIX` | 프론트와 API/파일 서버 도메인이 **다를 때** CORS·PDF 이슈 회피. 값 예: `/__backend_asset` |
| `BUILD_API_BASE_URL` | **`next build` 할 때만** 쓰임. `generateStaticParams`가 상품 id 목록을 API에서 가져올 때 사용 (`products/[id]/page.tsx`). 빌드 머신에서 백엔드에 네트워크로 닿아야 함 |

정적 사이트는 **빌드 시점**에 `NEXT_PUBLIC_*` 값이 JS에 박입니다. 서버를 옮기면 **그 환경에서 다시 `npm run build`** 하는 것이 안전합니다.

---

## 2. 웹 서버에서 `vercel.json` 대신 할 일

지금 저장소의 `vercel.json`은 Vercel 전용입니다. **자체 서버**에서는 같은 역할을 **리버스 프록시 규칙**으로 넣습니다.

### `/__backend_asset` (파일·PDF CORS 회피)

`NEXT_PUBLIC_BACKEND_ASSET_PROXY_PREFIX=/__backend_asset` 를 쓰는 경우, 브라우저는  
`https://프론트도메인/__backend_asset/data/...` 로만 요청합니다. 서버가 이를 백엔드로 넘겨야 합니다.

**nginx 예시**

```nginx
location /__backend_asset/ {
  proxy_pass https://dustinsub.mycafe24.com/;
  proxy_ssl_server_name on;
}
```

백엔드 호스트가 바뀌면 `proxy_pass` URL만 바꿉니다.

### (선택) `/api/proxy` — 로컬 개발과 동일하게 쓰려면

프로덕션에서 `NEXT_PUBLIC_API_BASE_URL=/api/proxy` 로 두려면, 빌드된 사이트를 서빙하는 쪽에 다음과 같은 프록시가 필요합니다.

```nginx
location /api/proxy/ {
  proxy_pass https://dustinsub.mycafe24.com/api/;
  proxy_ssl_server_name on;
}
```

보통은 **`NEXT_PUBLIC_API_BASE_URL`에 백엔드 전체 URL**을 직접 넣는 편이 단순합니다 (`/api/proxy` 없이).

---

## 3. 코드 안에 박혀 있어서, 백엔드 도메인이 바뀌면 수정할 파일

아래는 **도메인/호스트를 바꿀 때** 검토할 위치입니다. 환경 변수로 다 안 빠져 있습니다.

| 파일 | 내용 |
|------|------|
| `next.config.ts` | `backendImageHost` (`next/image` remotePatterns), 개발용 `rewrites`의 `destination` URL |
| `vercel.json` | Vercel 배포 시에만 사용. 자체 서버면 **nginx 등으로 대체**하고, 저장소의 destination URL은 참고용 |
| `src/api/config.ts` | `DEFAULT_API_BASE_URL`, `DEFAULT_BACKEND_ORIGIN` 기본값 (환경 변수로 덮어쓰면 빌드 결과에는 반영됨) |

백엔드가 항상 `NEXT_PUBLIC_*`만 쓰게 정리하면 수정 빈도를 줄일 수 있습니다. 지금도 런타임 API/자산 URL은 대부분 env 기준입니다.

---

## 4. 빌드·배포 순서 요약

1. `.env.production` 또는 CI 환경에 `NEXT_PUBLIC_*`, 필요 시 `BUILD_API_BASE_URL` 설정  
2. `npm ci` → `npm run build`  
3. `out/` 전체를 웹 루트에 업로드  
4. 위 **nginx(또는 동등) 규칙**으로 `/__backend_asset` 프록시 설정 (해당 env를 쓸 때만 필수)

---

## 5. 자주 하는 질문

**Q. 프론트와 백엔드를 같은 도메인/같은 서버에 둘 예정인데?**  
→ 브라우저 기준으로 **같은 origin**이면 PDF·API CORS 이슈가 줄어듭니다. 그래도 API 경로를 `/api` 서브패스로 쓰는지에 따라 프록시 구성만 맞추면 됩니다.

**Q. `vercel.json`을 삭제해야 하나?**  
→ 자체 서버만 쓰면 **필수는 아님**. Vercel에도 올릴 거면 그대로 두어도 됩니다.

**Q. 관리자 화면·로그인도 정적에서 되나?**  
→ 화면은 정적이어도 되고, 데이터는 전부 `NEXT_PUBLIC_API_BASE_URL`로 가는 **백엔드**에 의존합니다. 백엔드 CORS·쿠키 도메인 설정은 별도로 맞춰야 합니다.

---

## 6. 관련 소스 위치 (참고)

- API/자산 URL: `src/api/config.ts`
- PDF 미리보기·동일 출처 프록시: `src/app/products/utils/pdfPreviewUrl.ts`, `ProductDetailClient.tsx`
- 빌드 시 상품 id 수집: `src/app/(site)/products/[id]/page.tsx` (`BUILD_API_BASE_URL`)
- 개발 전용 리라이트: `next.config.ts` (`isDev` 분기)

이 문서는 배포 방식이 바뀔 때마다 **환경 변수·웹 서버 규칙**을 위주로 점검하면 됩니다.
