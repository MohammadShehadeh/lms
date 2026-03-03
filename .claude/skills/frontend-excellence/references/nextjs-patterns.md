# Next.js 16 App Router Patterns

This project uses Next.js 16 with React 19, App Router, and React Compiler.

## Route Organization

### File Structure

```
app/
├── (games)/                  # Route group for games
│   ├── wordle-unlimited/
│   │   └── page.tsx
│   └── ...
├── (tools)/                  # Route group for utilities
│   ├── password-generator/
│   │   └── page.tsx
│   └── ...
├── (markdown)/               # Route group for MDX content
│   ├── blog/
│   │   ├── [slug]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   └── ...
├── about/
│   └── page.tsx
├── api/                      # API routes
│   ├── cors/
│   │   └── route.ts
│   └── notifications/
│       └── route.ts
├── games/
│   └── page.tsx
├── blog/
│   └── page.tsx
├── contact/
│   └── page.tsx
├── tools/
│   └── page.tsx
├── projects/
│   └── page.tsx
├── layout.tsx                # Root layout
├── manifest.ts               # PWA manifest
├── not-found.tsx             # 404 page
├── page.tsx                  # Home page
├── robots.ts                 # SEO robots
└── sitemap.ts                # SEO sitemap
```

## Server vs Client Components

### Default Server Components

```tsx
// app/page.tsx (Server Component - default)
import type { Metadata } from 'next';
import { Hero } from '@/components/hero';
import { Container } from '@/components/layout/container';

export const metadata: Metadata = {
  title: 'Mohammad Shehadeh - Senior Frontend Engineer',
  description: '...',
};

export default function Home() {
  return (
    <>
      <Container variant="section" asChild>
        <section>
          <Hero />
        </section>
      </Container>
    </>
  );
}
```

### Client Components

Use 'use client' only when you need:
- Event handlers (onClick, onChange, etc.)
- React hooks (useState, useEffect, useScroll, etc.)
- Browser APIs (localStorage, window, etc.)
- Motion library animations
- Context providers

```tsx
// components/hero.tsx (Client Component)
'use client';

import Link from 'next/link';
import { ViewTransition } from 'react';
import { MotionDiv } from '@/components/motion';
import { useScroll } from '@/providers/scroll-provider';

export const Hero = () => {
  const { scrollToSection } = useScroll();

  return (
    <div className="relative content-center text-center">
      <MotionDiv
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {/* Interactive content */}
      </MotionDiv>
    </div>
  );
};
```

### Composition Pattern

Keep Client Components small and composed within Server Components:

```tsx
// app/page.tsx (Server Component)
import { Hero } from '@/components/hero';
import { Container } from '@/components/layout/container';
import { ScrollProvider } from '@/providers/scroll-provider';

export default function Home() {
  return (
    <>
      <ScrollProvider>
        <Container className="min-h-[calc(100vh-var(--site-header-height))]" asChild>
          <section>
            <Hero /> {/* Client component for interactivity */}
          </section>
        </Container>
      </ScrollProvider>
      
      <Container variant="section" asChild>
        <section>
          <WhatIDo /> {/* Can be server or client component */}
        </section>
      </Container>
    </>
  );
}
```

## React 19 ViewTransition

React 19 introduces native View Transitions API support:

```tsx
// components/hero.tsx
'use client';

import { ViewTransition } from 'react';

export const Hero = () => (
  <Title size="h1" className="max-w-3xl mx-auto">
    Hi, I'm{' '}
    <ViewTransition name="author-name">
      Moh<span className="hidden sm:inline">ammad</span> Shehadeh
    </ViewTransition>{' '}
    a <span className="text-primary">Frontend</span> engineer
  </Title>
);
```

ViewTransition creates smooth animated transitions between page navigations for matching elements.

## API Routes

### Route Handlers

```tsx
// app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import { getNotifications } from '@/services/notifications';

export async function GET() {
  const response = NextResponse.json(await getNotifications(), { status: 200 });
  response.headers.set('Cache-Control', `public, max-age=${1800}`); // 30 minutes
  return response;
}
```

### API with Validation

```tsx
// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  message: z.string().min(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    
    // Process the validated data
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Root Layout

```tsx
// app/layout.tsx
import '@/styles/global.css';

import { MotionConfig } from 'motion/react';
import Script from 'next/script';
import type React from 'react';
import { BackgroundEffect } from '@/components/background-effect';
import { Footer } from '@/components/layout/footer';
import { SiteHeader } from '@/components/site-header';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/providers/theme-provider';
import { geist, playfairDisplay } from '~/next.fonts';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        
        <script
          id="user-json"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'http://schema.org/',
              '@type': 'Person',
              name: 'Mohammad Shehadeh',
              // ... structured data
            }),
          }}
        />

        {/* NoScript fallback for animations */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `
              <style>
                [style] {
                  opacity: 1 !important;
                  transform: initial !important;
                  transition: initial !important;
                  animation: initial !important;
                }
              </style>
            `,
          }}
        />

        <Script src="https://www.googletagmanager.com/gtag/js" strategy="afterInteractive" />
      </head>
      <body className={cn(geist.className, playfairDisplay.variable, 'overflow-x-hidden antialiased relative')}>
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
            {/* Skip link for accessibility */}
            <Button
              type="button"
              variant="outline"
              className="not-focus:sr-only transition-none duration-0 absolute left-4 top-4 z-50"
              asChild
            >
              <a href="#main">Skip to main content</a>
            </Button>
            
            <SiteHeader />
            <main id="main">
              {children}
            </main>
            <Footer />
            <BackgroundEffect />
          </ThemeProvider>
        </MotionConfig>

        <Toaster />
      </body>
    </html>
  );
}
```

## 404 Not Found Page

```tsx
// app/not-found.tsx
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { LazyImage } from '@/components/lazy-image';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <>
      <title>404 | Mohammad Shehadeh</title>
      <main className="relative flex min-h-[600px] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
        <div className="relative max-w-3xl">
          <div className="flex items-center justify-center text-[120px] font-bold text-primary/10 sm:text-[160px]">
            <span>4</span>
            <LazyImage
              classNameContainer="rounded-full border-12 border-primary/10 size-24 sm:size-36"
              src="/images/404/side-eye-dog.jpeg"
              alt="Suspicious dog giving side-eye"
              width={400}
              height={400}
            />
            <span>4</span>
          </div>
        </div>

        <div className="mt-8 max-w-xl px-4">
          <h1 className="bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-3xl font-bold text-transparent">
            Hmm... Suspicious
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            This page you're looking for? Yeah... it doesn't exist.
          </p>
        </div>

        <Button size="lg" asChild>
          <Link href="/" className="mt-8">
            <Icons.home className="size-4" />
            Go Back Home
          </Link>
        </Button>
      </main>
    </>
  );
}
```

## Metadata and SEO

### Static Metadata

```tsx
// app/page.tsx
import type { Metadata } from 'next';
import { BASE_URL } from '@/constants/urls';

export const metadata: Metadata = {
  title: 'Mohammad Shehadeh - Senior Frontend Engineer',
  description: 'Senior Frontend Engineer with 6+ years of expertise...',
  keywords: [
    'senior frontend engineer',
    'react developer',
    'typescript expert',
    // ...
  ],
  authors: [{ name: 'Mohammad Shehadeh', url: BASE_URL }],
  creator: 'Mohammad Shehadeh',
  publisher: 'Mohammad Shehadeh',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Mohammad Shehadeh',
    title: 'Mohammad Shehadeh - Senior Frontend Engineer',
    description: '...',
    images: [
      {
        url: `${BASE_URL}/images/og.jpg`,
        width: 1200,
        height: 630,
        alt: 'Mohammad Shehadeh - Senior Frontend Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mohammad Shehadeh - Senior Frontend Engineer',
    description: '...',
    images: [`${BASE_URL}/images/og.jpg`],
    creator: '@_mshehadeh',
    site: '@_mshehadeh',
  },
};

export default function HomePage() {
  return <div>...</div>;
}
```

### Dynamic Metadata

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await fetchPost(params.slug);
  return <article>{/* Render post */}</article>;
}
```

### PWA Manifest

```tsx
// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mohammad Shehadeh',
    short_name: 'MSH',
    description: 'Senior Frontend Engineer portfolio',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/images/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
```

### Sitemap

```tsx
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { BASE_URL } from '@/constants/urls';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchAllPosts();
  
  const blogUrls = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...blogUrls,
  ];
}
```

### Robots

```tsx
// app/robots.ts
import type { MetadataRoute } from 'next';
import { BASE_URL } from '@/constants/urls';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

## Environment Variables

```tsx
// env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    FIREBASE_PRIVATE_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});

// Usage
import { env } from '@/env';

// Server-side only
const dbUrl = env.DATABASE_URL;

// Client-side available
const apiUrl = env.NEXT_PUBLIC_API_URL;
```

## React Compiler

This project uses React Compiler (babel-plugin-react-compiler) which automatically optimizes React code.

### Configuration

```json
// package.json
{
  "dependencies": {
    "babel-plugin-react-compiler": "19.1.0-rc.3"
  }
}
```

### What It Does

- Automatically memoizes components, values, and callbacks
- No need to manually use `useMemo`, `useCallback`, or `React.memo`
- Optimizes re-renders at compile time

### Best Practices

```tsx
// ✅ Good: Write simple, clean code - compiler handles optimization
const ProductList = ({ products, filters }) => {
  const filteredProducts = products.filter(p => 
    filters.categories.includes(p.category)
  );
  
  const handleClick = (id: string) => {
    console.log('Clicked:', id);
  };

  return (
    <div>
      {filteredProducts.map(p => (
        <ProductCard key={p.id} product={p} onClick={handleClick} />
      ))}
    </div>
  );
};

// ❌ Avoid: Manual memoization is unnecessary
const ProductList = ({ products, filters }) => {
  const filteredProducts = useMemo(() => 
    products.filter(p => filters.categories.includes(p.category)),
    [products, filters]
  );
  
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);
  
  return <div>...</div>;
};
```

## MDX Support

MDX is configured for blog posts and documentation:

```tsx
// next.config.ts
import createMDX from '@next/mdx';

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX({
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
});
```

### Custom MDX Components

```tsx
// mdx-components.tsx
import type { MDXComponents } from 'mdx/types';
import { CodeBlock } from '@/components/ui/code-block';
import { Callout } from '@/components/ui/callout';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: CodeBlock,
    Callout,
    // Custom components available in MDX
  };
}
```
