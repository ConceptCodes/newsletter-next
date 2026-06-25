import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@newsletter/config", "@newsletter/db", "@newsletter/ui"],
};

export default config;
