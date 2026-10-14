import { ArrowUpRight, LockKeyhole } from "lucide-react";
import Link from "next/link";

import type { SiteSettings } from "@/types/domain";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-16 border-t border-slate-200/70 bg-white/55">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold text-slate-700">{settings.displayName}</p>
          <p className="mt-1">Ghi chú được chăm chút, cập nhật không cần deploy lại.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {settings.socialLinks.slice(0, 3).map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-indigo-600"
            >
              {link.label}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          ))}
          <Link
            href="/admin/login"
            className="ml-1 inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-700"
          >
            <LockKeyhole className="size-3.5" aria-hidden="true" />
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
