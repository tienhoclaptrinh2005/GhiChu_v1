import { ArrowUpRight, LockKeyhole } from "lucide-react";
import Link from "next/link";

import type { SiteSettings } from "@/types/domain";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-16 border-t-2 border-line bg-forest-deep text-[#fffdf5]">
      <div className="pixel-grid mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-base font-bold">{settings.displayName}</p>
          <p className="mt-1 max-w-md text-[#dfe8e3]">Ghi chú được chăm chút, cập nhật không cần deploy lại.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {settings.socialLinks.slice(0, 3).map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              className="inline-flex min-h-11 items-center gap-1 border-b-2 border-transparent font-bold text-[#dfe8e3] transition-colors hover:border-accent hover:text-accent"
            >
              {link.label}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          ))}
          <Link
            href="/admin/login"
            className="ml-1 inline-flex min-h-11 items-center gap-1.5 text-[#b9c8c1] transition-colors hover:text-accent"
          >
            <LockKeyhole className="size-3.5" aria-hidden="true" />
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
