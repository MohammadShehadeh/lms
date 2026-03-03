"use client";

import { Button } from "@nucleus/ui/components/button";
import { ThemeToggle } from "@nucleus/ui/components/theme";
import { LayoutDashboard, LogIn, Star, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";

const GITHUB_REPO = "mohammadshehadeh/nucleus";
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;

function useGitHubStars() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});
  }, []);

  return stars;
}

function formatStars(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

export const Header = () => {
  const stars = useGitHubStars();

  return (
    <header className="fixed top-0 z-50 w-full border-b transition-colors duration-200 border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between">
        <Logo />

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild title="Dashboard">
            <Link prefetch={false} href="/dashboard">
              <LayoutDashboard className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild title="Log in">
            <Link prefetch={false} href="/login">
              <LogIn className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild title="Get started">
            <Link prefetch={false} href="/register">
              <UserPlus className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <Star className="size-4" />
              {stars !== null && <span className="text-xs tabular-nums">{formatStars(stars)}</span>}
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
