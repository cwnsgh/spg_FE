// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // 1. 브라우저에서 사용할 가짜 주소
        source: "/api/proxy/:path*",
        // 2. 실제로 데이터가 있는 진짜 주소
        destination: "https://dustinsub.mycafe24.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
