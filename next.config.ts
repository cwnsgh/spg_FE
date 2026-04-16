// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/** API·`toBackendAssetUrl`로 쓰는 백엔드 정적 파일 호스트 (`next/image` 허용 목록) */
const backendImageHost = "dustinsub.mycafe24.com";

const sharedImages: NonNullable<NextConfig["images"]> = {
  remotePatterns: [
    {
      protocol: "https",
      hostname: backendImageHost,
      pathname: "/data/**",
    },
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
        return [
          {
            source: "/api/proxy/:path*",
            destination: "https://dustinsub.mycafe24.com/api/:path*",
          },
          /**
           * 카페24 정적 PDF는 `X-Frame-Options: sameorigin`이라 다른 도메인 iframe에 못 넣음.
           * 개발 시 iframe `src`를 동일 출처로 맞추기 위해 `/data/...` 등을 백엔드로 프록시.
           */
          {
            source: "/__backend_asset/:path*",
            destination: "https://dustinsub.mycafe24.com/:path*",
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
