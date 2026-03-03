import Link from "next/link";
import { Logo } from "@/components/logo";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const footerLinks = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Documentation", href: "https://github.com/mohammadshehadeh/nucleus#readme" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "GitHub", href: "https://github.com/mohammadshehadeh/nucleus" },
      { label: "Issues", href: "https://github.com/mohammadshehadeh/nucleus/issues" },
      { label: "Releases", href: "https://github.com/mohammadshehadeh/nucleus/releases" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="border-t">
      <div className="container py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              A production-grade monorepo starter with auth, APIs, email, caching, and admin tooling
              — all wired together.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex gap-16">
            {footerLinks.map((group) => (
              <div key={group.heading}>
                <p className="text-sm font-medium">{group.heading}</p>
                <ul className="mt-3 space-y-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex items-center justify-between border-t pt-6">
          <p className="text-muted-foreground text-xs">&copy; {new Date().getFullYear()} Nucleus</p>
          <Link
            href="https://github.com/mohammadshehadeh/nucleus"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <GitHubIcon className="size-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
};
