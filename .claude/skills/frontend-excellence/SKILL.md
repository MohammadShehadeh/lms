---
name: frontend-excellence
description: Comprehensive frontend UI/UX development skill for building production-ready, accessible interfaces with shadcn/ui (new-york style), Tailwind CSS v4, React 19, and Next.js 16. Use when creating or improving frontend components, implementing responsive layouts, building design systems, ensuring accessibility compliance, optimizing performance, adding animations with Motion library, or working with modern React/Next.js patterns. Covers component architecture, design tokens with OKLCH colors, WCAG accessibility, App Router patterns, Zustand state management, form handling, and micro-interactions.
---

# Frontend Excellence

Build exceptional, accessible, and performant frontend interfaces using modern React 19, Next.js 16, shadcn/ui (new-york style), Motion library, and Tailwind CSS v4.

## Core Principles

1. **Component-First Architecture** - Build reusable, composable components with clear variants and props
2. **Design System Consistency** - Use OKLCH color tokens, semantic colors, and consistent spacing
3. **Accessibility by Default** - WCAG 2.1 AA compliance in all interfaces
4. **Performance Optimization** - React Compiler handles memoization; use code splitting and lazy loading
5. **Mobile-First Responsive** - Design for mobile, enhance for desktop
6. **Type Safety** - TypeScript strict mode for all components and utilities

## When to Use This Skill

Use this skill when:
- Creating new UI components with shadcn/ui and Tailwind CSS v4
- Building responsive layouts and design systems
- Implementing accessibility features and WCAG compliance
- Working with Next.js App Router (server/client components, layouts, data fetching)
- Adding animations with Motion library (`motion/react`)
- Setting up forms with Zod validation
- Managing component state with Zustand
- Optimizing frontend performance

## Quick Start Patterns

### Component Creation

```tsx
// components/ui/custom-card.tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow-sm transition-all overflow-hidden",
  {
    variants: {
      variant: {
        default: "hover:shadow-lg",
        interactive: "cursor-pointer hover:shadow-lg hover:-translate-y-1",
        highlighted: "border-primary bg-primary/5",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

export const Card = ({ className, variant, size, ...props }: CardProps) => (
  <div
    className={cn(cardVariants({ variant, size, className }))}
    {...props}
  />
)
```

### Responsive Layout

```tsx
<div className="container py-8 md:py-12 lg:py-16">
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {items.map(item => <Card key={item.id} {...item} />)}
  </div>
</div>
```

### Accessible Form

```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  <div>
    <Label htmlFor="email">
      Email <span className="text-destructive">*</span>
    </Label>
    <Input
      id="email"
      type="email"
      aria-required="true"
      aria-invalid={!!errors.email}
      aria-describedby={errors.email ? "email-error" : undefined}
    />
    {errors.email && (
      <p id="email-error" role="alert" className="text-sm text-destructive">
        {errors.email.message}
      </p>
    )}
  </div>
  <Button type="submit">Submit</Button>
</form>
```

## Architecture Guidelines

### Component Composition

Build components that compose well together:

```tsx
// ✅ Good: Composable components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// ❌ Bad: Monolithic components
<Card 
  title="Title"
  description="Description"
  content={content}
  action={<Button>Action</Button>}
/>
```

### Server vs Client Components

Default to Server Components, use Client Components only when needed:

```tsx
// app/dashboard/page.tsx (Server Component - default)
export default async function DashboardPage() {
  const data = await fetchData() // Server-side data fetching
  
  return (
    <div>
      <StatCards data={data} /> {/* Server Component */}
      <InteractiveChart data={data} /> {/* Client Component */}
    </div>
  )
}

// components/interactive-chart.tsx (Client Component)
'use client'

import { useState } from 'react'

export const InteractiveChart = ({ data }) => {
  const [view, setView] = useState('weekly')
  // Client-side interactivity
}
```

## Design System Implementation

### Design Tokens (Tailwind v4 with OKLCH)

Design tokens are defined in CSS with OKLCH color space for better perceptual uniformity:

```css
/* src/styles/global.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.65rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(55.58% 0.1504 149.09);
  --primary-foreground: oklch(0.986 0.031 120.757);
  /* ... more tokens */
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(59.86% 0.1632 148.87);
  /* ... more tokens */
}

@theme inline {
  --radius-lg: var(--radius);
  --color-background: var(--background);
  --color-primary: var(--primary);
  /* Map CSS vars to Tailwind */
}
```

## Core Workflows

### 1. Creating a New Component

1. Determine if component needs client interactivity (`'use client'`)
2. Define component variants using `cva` if multiple styles needed
3. Implement TypeScript interface with `React.ComponentProps<"element">`
4. Add proper accessibility attributes (ARIA, semantic HTML)
5. Use `cn()` utility for class merging
6. Test keyboard navigation and screen reader support

### 2. Building Responsive Layouts

1. Start mobile-first with base styles
2. Add responsive breakpoints progressively (sm, md, lg, xl, 2xl)
3. Use Tailwind grid/flex utilities
4. Use Container component with variant props
5. Ensure touch targets are at least 44x44px

### 3. Implementing Accessibility

1. Use semantic HTML elements first
2. Add proper labels and ARIA attributes
3. Ensure keyboard navigation works
4. Test with screen reader
5. Verify color contrast meets WCAG AA (4.5:1 for text)
6. Use `not-focus:sr-only` pattern for skip links

### 4. Adding Animations

1. Use CSS transitions for simple state changes
2. Use Motion library (`motion/react`) for complex animations
3. Wrap app with `<MotionConfig reducedMotion="user">` for accessibility
4. Keep animations under 300ms for UI feedback
5. Use spring animations for natural feel
6. Export reusable motion components from `@/components/motion`

## Reference Files

This skill includes detailed reference documentation:

- **[component-patterns.md](references/component-patterns.md)** - shadcn/ui component composition, variants, polymorphic components, Container pattern, state management with Zustand
- **[design-system.md](references/design-system.md)** - Tailwind v4 design tokens, OKLCH color system, typography with Geist/Playfair, spacing, dark mode
- **[accessibility.md](references/accessibility.md)** - WCAG compliance, ARIA patterns, keyboard navigation, skip link patterns, testing
- **[nextjs-patterns.md](references/nextjs-patterns.md)** - Next.js 16 App Router, React 19 ViewTransition, server/client components, API routes, metadata
- **[animations.md](references/animations.md)** - Motion library patterns, MotionConfig, pre-exported motion components, micro-interactions

Load these files when you need detailed guidance on specific topics.

## Common Patterns

### Loading States

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-64" />
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  )
}
```

### Error Handling

```tsx
// app/dashboard/error.tsx
'use client'

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

### Zustand Store Pattern

```tsx
// store/notifications.ts
'use client'

import { z } from 'zod'
import { create } from 'zustand'

const notificationsSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    message: z.string(),
    type: z.enum(['blog_post', 'announcement', 'update']),
    link: z.string().optional(),
    createdAt: z.number(),
  })
)

export type Notifications = z.infer<typeof notificationsSchema>

interface NotificationState {
  notifications: Notifications
  unreadCount: number
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
}))
```

## Best Practices

### Performance

- React Compiler handles useMemo/useCallback automatically - don't add them manually
- Use dynamic imports for heavy components
- Implement proper image optimization with Next.js Image
- Use Server Components by default for data fetching
- Implement proper caching strategies

### Accessibility

- Always provide text alternatives for images
- Ensure keyboard navigation for all interactive elements
- Use semantic HTML before ARIA
- Test with screen readers
- Maintain 4.5:1 contrast ratio for text

### Code Quality

- Use TypeScript strict mode for type safety
- Use Biome for formatting and linting
- Write descriptive component and prop names using arrow functions
- Keep components focused and composable
- Use `interface` over `type` for component props

## Testing

```tsx
// Component test with Vitest
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })
})
```

## Troubleshooting

### Hydration Errors
- Check for client-only code in Server Components
- Ensure date/time formatting is consistent
- Use `suppressHydrationWarning` for unavoidable differences (like in html tag)

### Styling Issues
- Verify global.css imports tailwindcss correctly
- Check for CSS specificity conflicts
- Use `cn()` utility to properly merge classes

### Performance Issues
- Profile with React DevTools
- Check for unnecessary re-renders
- Implement code splitting
- Optimize images and fonts

## Additional Resources

- shadcn/ui documentation: https://ui.shadcn.com
- Tailwind CSS v4 documentation: https://tailwindcss.com
- Next.js 16 documentation: https://nextjs.org
- React 19 documentation: https://react.dev
- Motion library: https://motion.dev
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref

