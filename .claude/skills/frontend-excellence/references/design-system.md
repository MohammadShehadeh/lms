# Design System Architecture

## Tailwind CSS v4 Configuration

This project uses Tailwind CSS v4 with CSS-based configuration (no `tailwind.config.ts` file).

### Global CSS Setup

```css
/* src/styles/global.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));
```

## Design Tokens Structure

### Color System (OKLCH)

Colors use OKLCH color space for better perceptual uniformity and wider gamut support:

```css
:root {
  --radius: 0.65rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(55.58% 0.1504 149.09);
  --primary-foreground: oklch(0.986 0.031 120.757);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.96 0.001 286.375);
  --muted-foreground: oklch(0.48 0.016 285.938);
  --accent: oklch(0.96 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.88 0.004 286.32);
  --input: oklch(0.88 0.004 286.32);
  --ring: oklch(55.58% 0.1504 149.09);
  --chart-1: oklch(0.871 0.15 154.449);
  --chart-2: oklch(0.723 0.219 149.579);
  --chart-3: oklch(0.627 0.194 149.214);
  --chart-4: oklch(0.527 0.154 150.069);
  --chart-5: oklch(0.448 0.119 151.328);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.141 0.005 285.823);
  --sidebar-primary: oklch(55.58% 0.1504 149.09);
  --sidebar-primary-foreground: oklch(0.986 0.031 120.757);
  --sidebar-accent: oklch(0.96 0.001 286.375);
  --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
  --sidebar-border: oklch(0.88 0.004 286.32);
  
  --site-header-height: 56px;
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.21 0.006 285.885);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(59.86% 0.1632 148.87);
  --primary-foreground: oklch(0.986 0.031 120.757);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.75 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 18%);
  --input: oklch(1 0 0 / 20%);
  --ring: oklch(48.02% 0.1385 148.91);
  --chart-1: oklch(0.871 0.15 154.449);
  --chart-2: oklch(0.723 0.219 149.579);
  --chart-3: oklch(0.627 0.194 149.214);
  --chart-4: oklch(0.527 0.154 150.069);
  --chart-5: oklch(0.448 0.119 151.328);
  --sidebar: oklch(0.21 0.006 285.885);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(59.86% 0.1632 148.87);
  --sidebar-primary-foreground: oklch(0.986 0.031 120.757);
  --sidebar-accent: oklch(0.274 0.006 286.033);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 18%);
  --sidebar-ring: oklch(0.405 0.101 131.063);
}
```

### Theme Mapping with @theme inline

Map CSS variables to Tailwind classes:

```css
@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --font-playfair: var(--font-playfair);
}
```

### Custom Container Utility

```css
@utility container {
  margin-inline: auto;
  padding-inline: 1rem;
  max-width: 1280px;
}
```

## Typography System

### Font Configuration

Fonts are configured in a separate file and imported into the layout:

```ts
// next.fonts.ts
import { Geist, Playfair_Display } from 'next/font/google';

export const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-geist',
});

export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-playfair',
});
```

### Layout Usage

```tsx
// app/layout.tsx
import { geist, playfairDisplay } from '~/next.fonts';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn(geist.className, playfairDisplay.variable, 'overflow-x-hidden antialiased relative')}>
        {children}
      </body>
    </html>
  )
}
```

### Type Scale

```tsx
// Heading scales with Playfair for display
<h1 className="font-playfair text-4xl font-bold tracking-tight lg:text-5xl">
  Page Title
</h1>

// Section headings
<h2 className="text-3xl font-semibold tracking-tight">
  Section Title
</h2>

<h3 className="text-2xl font-semibold tracking-tight">
  Subsection Title
</h3>

// Body text with Geist
<p className="leading-7 text-muted-foreground">
  Default paragraph text with proper spacing
</p>

<p className="text-sm text-muted-foreground">
  Small supporting text
</p>
```

### Text Wrapping

Base styles include intelligent text wrapping:

```css
@layer base {
  p, span, label {
    text-wrap: pretty;
  }

  h1, h2, h3, h4, h5, h6 {
    text-wrap: balance;
  }
}
```

## Spacing System

### Container Component with Variants

```tsx
// components/layout/container.tsx
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const containerVariants = cva('container', {
  variants: {
    variant: {
      wrapper: '',
      section: 'py-8 2xl:py-12',
      heading: 'py-8',
      widget: 'py-8 md:py-16',
    },
  },
  defaultVariants: {
    variant: 'wrapper',
  },
});

interface ContainerProps extends PropsWithChildren, VariantProps<typeof containerVariants> {
  className?: string;
  asChild?: boolean;
}

export const Container = ({ className, asChild = false, variant = 'wrapper', ...props }: ContainerProps) => {
  const Comp = asChild ? Slot : 'div';
  return <Comp className={cn(containerVariants({ variant }), className)} {...props} />;
};
```

### Usage Patterns

```tsx
// Page layout with sections
<Container className="min-h-screen" asChild>
  <section>
    <Hero />
  </section>
</Container>

<Container variant="section" asChild>
  <section>
    <WhatIDo />
  </section>
</Container>

// Responsive spacing
<div className="mt-4 md:mt-8 flex items-center justify-center gap-2 md:gap-4">
  {/* Content */}
</div>
```

## Layout Patterns

### Grid Systems

```tsx
// Responsive grid
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Dashboard grid with different sizes
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <Card className="md:col-span-2 lg:col-span-3">Main content</Card>
  <Card className="md:col-span-2 lg:col-span-1">Sidebar</Card>
</div>

// Auto-fit grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Flexbox Patterns

```tsx
// Header with centered content
<header className="flex items-center justify-between px-6 py-4">
  <Logo />
  <Navigation />
  <UserMenu />
</header>

// Centered content with viewport height
<div className="flex min-h-[calc(100vh-var(--site-header-height))] items-center justify-center">
  <Content />
</div>

// Vertical stack with responsive gaps
<div className="flex flex-col gap-4 md:gap-6">
  <Item />
  <Item />
</div>
```

## Utility Class Composition

### cn() Helper Function

```ts
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

// Usage: Safely merge conflicting classes
<div className={cn(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  isPrimary && "border-primary bg-primary/10",
  isLarge && "p-8",
  className // User can override any class
)} />
```

### Conditional Styling Patterns

```tsx
// With cn()
<Button
  className={cn(
    "base-classes",
    variant === "primary" && "primary-classes",
    size === "lg" && "lg-classes",
    disabled && "disabled-classes",
    className
  )}
/>

// With object syntax in clsx
<div className={cn({
  "bg-primary": status === "success",
  "bg-destructive": status === "error",
  "bg-muted": status === "warning",
})} />
```

## Animation & Transitions

### Custom Keyframe Animations

```css
@layer utilities {
  @keyframes flip {
    0% { transform: rotateY(0); }
    50% { transform: rotateY(90deg); }
    100% { transform: rotateY(0); }
  }

  @keyframes wave {
    0% { transform: rotate(0deg); }
    50% { transform: rotate(14deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    40%, 80% { transform: translateX(-2px); }
    10%, 60%, 90% { transform: translateX(2px); }
  }

  @keyframes scale {
    0% { scale: 1; }
    50% { scale: 0.85; }
    100% { scale: 1; }
  }

  .animate-flip { animation: flip 750ms ease-in-out; }
  .animate-shake { animation: shake 250ms ease-in-out forwards; }
  .animate-scale { animation: scale 250ms ease-in-out forwards; }
  .animate-wave { animation: wave 1s infinite; }
}
```

### Tailwind Animate Classes (tw-animate-css)

```tsx
// Fade in
<div className="animate-in fade-in duration-300">
  Fades in on mount
</div>

// Slide in from bottom
<div className="animate-in slide-in-from-bottom-4 duration-500">
  Slides up from bottom
</div>

// Built-in animations
<div className="animate-bounce">↓</div>
<Loader2 className="size-4 animate-spin" />
<div className="animate-pulse rounded-lg bg-muted h-12 w-full" />
```

## Dark Mode Implementation

### Theme Provider Setup

```tsx
// providers/theme-provider.tsx
'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import type { PropsWithChildren } from 'react';
import { THEME_STORAGE_KEY } from '@/constants/theme';

export const ThemeProvider = ({ children }: PropsWithChildren) => (
  <NextThemeProvider
    disableTransitionOnChange
    attribute="class"
    defaultTheme="dark"
    storageKey={THEME_STORAGE_KEY}
    enableSystem={false}
  >
    {children}
  </NextThemeProvider>
);
```

### Theme Toggle Component

```tsx
// components/mode-switcher.tsx
'use client';

import { useTheme } from 'next-themes';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { THEME_DARK, THEME_LIGHT } from '@/constants/theme';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export const ModeSwitcher = () => {
  const { setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK));
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <span className="sr-only">Toggle theme</span>
            <Icons.sun className="hidden size-4 dark:block" />
            <Icons.moon className="size-4 dark:hidden" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Toggle theme</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
```

### Dark Mode CSS Pattern

Uses `@custom-variant` for dark mode:

```css
@custom-variant dark (&:is(.dark *));
```

Usage in components:

```tsx
// Auto-adapts to dark mode
<div className="bg-background text-foreground">
  Content adapts to theme
</div>

// Explicit dark mode overrides
<div className="bg-white dark:bg-input/30">
  Custom dark mode background
</div>

// Icon switching
<Icons.sun className="hidden size-4 dark:block" />
<Icons.moon className="size-4 dark:hidden" />
```

## Background Effects

### Noise Background Pattern

```css
.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
}
```

### Gradient Text

```tsx
<h1 className="bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
  Gradient heading
</h1>
```
