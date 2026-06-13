---
name: auth-patterns
description: Defines authentication and authorization patterns using better-auth. Use when working with user sessions, login, sign-up, or route protection.
---

# Authentication Guidelines

## Authentication Stack

This project uses **better-auth** for authentication with the following features:

- Email/password authentication
- Google OAuth integration
- Session management with cookies
- Database adapter with Drizzle ORM
- Cross-platform support (Next.js + Expo)

## Auth Configuration Pattern

### Package-Level Configuration

Define auth initialization in [packages/auth/src/index.ts](mdc:packages/auth/src/index.ts):

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { expo } from "@better-auth/expo";
import { oAuthProxy } from "better-auth/plugins";

export function initAuth(options: InitAuthOptions) {
  return betterAuth({
    appName: "Nucleus",
    emailAndPassword: { enabled: true },
    database: drizzleAdapter(db, { provider: "pg" }),
    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: options.socialProviders.google.clientId,
        clientSecret: options.socialProviders.google.clientSecret,
      },
    },
    plugins: [
      oAuthProxy({
        currentURL: options.baseUrl,
        productionURL: options.productionUrl,
      }),
      expo(),
      nextCookies(), // Must be last plugin
    ],
  });
}
```

### App-Level Server Configuration

Initialize auth in [apps/nextjs/src/auth/server.ts](mdc:apps/nextjs/src/auth/server.ts):

```typescript
import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { initAuth } from "@nucleus/auth";

export const auth = initAuth({
  baseUrl: getBaseUrl(),
  productionUrl: `https://${env.NEXT_PUBLIC_BASE_URL}`,
  secret: env.AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);
```

### Client-Side Configuration

Create auth client in [apps/nextjs/src/auth/client.ts](mdc:apps/nextjs/src/auth/client.ts):

```typescript
import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut } = createAuthClient();
```

## Authentication Patterns

### Login Implementation

```typescript
// Email/Password Login
await signIn.email({
  email: data.email,
  password: data.password,
  callbackURL: "/dashboard",
});

// Social Login
await signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
});
```

### Sign Up Implementation

```typescript
await signUp.email({
  email: data.email,
  password: data.password,
  name: data.name,
  callbackURL: "/dashboard",
});
```

### Sign Out Implementation

```typescript
await signOut({
  fetchOptions: {
    onSuccess: () => {
      router.push("/sign-in");
    },
  },
});
```

## Session Management

### Server-Side Session Access

```typescript
import { getSession } from "~/auth/server";

export default async function ProtectedPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/sign-in");
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

### Client-Side Session Access

```typescript
import { useSession } from "better-auth/react";

export function UserProfile() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Please Login</div>;

  return <div>Hello, {session.user.name}!</div>;
}
```

## Authorization Patterns

### tRPC Protected Procedures

```typescript
import { TRPCError } from "@trpc/server";

export const protectedProcedure = publicProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource",
      });
    }

    return next({
      ctx: {
        session: ctx.session,
        user: ctx.session.user,
      },
    });
  }
);
```

### Route Protection with Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await getSession();
  
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (session && request.nextUrl.pathname.startsWith("/sign-in")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
```

## Database Schema Integration

Better-auth automatically creates required tables when using Drizzle adapter:

- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth account linking
- `verification` - Email verification tokens

## Environment Variables

Required environment variables for authentication:

```bash
# Required for production
AUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Vercel deployment (auto-populated)
VERCEL_URL=your-preview-url
VERCEL_PROJECT_PRODUCTION_URL=your-production-url
```

## Error Handling

```typescript
try {
  await signIn.email({
    email: data.email,
    password: data.password,
  });
} catch (error) {
  if (Error.isError(error)) {
    // Handle specific auth errors
    if (error.message.includes("Invalid credentials")) {
      setError("Invalid email or password");
    } else {
      setError("An unexpected error occurred");
    }
  }
}
```

## Cross-Platform Considerations

- Use `expo()` plugin for React Native compatibility
- Configure `trustedOrigins: ["expo://"]` for mobile apps
- Use OAuth proxy for development environments
- Ensure consistent session handling across platforms

## Security Best Practices

- Always validate sessions on server-side
- Use HTTPS in production
- Implement proper CSRF protection
- Set secure cookie options
- Validate user permissions for protected resources
- Use environment-specific secrets
