# Animation and Interactions

## Motion Library Setup

This project uses the **Motion** library (`motion` package, imported from `motion/react`) - the evolution of Framer Motion.

### Installation

```bash
pnpm add motion
```

### Global Configuration

The app is wrapped with `MotionConfig` for accessibility:

```tsx
// app/layout.tsx
import { MotionConfig } from 'motion/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MotionConfig reducedMotion="user">
          {/* App content */}
          {children}
        </MotionConfig>
      </body>
    </html>
  );
}
```

The `reducedMotion="user"` setting respects the user's `prefers-reduced-motion` system preference.

### Pre-exported Motion Components

For Server/Client component boundaries, motion components are pre-exported:

```tsx
// components/motion.tsx
'use client';

import { motion } from 'motion/react';

export const MotionDiv = motion.div;
export const MotionBlockquote = motion.blockquote;
export const MotionSpan = motion.span;
export const MotionP = motion.p;
export const MotionSvg = motion.svg;
export const MotionPath = motion.path;
export const MotionLinearGradient = motion.linearGradient;
export const MotionButton = motion.button;
export const MotionH2 = motion.h2;

// Usage in Client Components
import { MotionDiv } from '@/components/motion';

export const Hero = () => (
  <MotionDiv
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.1, duration: 0.1 }}
  >
    {/* Content */}
  </MotionDiv>
);
```

## Simple Animations

### Fade In with Slide

```tsx
'use client';

import { MotionDiv } from '@/components/motion';

export const FadeInUp = ({ children, delay = 0 }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.1 }}
  >
    {children}
  </MotionDiv>
);
```

### Scale on Mount

```tsx
'use client';

import { motion } from 'motion/react';

export const ScaleIn = ({ children }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);
```

## Viewport-Triggered Animations

The primary animation pattern in this codebase uses `whileInView` for scroll-triggered animations:

```tsx
'use client';

import { MotionDiv } from '@/components/motion';

export const Hero = () => (
  <div className="relative content-center text-center">
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1, duration: 0.1 }}
      className="mb-6"
    >
      {/* First section */}
    </MotionDiv>

    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, duration: 0.1 }}
      className="mt-4 md:mt-8"
    >
      {/* Second section - delayed */}
    </MotionDiv>

    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 0.1 }}
      className="mt-4 md:mt-8"
    >
      {/* Third section - more delayed */}
    </MotionDiv>
  </div>
);
```

Key patterns:
- `viewport={{ once: true }}` - Animate only once when entering viewport
- Staggered delays (0.1, 0.2, 0.3) for sequential reveal
- Short durations (0.1s) for snappy feel

## Hover and Tap Animations

```tsx
'use client';

import { motion } from 'motion/react';

export const InteractiveCard = ({ children }) => (
  <motion.div
    className="rounded-lg border bg-card p-6"
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    {children}
  </motion.div>
);
```

### Button with Group Hover

Combine Motion with CSS group hover for icon animations:

```tsx
<Button size="lg" className="group relative overflow-hidden" asChild>
  <Link href="/about/">
    <span className="relative z-10">View Experience</span>
    <Icons.arrowRight className="size-4 transition-transform group-hover:translate-x-1" />
  </Link>
</Button>
```

## Advanced Animation Patterns

### Staggered Children

```tsx
'use client';

import { motion } from 'motion/react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const StaggeredList = ({ items }) => (
  <motion.ul
    variants={container}
    initial="hidden"
    animate="show"
    className="space-y-4"
  >
    {items.map((listItem) => (
      <motion.li
        key={listItem.id}
        variants={item}
        className="rounded-lg border bg-card p-4"
      >
        {listItem.content}
      </motion.li>
    ))}
  </motion.ul>
);
```

### Layout Animations

```tsx
'use client';

import { motion } from 'motion/react';

export const AnimatedCard = ({ isExpanded, onClick, children }) => (
  <motion.div
    layout
    onClick={onClick}
    className="cursor-pointer rounded-lg border bg-card p-6"
    transition={{ layout: { duration: 0.3 } }}
  >
    {children}
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: isExpanded ? 1 : 0 }}
      transition={{ opacity: { duration: 0.2 } }}
    >
      {isExpanded && <div className="mt-4">Expanded content</div>}
    </motion.div>
  </motion.div>
);

// Shared layout animations for tabs
export const TabContent = ({ activeTab, setActiveTab }) => (
  <div className="flex gap-2">
    {['Tab 1', 'Tab 2', 'Tab 3'].map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className="relative rounded-lg px-4 py-2"
      >
        {tab}
        {activeTab === tab && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 rounded-lg bg-primary"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
      </button>
    ))}
  </div>
);
```

### Exit Animations with AnimatePresence

```tsx
'use client';

import { motion, AnimatePresence } from 'motion/react';

export const Modal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-card p-6"
        >
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// List with exit animations
export const TodoList = ({ todos, onRemove }) => (
  <AnimatePresence mode="popLayout">
    {todos.map((todo) => (
      <motion.div
        key={todo.id}
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 rounded-lg border bg-card p-4"
      >
        <span>{todo.title}</span>
        <Button onClick={() => onRemove(todo.id)}>Remove</Button>
      </motion.div>
    ))}
  </AnimatePresence>
);
```

## SVG Animations

Use pre-exported motion SVG components:

```tsx
'use client';

import { MotionSvg, MotionPath } from '@/components/motion';

export const AnimatedIcon = () => (
  <MotionSvg
    viewBox="0 0 24 24"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <MotionPath
      d="M12 2L2 7l10 5 10-5-10-5z"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    />
  </MotionSvg>
);
```

## CSS-Based Animations

### Tailwind Animate Utilities (tw-animate-css)

```tsx
// Spin
<Loader2 className="h-4 w-4 animate-spin" />

// Pulse
<div className="animate-pulse rounded-lg bg-muted h-12 w-full" />

// Bounce
<Icons.chevronDown className="size-4 mt-1 animate-bounce" />

// Custom animation classes from global.css
<div className="animate-flip">Flips with rotation</div>
<div className="animate-shake">Shakes side to side</div>
<div className="animate-scale">Scales down and up</div>
<div className="animate-wave">Waves like a hand</div>

// Enter animations
<div className="animate-in fade-in zoom-in-95 duration-300">
  Animates on mount
</div>

// Exit animations
<div className="animate-out fade-out slide-out-to-right duration-200">
  Animates on unmount
</div>
```

### Custom Keyframes in global.css

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

### CSS Transitions

```tsx
// Smooth color transitions
<Button className="
  bg-primary text-primary-foreground
  transition-colors duration-200
  hover:bg-primary/90
">
  Hover me
</Button>

// Multiple properties with group
<div className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
  <Icons.arrowRight className="transition-transform group-hover:translate-x-1" />
</div>
```

## NoScript Fallback

For users with JavaScript disabled, reset animation styles:

```tsx
// In layout.tsx <head>
<noscript
  dangerouslySetInnerHTML={{
    __html: `
      <style>
        [style] {
          opacity: 1 !important;
          inset: initial !important;
          transform: initial !important;
          translate: initial !important;
          transition: initial !important;
          animation: initial !important;
        }
      </style>
    `,
  }}
/>
```

## Performance Optimization

### Reduce Motion for Accessibility

With `MotionConfig reducedMotion="user"`, animations automatically respect user preferences. For additional control:

```tsx
'use client';

import { motion, useReducedMotion } from 'motion/react';

export const AccessibleAnimation = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
    >
      {children}
    </motion.div>
  );
};
```

### Use CSS for Simple Animations

```tsx
// ✅ Good: CSS for simple animations
<Button className="transition-colors duration-200 hover:bg-primary/90">
  Click me
</Button>

// ❌ Overkill: Motion for simple hover
<motion.button whileHover={{ backgroundColor: 'var(--primary-90)' }}>
  Click me
</motion.button>

// ✅ Good: Motion for complex orchestrated animations
<MotionDiv
  initial={{ opacity: 0, y: 10 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: 0.1 }}
>
  Complex scroll-triggered animation
</MotionDiv>
```

### Will-Change for Performance

```tsx
// Add will-change for animated properties
<motion.div
  className="will-change-transform"
  animate={{ x: 100 }}
>
  Smooth animation
</motion.div>
```

## Common Animation Patterns

### Staggered Page Sections

```tsx
export const Hero = () => (
  <div className="relative content-center text-center">
    {/* Section 1: delay 0.1 */}
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1, duration: 0.1 }}
    >
      <Title>...</Title>
    </MotionDiv>

    {/* Section 2: delay 0.2 */}
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, duration: 0.1 }}
    >
      <Buttons />
    </MotionDiv>

    {/* Section 3: delay 0.3 */}
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 0.1 }}
    >
      <TechStack />
    </MotionDiv>
  </div>
);
```

### Loading Indicators

```tsx
// Spinner with Tailwind
<Loader2 className="size-4 animate-spin" />

// Skeleton with pulse
<div className="animate-pulse rounded-lg bg-muted h-12 w-full" />

// Button loading state
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="size-4 animate-spin" />}
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```
