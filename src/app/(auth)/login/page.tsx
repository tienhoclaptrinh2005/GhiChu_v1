import type { Metadata } from "next";
import { ArrowLeft, BookMarked, KeyRound, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/features/auth/actions";
import { getAdminUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await getAdminUser();
  if (admin) redirect("/admin");

  const { error } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main id="main-content" className="grid min-h-screen bg-canvas lg:grid-cols-[1.05fr_0.95fr]">
      <section className="pixel-corners pixel-grid relative hidden overflow-hidden border-r-2 border-line bg-forest-deep p-12 text-[#fffdf5] lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="relative flex items-center gap-3 font-display font-bold">
          <span className="grid size-11 place-items-center rounded-md border-2 border-[#090d0b] bg-accent text-[#231f20] shadow-[4px_4px_0_#090d0b]">
            <BookMarked className="size-5" aria-hidden="true" />
          </span>
          GhiChu_v1
        </Link>
        <div className="relative max-w-lg">
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-accent">Private dashboard</p>
          <h1 className="mt-4 text-5xl font-bold tracking-[-0.05em]">Mọi nội dung, trong một nơi an toàn.</h1>
          <p className="mt-5 text-lg leading-8 text-[#d7e1dc]">Quản lý trang chủ, ghi chú, phiên bản và thư viện media mà không cần chỉnh source hay deploy lại.</p>
        </div>
        <div className="relative flex items-center gap-3 text-sm text-[#c2d0c9]">
          <ShieldCheck className="size-5 text-accent" aria-hidden="true" />
          Xác thực Supabase + phân quyền server + RLS
        </div>
      </section>

      <section className="relative flex items-center justify-center px-5 py-16 sm:px-10">
        <ThemeToggle className="absolute right-5 top-5" />
        <div className="brutal-surface w-full max-w-md p-6 sm:p-8">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-forest">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Về website
          </Link>
          <div className="mt-6 grid size-13 place-items-center rounded-md border-2 border-line bg-accent text-[#231f20] shadow-[4px_4px_0_var(--ds-shadow)]">
            <KeyRound className="size-5" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-ink">Đăng nhập Admin</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Chỉ tài khoản đã được thêm vào bảng <code className="rounded-sm border border-line bg-surface-alt px-1.5 py-0.5">admin_profiles</code> mới được phép truy cập.</p>

          {!configured && (
            <div className="mt-5 rounded-md border-2 border-line bg-accent p-3.5 text-sm leading-6 text-[#231f20] shadow-[3px_3px_0_var(--ds-shadow)]">Supabase chưa được cấu hình. Sao chép <code>.env.example</code> thành <code>.env.local</code> và điền thông tin dự án.</div>
          )}
          {error && (
            <div role="alert" className="mt-5 rounded-md border-2 border-line bg-pink p-3.5 text-sm font-semibold text-[#231f20] shadow-[3px_3px_0_var(--ds-shadow)]">{error === "callback" ? "Liên kết đăng nhập không hợp lệ hoặc đã hết hạn." : error}</div>
          )}

          <form action={loginAction} className="mt-6 space-y-4">
            <label className="block text-sm font-bold text-ink">Email Admin<Input name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="mt-2" /></label>
            <label className="block text-sm font-bold text-ink">Mật khẩu<Input name="password" type="password" autoComplete="current-password" required minLength={8} placeholder="••••••••" className="mt-2" /></label>
            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={!configured}>Đăng nhập an toàn</Button>
          </form>
        </div>
      </section>
    </main>
  );
}
