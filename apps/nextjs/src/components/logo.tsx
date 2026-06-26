import { cn } from "@nucleus/ui/lib/utils";
import Link from "next/link";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <Link
      href="/"
      className={cn("flex shrink-0 items-center gap-2", className)}
      aria-label="Mohammad Shehadeh Logo"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="80 104 352 352"
        role="img"
        aria-hidden="true"
        className="relative size-7.5"
      >
        <title>Hirael</title>
        <path
          d="M160 340V235C160 171 203 128 256 128C309 128 352 171 352 235V340"
          fill="none"
          stroke="currentColor"
          stroke-width="18"
          stroke-linecap="square"
        ></path>
        <path
          d="M256 220C262 242 274 254 296 260C274 266 262 278 256 300C250 278 238 266 216 260C238 254 250 242 256 220Z"
          fill="currentColor"
        ></path>
        <path
          d="M95 372C160 364 352 364 417 372C352 380 160 380 95 372Z"
          fill="currentColor"
        ></path>
        <path
          d="M135 405C185 399 327 399 377 405C327 411 185 411 135 405Z"
          fill="currentColor"
        ></path>
        <path
          d="M190 438C220 434 292 434 322 438C292 442 220 442 190 438Z"
          fill="currentColor"
        ></path>
      </svg>
    </Link>
  );
};
