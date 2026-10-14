"use client";

import { BookMarked, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavigation } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-950 text-white lg:flex lg:flex-col">
      <Link href="/admin" className="flex h-17 items-center gap-3 border-b border-white/10 px-5 font-bold">
        <span className="grid size-9 place-items-center rounded-xl bg-indigo-500">
          <BookMarked className="size-4" />
        </span>
        NoteSpace Admin
      </Link>
      <nav className="flex-1 space-y-1 p-3" aria-label="Điều hướng quản trị">
        {adminNavigation.map((item) => {
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-white text-slate-950" : "text-slate-400 hover:bg-white/8 hover:text-white",
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link href="/" target="_blank" className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/8 hover:text-white">
          Xem website
          <ExternalLink className="size-4" />
        </Link>
      </div>
    </aside>
  );
}
