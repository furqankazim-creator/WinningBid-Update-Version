import type { NextConfig } from "next";

const BACKEND_URL = (process.env.BACKEND_API_URL || process.env.STANDARDS_API_URL || "http://127.0.0.1:4005").replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow CI/verification builds to run alongside a dev server: BUILD_DIR=.next-build npx next build
  distDir: process.env.BUILD_DIR || ".next",
  async rewrites() {
    return [
      {
        source: "/api/standards/:path*",
        destination: `${BACKEND_URL}/api/standards/:path*`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${BACKEND_URL}/api/auth/:path*`,
      },
      {
        source: "/api/data/:path*",
        destination: `${BACKEND_URL}/api/data/:path*`,
      },
      {
        source: "/api/org/:path*",
        destination: `${BACKEND_URL}/api/org/:path*`,
      },
      {
        source: "/api/platform/:path*",
        destination: `${BACKEND_URL}/api/platform/:path*`,
      },
      {
        source: "/api/ocr/:path*",
        destination: `${BACKEND_URL}/api/ocr/:path*`,
      },
    ];
  },
};

export default nextConfig;
