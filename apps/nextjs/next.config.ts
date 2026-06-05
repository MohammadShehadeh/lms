import "./src/env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@nucleus/api",
    "@nucleus/auth",
    "@nucleus/db",
    "@nucleus/ui",
    "@nucleus/validators",
    "@t3-oss/env-nextjs",
    "@t3-oss/env-core",
  ],

  // images
  images: {
    remotePatterns: [{ protocol: "https", hostname: "mohammadshehadeh.com" }],
  },

  /** We already do linting and typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },

  /** Output a standalone server for Docker */
  output: "standalone",
};

export default nextConfig;
