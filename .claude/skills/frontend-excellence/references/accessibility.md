# Accessibility Patterns

## WCAG 2.1 AA Compliance

### Semantic HTML Foundation

Always use semantic HTML elements before reaching for ARIA:

```tsx
// ✅ Good: Semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/home">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<button onClick={handleSubmit}>Submit</button>

<article>
  <h1>Article Title</h1>
  <p>Article content...</p>
</article>

// ❌ Bad: Div soup
<div role="navigation">
  <div role="list">
    <div role="listitem">
      <div role="link" onClick={() => router.push('/home')}>Home</div>
    </div>
  </div>
</div>

<div role="button" onClick={handleSubmit}>Submit</div>
```

## Skip Link Pattern

The codebase uses a `not-focus:sr-only` pattern for skip links that appear only on keyboard focus:

```tsx
// app/layout.tsx
<Button
  type="button"
  variant="outline"
  className="not-focus:sr-only transition-none duration-0 absolute left-4 top-4 z-50"
  asChild
>
  <a href="#main">Skip to main content</a>
</Button>

<main id="main">
  {children}
</main>
```

Key aspects:
- Uses `not-focus:sr-only` - hidden by default, visible on focus
- `transition-none duration-0` - no animation delay when appearing
- `absolute left-4 top-4 z-50` - positioned at top-left with high z-index
- Links to `#main` which has `id="main"` on the main element

### Traditional Skip Link (alternative)

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
>
  Skip to main content
</a>

<main id="main-content" tabIndex={-1}>
  {/* Main content */}
</main>
```

## Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

```tsx
// Custom interactive element with keyboard support
const CustomButton = ({ onClick, children }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };
  
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="cursor-pointer rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {children}
    </div>
  );
};
```

### Focus Management

```tsx
'use client';

import { useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Focus trap in modal
export const Modal = ({ isOpen, onClose, children }) => {
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <button
          ref={firstFocusableRef}
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Close
        </button>
        {children}
      </DialogContent>
    </Dialog>
  );
};
```

### Focus Visible Styles

The button component includes comprehensive focus styles:

```tsx
const buttonVariants = cva(
  "... outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  // ...
);
```

## ARIA Attributes

### ARIA Labels and Descriptions

```tsx
// Accessible icon buttons
<Button variant="ghost" size="icon" aria-label="Toggle theme">
  <Icons.sun className="hidden size-4 dark:block" />
  <Icons.moon className="size-4 dark:hidden" />
</Button>

// Or with sr-only text
<Button variant="ghost" size="icon" onClick={toggleTheme}>
  <span className="sr-only">Toggle theme</span>
  <Icons.sun className="hidden size-4 dark:block" />
  <Icons.moon className="size-4 dark:hidden" />
</Button>

// Icon with aria-label
<tech.icon className="size-6" aria-label={tech.name} />

// Form inputs with labels
<div>
  <Label htmlFor="email">Email address</Label>
  <Input
    id="email"
    type="email"
    aria-describedby="email-description"
    aria-invalid={!!errors.email}
    aria-required="true"
  />
  <p id="email-description" className="text-sm text-muted-foreground">
    We'll never share your email with anyone else.
  </p>
  {errors.email && (
    <p role="alert" className="text-sm text-destructive">
      {errors.email.message}
    </p>
  )}
</div>
```

### Live Regions for Dynamic Content

```tsx
// Status announcements
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {statusMessage}
</div>

// Error announcements
<div
  role="alert"
  aria-live="assertive"
  className="sr-only"
>
  {errorMessage}
</div>

// Loading states
<Button disabled={isLoading}>
  {isLoading && (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      <span className="sr-only">Loading...</span>
    </>
  )}
  Submit
</Button>
```

## Screen Reader Patterns

### Screen Reader Only Content

Tailwind's `sr-only` class:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

Usage patterns:

```tsx
// Descriptive labels for icon-only buttons
<Button variant="ghost" size="icon">
  <Trash className="h-4 w-4" />
  <span className="sr-only">Delete item</span>
</Button>

// Theme toggle with icon switching
<Button variant="ghost" size="icon" onClick={toggleTheme}>
  <span className="sr-only">Toggle theme</span>
  <Icons.sun className="hidden size-4 dark:block" />
  <Icons.moon className="size-4 dark:hidden" />
</Button>

// Table captions
<table>
  <caption className="sr-only">User list with names, emails, and roles</caption>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
      <th scope="col">Role</th>
    </tr>
  </thead>
</table>
```

## Color and Contrast

### WCAG AA Contrast Requirements

- Normal text (< 24px): 4.5:1 contrast ratio
- Large text (≥ 24px or ≥ 19px bold): 3:1 contrast ratio
- UI components and graphics: 3:1 contrast ratio

```tsx
// High contrast text combinations using design tokens
<div className="bg-background text-foreground">
  Default text with proper contrast
</div>

<div className="bg-primary text-primary-foreground">
  Primary button text
</div>

<div className="bg-muted text-muted-foreground">
  Muted text (meets 4.5:1)
</div>

// The design system ensures muted-foreground has proper contrast:
// Light: oklch(0.48 0.016 285.938) - darker for better contrast
// Dark: oklch(0.75 0.015 286.067) - brighter for better contrast
```

### Don't Rely on Color Alone

```tsx
// ✅ Good: Icon + color + text
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    There was an error processing your request.
  </AlertDescription>
</Alert>

// ✅ Good: Multiple indicators for form validation
<div>
  <Label htmlFor="email" className="text-foreground">
    Email {errors.email && <span className="text-destructive">*</span>}
  </Label>
  <Input
    id="email"
    aria-invalid={!!errors.email}
    className={errors.email && "border-destructive"}
  />
  {errors.email && (
    <div className="flex items-center gap-1 text-sm text-destructive">
      <AlertCircle className="h-3 w-3" />
      <span>{errors.email.message}</span>
    </div>
  )}
</div>
```

## Forms Accessibility

### Proper Labeling

```tsx
// Always associate labels with inputs
<div className="space-y-2">
  <Label htmlFor="username">Username</Label>
  <Input id="username" name="username" required />
</div>

// Group related inputs
<fieldset className="space-y-4 rounded-lg border p-4">
  <legend className="text-lg font-semibold">Shipping Address</legend>
  <div>
    <Label htmlFor="street">Street Address</Label>
    <Input id="street" name="street" />
  </div>
  <div>
    <Label htmlFor="city">City</Label>
    <Input id="city" name="city" />
  </div>
</fieldset>

// Radio groups
<fieldset>
  <legend className="mb-4 text-sm font-medium">
    Notification preferences
  </legend>
  <div className="space-y-2">
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="all" id="all" />
      <Label htmlFor="all">All notifications</Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="important" id="important" />
      <Label htmlFor="important">Important only</Label>
    </div>
  </div>
</fieldset>
```

### Error Handling

```tsx
'use client';

import { z } from 'zod';
import { useState } from 'react';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  age: z.number().min(18, 'You must be at least 18 years old'),
});

export const AccessibleForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
    >
      {/* Error summary at top */}
      {Object.keys(errors).length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-destructive bg-destructive/10 p-4"
        >
          <h2 className="mb-2 text-lg font-semibold text-destructive">
            There are {Object.keys(errors).length} errors in your submission
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <a
                  href={`#${field}`}
                  className="text-destructive underline hover:no-underline"
                >
                  {error}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
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
          <p id="email-error" role="alert" className="mt-1 text-sm text-destructive">
            {errors.email}
          </p>
        )}
      </div>
      
      <Button type="submit">
        Submit
      </Button>
    </form>
  );
};
```

## Motion Accessibility

### MotionConfig for Reduced Motion

The app wraps content with MotionConfig to respect user preferences:

```tsx
// app/layout.tsx
import { MotionConfig } from 'motion/react';

<MotionConfig reducedMotion="user">
  {/* All motion animations respect prefers-reduced-motion */}
  {children}
</MotionConfig>
```

### NoScript Fallback

For users with JavaScript disabled:

```tsx
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

### Manual Reduced Motion Check

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

## Testing Accessibility

### Manual Testing Checklist

1. **Keyboard Navigation**
   - Can you reach all interactive elements with Tab?
   - Can you activate buttons/links with Enter/Space?
   - Is focus visible?
   - Does focus order make sense?
   - Does the skip link work?

2. **Screen Reader**
   - Do images have alt text?
   - Are form inputs properly labeled?
   - Are error messages announced?
   - Does the page structure make sense?
   - Are icon buttons announced correctly?

3. **Visual**
   - Does text meet contrast requirements?
   - Can you understand the UI without color?
   - Does the design work at 200% zoom?
   - Are focus indicators visible?

4. **Motion**
   - Do animations respect prefers-reduced-motion?
   - Is content accessible without JavaScript?

### Testing Tools

- Chrome DevTools Lighthouse (automated audit)
- axe DevTools browser extension
- WAVE browser extension
- Screen readers: NVDA (Windows), JAWS (Windows), VoiceOver (Mac/iOS)
- Keyboard navigation testing
- Color contrast analyzers

### Automated Testing

```tsx
// Using jest-axe for accessibility testing
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

describe('Button', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Common shadcn/ui A11y Patterns

### Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    {/* aria-labelledby and aria-describedby handled automatically */}
    <DialogHeader>
      <DialogTitle>Accessible Dialog Title</DialogTitle>
      <DialogDescription>
        This description is properly associated with the dialog
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Tooltip

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
```

### Combobox

```tsx
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

<Popover>
  <PopoverTrigger asChild>
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      aria-label="Select an item"
    >
      {value || "Select..."}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Command>
      <CommandInput placeholder="Search..." />
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup>
        {items.map(item => (
          <CommandItem key={item.value} onSelect={() => setValue(item.value)}>
            {item.label}
          </CommandItem>
        ))}
      </CommandGroup>
    </Command>
  </PopoverContent>
</Popover>
```

## Image Accessibility

```tsx
// Always provide meaningful alt text
<LazyImage
  src="/images/404/side-eye-dog.jpeg"
  alt="Suspicious dog giving side-eye"
  width={400}
  height={400}
/>

// For decorative images
<Image
  src="/decorative-pattern.png"
  alt=""
  aria-hidden="true"
/>

// For complex images, use aria-describedby
<figure>
  <Image
    src="/chart.png"
    alt="Quarterly sales chart"
    aria-describedby="chart-description"
  />
  <figcaption id="chart-description">
    Sales increased by 25% in Q3, with the highest growth in the electronics category.
  </figcaption>
</figure>
```
