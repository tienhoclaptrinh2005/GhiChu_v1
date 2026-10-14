import { LogOut, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";

export function AdminHeader({ displayName, email }: { displayName: string | null; email: string }) {
  return (
    <header className="flex h-17 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button type="button" className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 lg:hidden" aria-label="Mở menu">
          <Menu className="size-4" />
        </button>
        <div>
          <p className="text-xs font-medium text-slate-400">Đang đăng nhập</p>
          <p className="text-sm font-bold text-slate-800">{displayName || email}</p>
        </div>
      </div>
      <form action={logoutAction}>
        <Button type="submit" variant="ghost" size="sm">
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </Button>
      </form>
    </header>
  );
}
