// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * `next dev`에서 브라우저가 쓰는 주소는 `/api/proxy/...`(동일 출처)뿐입니다.
 * 아래 origin은 **Next가 rewrites로 전달할 실제 백엔드**이며, 브라우저에 직접 노출되지 않습니다.
 * 개발만: `NEXT_PUBLIC_DEV_BACKEND_ORIGIN`으로 전달 대상을 바꿀 수 있음.
 */
const fallbackBackendOrigin = (
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.trim() ||
  (isDev ? process.env.NEXT_PUBLIC_DEV_BACKEND_ORIGIN?.trim() : "") ||
  "https://spg.co.kr"
).replace(/\/+$/, "");

const backendOrigin = fallbackBackendOrigin;

/** rewrite `destination` 계산 — `async rewrites()` 안에서도 동일 식 사용 */
function resolveBackendApiOriginForRewrites(): string {
  const apiBaseEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";
  if (/^https?:\/\//i.test(apiBaseEnv)) {
    return apiBaseEnv.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }
  return backendOrigin;
}

/** `next/image` remotePatterns — 백엔드 origin의 프로토콜·호스트를 그대로 따름(http 로컬 포함) */
const backendUrlForImages = (() => {
  try {
    return new URL(backendOrigin);
  } catch {
    return new URL("https://spg.co.kr");
  }
})();

const imageProtocol =
  backendUrlForImages.protocol === "https:" ? ("https" as const) : ("http" as const);

const extraImageHosts = (process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTNAMES ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const sharedImages: NonNullable<NextConfig["images"]> = {
  remotePatterns: [
    {
      protocol: imageProtocol,
      hostname: backendUrlForImages.hostname,
      pathname: "/data/**",
    },
    ...extraImageHosts.map((hostname) => ({
      protocol: "https" as const,
      hostname,
      pathname: "/data/**" as const,
    })),
  ],
};
const sharedExperimental: NextConfig["experimental"] = {
  /**
   * 개발 프록시(`/api/proxy`)로 전달되는 multipart body 허용치를 상향.
   * 기본 10MB로는 제품 자료 업로드 시 `Request body exceeded 10MB`가 발생.
   */
  middlewareClientMaxBodySize: "200mb",
};

/**
 * - 프로덕션 빌드: `output: "export"` → `out/` (정적 호스팅). rewrites 없음.
 * - 개발(`next dev`): rewrites로 `/api/proxy` → 백엔드 (동일 출처라 CORS·세션 이슈 완화).
 */
const nextConfig: NextConfig = isDev
  ? {
      experimental: sharedExperimental,
      images: {
        ...sharedImages,
        /**
         * 개발 시 `/_next/image`가 원격 파일을 받아 최적화하는 과정에서 500이 나는 경우가 있음
         * (Sharp/원격 응답/SSL 등). `unoptimized`면 `<img src="원본 URL">`로 바로 표시됨.
         * 프로덕션 정적 빌드는 아래 분기에서 이미 `unoptimized: true`.
         */
        unoptimized: true,
      },
      async rewrites() {
        const backendApiOrigin = resolveBackendApiOriginForRewrites();
        return [
          {
            source: "/api/proxy/:path*",
            destination: `${backendApiOrigin}/api/:path*`,
          },
          /**
           * 카페24 정적 PDF는 `X-Frame-Options: sameorigin`이라 다른 도메인 iframe에 못 넣음.
           * 개발 시 iframe `src`를 동일 출처로 맞추기 위해 `/data/...` 등을 백엔드로 프록시.
           */
          {
            source: "/__backend_asset/:path*",
            destination: `${backendOrigin}/:path*`,
          },
        ];
      },
    }
  : {
      output: "export",
      experimental: sharedExperimental,
      images: {
        unoptimized: true,
        ...sharedImages,
      },
    };

export default nextConfig;
