import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ENGINE_ID: process.env.ENGINE_ID,
  }
};

export default nextConfig;
