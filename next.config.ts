import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow CI/verification builds to run alongside a dev server: BUILD_DIR=.next-build npx next build
  distDir: process.env.BUILD_DIR || ".next",
  async rewrites() {
    return [
      {
        source: "/api/standards/:path*",
        destination: `${process.env.STANDARDS_API_URL || "http://localhost:4005"}/api/standards/:path*`,
      },
    ];
  },
};

export default nextConfig;
