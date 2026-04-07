// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * - 프로덕션 빌드: `output: "export"` → `out/` (정적 호스팅). rewrites 없음.
 * - 개발(`next dev`): rewrites로 `/api/proxy` → 백엔드 (동일 출처라 CORS·세션 이슈 완화).
 */
const nextConfig: NextConfig = isDev
  ? {
      async rewrites() {
        return [
          {
            source: "/api/proxy/:path*",
            destination: "https://dustinsub.mycafe24.com/api/:path*",
          },
        ];
      },
    }
  : {
      output: "export",
      images: { unoptimized: true },
    };

export default nextConfig;
