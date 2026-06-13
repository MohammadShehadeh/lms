---
name: error-handling-patterns
description: Outlines error handling and logging patterns for the API and client. Use when implementing try/catch blocks, handling API errors, or logging.
---

# Error Handling Guidelines

## Error Handling Philosophy
- **Fail fast**: Catch errors early and provide clear feedback
- **User-friendly messages**: Show helpful messages to users, log technical details
- **Graceful degradation**: Provide fallbacks when possible
- **Consistent patterns**: Use the same error handling approach across the codebase

## tRPC Error Handling

### API Error Patterns
A hypothetical `userRouter` showing error handling patterns.
```typescript
import { TRPCError } from "@trpc/server";
import { user, userInsertSchema } from "@nucleus/db/schema";
import { eq } from "@nucleus/db";

export const userRouter = {
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const result = await ctx.db.query.user.findFirst({
        where: eq(user.id, input.id),
      });

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
          cause: new Error(`User with id ${input.id} does not exist`),
        });
      }

      return result;
    }),

  create: protectedProcedure
    .input(userInsertSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.db.insert(user).values({
          ...input,
          // other required fields
        }).returning();
        return result[0];
      } catch (error) {
        // Example of catching a specific database constraint error
        if (Error.isError(error) && error.message.includes('duplicate key')) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A user with this email already exists",
            cause: error,
          });
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
          cause: error,
        });
      }
    }),
};
```

### Common tRPC Error Codes
- `BAD_REQUEST` - Invalid input data (Zod validation will trigger this automatically).
- `UNAUTHORIZED` - Authentication required (triggered by `protectedProcedure`).
- `FORBIDDEN` - Insufficient permissions.
- `NOT_FOUND` - Resource doesn't exist.
- `CONFLICT` - Resource already exists or a unique constraint is violated.
- `INTERNAL_SERVER_ERROR` - Unexpected server errors.
- `TOO_MANY_REQUESTS` - Rate limiting.

## Client-Side Error Handling

### React Query Error Handling
This example assumes you have a `useQuery` hook for a `user.getById` procedure.
```typescript
import { toast } from "@nucleus/ui/components/sonner";
import { api } from "~/trpc/react";

export function UserProfile({ userId }: { userId: string }) {
  const { data: user, error, isError } = api.user.getById.useQuery({ id: userId });

  if (isError) {
    // Handle different error types from the API
    if (error.data?.code === "UNAUTHORIZED") {
      return <div>Please log in to view this profile.</div>;
    }
    
    // Generic error fallback
    toast.error(error.message || "Failed to load user profile.");
    return <div>Could not load user profile. Please try again.</div>;
  }

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
    </div>
  );
}
```

### Form Error Handling
This example shows handling a `CONFLICT` error from the API when creating a user.
```typescript
import { useForm } from "react-hook-form";
import { toast } from "@nucleus/ui/components/sonner";
import { userInsertSchema } from "@nucleus/db/schema";
import type { z } from "zod";
import { Form } from "@nucleus/ui/form";
import { api } from "~/trpc/react";

type UserFormData = z.infer<typeof userInsertSchema>;

export function CreateUserForm() {
  const form = useForm<UserFormData>();
  const createUser = api.user.create.useMutation({
    onSuccess: () => {
      toast.success("User created successfully!");
      form.reset();
    },
    onError: (error) => {
      if (error.data?.code === "CONFLICT") {
        form.setError("email", {
          message: "This email address is already in use.",
        });
      } else {
        toast.error(error.message || "Failed to create user. Please try again.");
      }
    },
  });

  const onSubmit = (data: UserFormData) => {
    createUser.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields for name, email, password etc. */}
      </form>
    </Form>
  );
}
```

## Database Error Handling

### Drizzle Error Patterns
```typescript
import { eq } from "@nucleus/db";
import { db } from "@nucleus/db/client";

export async function updateUser(id: string, data: Partial<User>) {
  try {
    const result = await db
      .update(user)
      .set(data)
      .where(eq(user.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`User with id ${id} not found`);
    }

    return result[0];
  } catch (error) {
    if (Error.isError(error)) {
      // Handle specific database errors
      if (error.message.includes('foreign key constraint')) {
        throw new Error('Cannot update user: referenced by other records');
      }
      
      if (error.message.includes('unique constraint')) {
        throw new Error('User email must be unique');
      }
    }
    
    // Re-throw unknown errors
    throw error;
  }
}
```

## Authentication Error Handling

### Auth Error Patterns
```typescript
import { signIn } from "~/auth/client";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (data: LoginFormData) => {
    try {
      setError(null);
      await signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/dashboard",
      });
    } catch (error) {
      if (Error.isError(error)) {
        // Handle specific auth errors
        if (error.message.includes("Invalid credentials")) {
          setError("Invalid email or password");
        } else if (error.message.includes("Too many requests")) {
          setError("Too many login attempts. Please try again later.");
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSignIn)}>
      {error && (
        <div className="text-destructive text-sm mb-4">
          {error}
        </div>
      )}
      {/* Form fields */}
    </form>
  );
}
```

## Error Boundaries

### React Error Boundary
```typescript
import { Component, type ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground">
            Please refresh the page or try again later.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Logging Patterns

### Server-Side Logging
```typescript
// Use structured logging
console.error("User creation failed", {
  userId: ctx.user.id,
  input: input,
  error: error.message,
  timestamp: new Date().toISOString(),
});

// For production, use a proper logging service
// logger.error("User creation failed", {
//   userId: ctx.user.id,
//   error: error.message,
//   stack: error.stack,
// });
```

### Client-Side Error Reporting
```typescript
// Log client errors for debugging
if (process.env.NODE_ENV === "development") {
  console.error("API call failed:", {
    endpoint: "user.create",
    error: error.message,
    data: error.data,
  });
}

// In production, send to error reporting service
// errorReporter.captureException(error, {
//   tags: { component: "CreateUserForm" },
//   extra: { formData: data },
// });
```

## Validation Error Handling

### Zod Validation Errors
```typescript
import { z } from "zod/v4";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

try {
  const result = schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation errors
    error.errors.forEach((err) => {
      form.setError(err.path[0] as keyof FormData, {
        message: err.message,
      });
    });
  }
}
```

## Best Practices

### Error Message Guidelines
- **Be specific**: "User not found" vs "An error occurred"
- **Be actionable**: Tell users what they can do next
- **Be consistent**: Use the same tone and format across the app
- **Be secure**: Don't expose sensitive information in error messages

### Error Recovery
- Provide retry mechanisms for transient errors
- Offer alternative actions when possible
- Save user input when errors occur
- Show loading states during error recovery

### Monitoring and Alerting
- Log all server errors with context
- Monitor error rates and patterns
- Set up alerts for critical error thresholds
- Track user-facing errors separately from system errors