import "server-only";

import { initAuth } from "@nucleus/auth";
import { headers } from "next/headers";
import { cache } from "react";

import { env } from "@/env";

export const auth = initAuth({
  baseUrl: env.NEXT_PUBLIC_BASE_URL,
  productionUrl: env.NEXT_PUBLIC_BASE_URL,
  secret: env.AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  superAdminEmails: env.SUPER_ADMIN_EMAILS?.split(",")
    .map((email) => email.trim())
    .filter(Boolean),
});

export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));
