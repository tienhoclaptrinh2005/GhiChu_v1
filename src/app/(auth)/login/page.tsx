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
      <section className="voxel-landscape relative hidden overflow-hidden border-r-[3px] border-line p-12 text-ink lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="relative z-[3] flex items-center gap-3 font-display font-bold">
          <span className="voxel-icon grid size-11 place-items-center bg-accent text-[#10212b]">
            <BookMarked className="size-5" aria-hidden="true" />
          </span>
          GhiChu_v1
        </Link>
        <div className="voxel-panel relative z-[3] max-w-xl bg-surface/95 p-8">
          <p className="retro-label">Private dashboard</p>
          <h1 className="voxel-title mt-5 text-5xl">Mọi nội dung, trong một nơi an toàn.</h1>
          <p className="mt-5 text-lg leading-8 text-muted">Quản lý trang chủ, ghi chú, phiên bản và thư viện media mà không cần chỉnh source hay deploy lại.</p>
        </div>
        <div className="voxel-panel relative z-[3] flex items-center gap-3 bg-surface/95 p-4 text-sm font-semibold text-muted">
          <ShieldCheck className="size-5 text-forest" aria-hidden="true" />
          Xác thực Supabase + phân quyền server + RLS
        </div>
        <span className="grass-block absolute bottom-10 right-10 z-[2] size-20" aria-hidden="true" />
      </section>

      <section className="relative flex items-center justify-center px-5 py-16 sm:px-10">
        <ThemeToggle className="absolute right-5 top-5" />
        <div className="voxel-panel w-full max-w-md p-6 sm:p-8">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-forest">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Về website
          </Link>
          <div className="voxel-icon mt-6 grid size-13 place-items-center bg-accent text-[#10212b]">
            <KeyRound className="size-5" aria-hidden="true" />
          </div>
          <h2 className="voxel-title mt-6 text-3xl text-ink">Đăng nhập Admin</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Chỉ tài khoản đã được thêm vào bảng <code className="rounded-sm border border-line bg-surface-alt px-1.5 py-0.5">admin_profiles</code> mới được phép truy cập.</p>

          {!configured && (
            <div className="mt-5 rounded-sm border-[3px] border-line bg-accent p-3.5 text-sm leading-6 text-[#10212b] shadow-[3px_3px_0_var(--ds-shadow)]">Supabase chưa được cấu hình. Sao chép <code>.env.example</code> thành <code>.env.local</code> và điền thông tin dự án.</div>
          )}
          {error && (
            <div role="alert" className="mt-5 rounded-sm border-[3px] border-line bg-pink p-3.5 text-sm font-semibold text-[#10212b] shadow-[3px_3px_0_var(--ds-shadow)]">{error === "callback" ? "Liên kết đăng nhập không hợp lệ hoặc đã hết hạn." : error}</div>
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
