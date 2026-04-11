import { expo } from "@better-auth/expo";
import { db } from "@nucleus/db/client";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { oAuthProxy } from "better-auth/plugins";

interface InitAuthOptions {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;
  socialProviders: {
    google: {
      clientId: string;
      clientSecret: string;
    };
  };
}

export function initAuth(options: InitAuthOptions) {
  const config = {
    appName: "Nucleus",
    rateLimit: {
      enabled: true,
      max: 10,
      window: 10,
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      autoSignIn: false,
    },
    account: {
      accountLinking: {
        trustedProviders: ["google"],
      },
    },
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    socialProviders: {
      /**
       * Google social provider https://www.better-auth.com/docs/authentication/google
       */
      google: {
        prompt: "select_account",
        clientId: options.socialProviders.google.clientId,
        clientSecret: options.socialProviders.google.clientSecret,
      },
    },
    plugins: [
      oAuthProxy({
        productionURL: options.productionUrl,
      }),
      expo(),
      nextCookies(),
    ],
    trustedOrigins: ["expo://"],
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
