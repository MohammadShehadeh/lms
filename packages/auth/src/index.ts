import { expo } from "@better-auth/expo";
import { db } from "@nucleus/db/client";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { customSession, oAuthProxy } from "better-auth/plugins";
import { assignSignupRole, loadUserRbac } from "./rbac";

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
  /** Emails granted the super_admin role on signup. */
  superAdminEmails?: string[];
}

export function initAuth(options: InitAuthOptions) {
  const superAdminEmails = (options.superAdminEmails ?? []).map((email) =>
    email.trim().toLowerCase()
  );

  const config = {
    appName: "Nucleus",
    rateLimit: {
      enabled: true,
      max: 10,
      window: 10,
    },
    databaseHooks: {
      user: {
        create: {
          // Assign the default (or super_admin) role to every new user.
          after: async (createdUser) => {
            await assignSignupRole(createdUser.id, createdUser.email, superAdminEmails);
          },
        },
      },
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
    user: {
      additionalFields: {
        // Surfaces `user.roleId` on the session so RBAC enrichment can look up
        // the role by id (cached) without a separate user query. Set server-side
        // via the signup hook / users.setRole, never from client input.
        roleId: { type: "string", required: false, input: false },
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
      // Enrich the session with the user's role + effective permissions so
      // proxy, RSC, and tRPC all read authorization from `session.user`.
      customSession(async ({ user, session }) => {
        const roleId = (user as { roleId?: string | null }).roleId ?? null;
        const rbac = await loadUserRbac(roleId);
        return { user: { ...user, ...rbac }, session };
      }),
      nextCookies(), // Must be last plugin
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
