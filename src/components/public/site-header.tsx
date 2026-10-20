import { BookMarked, Search } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { publicNavigation } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-line bg-canvas/95 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-3 px-3 sm:px-6">
        <Link
          href="/"
          className="group flex min-h-11 shrink-0 items-center gap-2.5 font-display font-bold tracking-tight text-ink"
        >
          <span className="grid size-10 place-items-center rounded-md border-2 border-line bg-forest-deep text-[#fffdf5] shadow-[3px_3px_0_var(--ds-shadow)] transition-transform duration-150 group-hover:-translate-y-0.5">
            <BookMarked className="size-4" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">GhiChu<span className="text-pink">_v1</span></span>
        </Link>

        <nav aria-label="Điều hướng chính" className="flex min-w-0 items-center gap-1 sm:gap-2">
          {publicNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${item.href === "/" ? "hidden md:inline-flex" : "inline-flex"} min-h-11 items-center rounded-md px-2 text-xs font-bold text-muted transition-colors duration-150 hover:bg-surface hover:text-ink sm:px-3 sm:text-sm`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/search"
            aria-label="Tìm kiếm"
            className="ml-1 grid size-11 place-items-center rounded-md border-2 border-line bg-surface text-ink shadow-[3px_3px_0_var(--ds-shadow)] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:bg-sky hover:shadow-[4px_4px_0_var(--ds-shadow)]"
          >
            <Search className="size-4" aria-hidden="true" />
          </Link>
          <ThemeToggle className="ml-1" />
        </nav>
      </div>
    </header>
  );
}
