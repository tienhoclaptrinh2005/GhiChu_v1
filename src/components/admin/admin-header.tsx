import { BookMarked, LogOut } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";

export function AdminHeader({ displayName, email }: { displayName: string | null; email: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b-[3px] border-line bg-surface/95 px-4 shadow-[0_4px_0_color-mix(in_srgb,var(--ds-sky)_35%,transparent)] backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="voxel-icon grid size-11 place-items-center bg-forest text-[var(--ds-on-forest)] lg:hidden" aria-label="Trang tổng quan"><BookMarked className="size-4" /></Link>
        <div>
          <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted">Đang đăng nhập</p>
          <p className="max-w-44 truncate text-sm font-bold text-ink sm:max-w-none">{displayName || email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="sm">
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
