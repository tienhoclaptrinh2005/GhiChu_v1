"use client";

import { BookMarked, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavigation } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="pixel-grid sticky top-0 hidden h-screen w-68 shrink-0 border-r-2 border-line bg-forest-deep text-[#fffdf5] lg:flex lg:flex-col">
        <Link href="/admin" className="flex h-18 items-center gap-3 border-b-2 border-[#090d0b] px-5 font-display font-bold">
          <span className="grid size-10 place-items-center rounded-md border-2 border-[#090d0b] bg-accent text-[#231f20] shadow-[3px_3px_0_#090d0b]">
            <BookMarked className="size-4" />
          </span>
          GhiChu Admin
        </Link>
        <nav className="flex-1 space-y-1 p-3" aria-label="Điều hướng quản trị">
          {adminNavigation.map((item) => {
            const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-md border-2 px-3 py-2.5 text-sm font-semibold transition-[background-color,color,transform] duration-150",
                  active ? "border-[#090d0b] bg-accent text-[#231f20] shadow-[3px_3px_0_#090d0b]" : "border-transparent text-[#cbd8d2] hover:translate-x-0.5 hover:border-[#090d0b] hover:bg-forest hover:text-[#fffdf5]",
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t-2 border-[#090d0b] p-3">
          <Link href="/" target="_blank" className="flex min-h-11 items-center justify-between rounded-md px-3 text-sm font-semibold text-[#cbd8d2] transition-colors hover:bg-forest hover:text-accent">
            Xem website
            <ExternalLink className="size-4" />
          </Link>
        </div>
      </aside>

      <nav aria-label="Điều hướng quản trị trên di động" className="fixed inset-x-3 bottom-3 z-50 flex gap-1 overflow-x-auto rounded-lg border-2 border-line bg-forest-deep p-2 shadow-[5px_5px_0_var(--ds-shadow)] lg:hidden">
        {adminNavigation.map((item) => {
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("flex min-w-20 flex-1 flex-col items-center justify-center gap-1 rounded-md border-2 px-2 py-2 font-display text-[0.62rem] font-bold", active ? "border-line bg-accent text-[#231f20]" : "border-transparent text-[#dbe4df]")}>
              <item.icon className="size-4" aria-hidden="true" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
