import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export function authEnv() {
  return createEnv({
    server: {
      AUTH_SECRET:
        process.env.NODE_ENV === "production" ? z.string().min(1) : z.string().min(1).optional(),
      NODE_ENV: z.enum(["development", "production"]).optional(),
      GOOGLE_CLIENT_ID: z.string().min(1),
      GOOGLE_CLIENT_SECRET: z.string().min(1),
      // Comma-separated emails granted the super_admin role on signup / via seed.
      SUPER_ADMIN_EMAILS: z.string().optional(),
    },
    runtimeEnv: process.env,
    skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}
