import { BookMarked, Search } from "lucide-react";
import Link from "next/link";

import { publicNavigation } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-[#f7f7fb]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold tracking-tight text-slate-950"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
            <BookMarked className="size-4" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">NoteSpace</span>
        </Link>

        <nav aria-label="Điều hướng chính" className="flex items-center gap-1">
          {publicNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/search"
            aria-label="Tìm kiếm"
            className="ml-1 grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
          >
            <Search className="size-4" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
