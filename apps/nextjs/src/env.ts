import { authEnv } from "@nucleus/auth/env";
import { cacheEnv } from "@nucleus/cache/env";
import { dbEnv } from "@nucleus/db/env";
import { emailEnv } from "@nucleus/email/env";
import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod/v4";

export const env = createEnv({
  extends: [authEnv(), vercel(), dbEnv(), cacheEnv(), emailEnv()],
  shared: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development").optional(),
  },

  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    // Add Vercel environment variables with optional fallbacks
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_BASE_URL: z.url(),
  },

  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
