"use client";

import { Badge } from "@nucleus/ui/components/badge";
import { Button } from "@nucleus/ui/components/button";
import { cn } from "@nucleus/ui/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Check,
  Copy,
  Database,
  Flag,
  KeyRound,
  Layers,
  ListTodo,
  Mail,
  MonitorSmartphone,
  ScrollText,
  ShieldCheck,
  Table,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

const GITHUB_URL = "https://github.com/mohammadshehadeh/nucleus";
const CLONE_COMMAND = "git clone https://github.com/niccoborg/nucleus.git";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type StackPackage = {
  name: string;
  desc: string;
};

const features: Feature[] = [
  {
    icon: KeyRound,
    title: "Authentication",
    description: "Email/password, social login, sessions, and protected routes with Better Auth.",
  },
  {
    icon: Layers,
    title: "Type-Safe API",
    description: "End-to-end type safety with tRPC. No code generation, no runtime overhead.",
  },
  {
    icon: Database,
    title: "Database and ORM",
    description: "PostgreSQL with Drizzle ORM. Type-safe schemas, migrations, and queries.",
  },
  {
    icon: Mail,
    title: "Email Service",
    description: "Transactional emails with Resend and React Email. Templates as components.",
  },
  {
    icon: Zap,
    title: "Caching and Rate Limiting",
    description: "Redis-powered caching and rate limiting. Configurable per-route.",
  },
  {
    icon: ShieldCheck,
    title: "Validation",
    description: "Zod schemas shared between client and server. Validate once, use everywhere.",
  },
  {
    icon: Table,
    title: "Admin Dashboard",
    description:
      "Data tables with server-side sorting, filtering, and pagination via TanStack Table.",
  },
  {
    icon: Flag,
    title: "Feature Flags",
    description:
      "Toggle features on and off without redeploying. Control rollouts per-user or globally.",
  },
  {
    icon: ListTodo,
    title: "Background Jobs",
    description: "Queue-based job processing for tasks that should not block a request.",
  },
  {
    icon: ScrollText,
    title: "Logging and Observability",
    description: "Structured logging and monitoring to understand what your system is doing.",
  },
  {
    icon: MonitorSmartphone,
    title: "Mobile App",
    description: "React Native via Expo. Same API layer, same auth, same type safety.",
  },
  {
    icon: Mail,
    title: "Rich Text Editor",
    description: "Tiptap editor with formatting, images, links, and collaborative editing.",
  },
];

const stack = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "tRPC",
  "Drizzle ORM",
  "PostgreSQL",
  "Redis",
  "Tailwind CSS v4",
  "Better Auth",
  "Zod",
  "Turborepo",
  "Resend",
];

const packages: StackPackage[] = [
  { name: "api", desc: "tRPC routers and procedures" },
  { name: "auth", desc: "Better Auth and sessions" },
  { name: "db", desc: "Drizzle ORM and PostgreSQL" },
  { name: "email", desc: "Resend and React Email" },
  { name: "cache", desc: "Redis caching layer" },
  { name: "ui", desc: "50+ shadcn/ui components" },
  { name: "validators", desc: "Shared Zod schemas" },
  { name: "i18n", desc: "Internationalization utilities" },
  { name: "rate-limit", desc: "Redis-based rate limiter" },
  { name: "upload", desc: "File upload service" },
];

const workflowItems = [
  {
    title: "Build Fast",
    description:
      "Bootstrap features from validated modules instead of wiring the same primitives on every project.",
  },
  {
    title: "Ship Confidently",
    description:
      "Shared validation, typed APIs, and isolated packages reduce integration drift between teams.",
  },
  {
    title: "Operate Clearly",
    description:
      "Keep observability, rate limiting, background jobs, and admin tooling available from day one.",
  },
];

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function SectionContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-primary text-sm font-medium">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      <p className="text-muted-foreground mt-4 text-lg leading-relaxed">{description}</p>
    </div>
  );
}

function CloneCommand() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(CLONE_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <Button variant="outline" onClick={handleCopy} className="gap-3 font-mono text-sm">
      <span className="text-primary shrink-0 select-none">$</span>
      <span className="min-w-0 truncate text-left">{CLONE_COMMAND}</span>
      {copied ? (
        <Check className="size-4 shrink-0 text-emerald-500" />
      ) : (
        <Copy className="text-muted-foreground size-4 shrink-0" />
      )}
    </Button>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b py-24 sm:py-32 lg:py-40">
      <div
        className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.15),transparent_50%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-30"
        aria-hidden="true"
      />

      <SectionContainer className="mx-auto text-center">
        <div className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Open-source starter kit
        </div>
        <h1 className="text-pretty text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Build your product.
          <span className="from-foreground to-muted-foreground block bg-linear-to-r bg-clip-text text-transparent">
            Skip rebuilding infrastructure.
          </span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
          Nucleus ships auth, APIs, database access, email, caching, and admin tooling in one
          cohesive monorepo.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Button size="lg" className="h-11 px-6" asChild>
              <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <GitHubIcon className="size-4" />
                View on GitHub
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-6" asChild>
              <Link href="#features">
                Explore features
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <CloneCommand />
        </div>
      </SectionContainer>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <article className="bg-card text-card-foreground rounded-lg border border-border p-6 transition-shadow hover:shadow-lg">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <feature.icon className="size-5" />
      </div>
      <h3 className="text-lg font-semibold">{feature.title}</h3>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{feature.description}</p>
    </article>
  );
}

function FeatureGridSection() {
  return (
    <section id="features" className="border-b py-16 sm:py-24">
      <SectionContainer>
        <SectionHeader
          eyebrow="Capabilities"
          title="Everything needed for production"
          description="The starter includes complete modules, so you can inspect real implementations and ship faster."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

function StackBadges() {
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {stack.map((tech) => (
        <Badge key={tech} variant="outline" className="px-3 py-1.5 font-mono text-xs">
          {tech}
        </Badge>
      ))}
    </div>
  );
}

function PackageTree() {
  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="bg-muted/50 flex items-center gap-2 rounded-t-lg border-b px-4 py-3">
        <div className="size-2.5 rounded-full bg-border" />
        <div className="size-2.5 rounded-full bg-border" />
        <div className="size-2.5 rounded-full bg-border" />
        <span className="text-muted-foreground ml-2 font-mono text-xs">packages/</span>
      </div>
      <div className="divide-y divide-border">
        {packages.map((pkg, index) => (
          <div key={pkg.name} className="flex items-center gap-3 px-4 py-3 font-mono text-sm">
            <span className="text-muted-foreground/60 shrink-0 select-none">
              {index === packages.length - 1 ? "\\-" : "|-"}
            </span>
            <span className="min-w-0 shrink truncate font-medium">{pkg.name}</span>
            <span className="text-muted-foreground min-w-0 truncate text-xs font-sans">
              {pkg.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchitectureSection() {
  return (
    <section className="border-b py-16 sm:py-24">
      <SectionContainer>
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          <div>
            <p className="text-primary text-sm font-medium">Architecture</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Composable packages with shared contracts
            </h2>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              Turborepo keeps modules decoupled while API types, validation schemas, and shared
              utilities stay in sync across apps.
            </p>
            <StackBadges />
          </div>
          <PackageTree />
        </div>
      </SectionContainer>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section className="border-b py-16 sm:py-24">
      <SectionContainer>
        <SectionHeader
          eyebrow="Workflow"
          title="Designed for delivery velocity"
          description="Move from setup to shipping with patterns that support build speed, release confidence, and runtime clarity."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {workflowItems.map((item, index) => (
            <article key={item.title} className="bg-card rounded-lg border border-border p-6">
              <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-16 sm:py-24">
      <SectionContainer>
        <div className="from-card to-muted/30 rounded-2xl border bg-linear-to-br p-8 text-center sm:p-12">
          <p className="text-primary text-sm font-medium">Start building</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Launch on a stack that is already wired correctly
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg leading-relaxed">
            Clone the repo, run the apps, and spend your effort on product behavior, not repeated
            infrastructure setup.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-11 px-6" asChild>
              <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <GitHubIcon className="size-4" />
                Clone Nucleus
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-6" asChild>
              <Link href="/register">Create an account</Link>
            </Button>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeatureGridSection />
      <ArchitectureSection />
      <WorkflowSection />
      <CtaSection />
    </>
  );
}
