import type { Metadata } from "next";
import { ArrowLeft, BookMarked, KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/features/auth/actions";
import { getAdminUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const admin = await getAdminUser();
  if (admin) redirect("/admin");

  const { error } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main id="main-content" className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-28 top-1/4 size-80 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-28 right-0 size-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-3 font-bold">
          <span className="grid size-10 place-items-center rounded-xl bg-indigo-500"><BookMarked className="size-5" /></span>
          NoteSpace
        </Link>
        <div className="relative max-w-lg">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-300">Private dashboard</p>
          <h1 className="mt-4 text-5xl font-black tracking-[-0.05em]">Mọi nội dung, trong một nơi an toàn.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">Quản lý trang chủ, ghi chú, phiên bản và thư viện media mà không cần chỉnh source hay deploy lại.</p>
        </div>
        <div className="relative flex items-center gap-3 text-sm text-slate-400"><ShieldCheck className="size-5 text-emerald-400" />Xác thực Supabase + phân quyền server + RLS</div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"><ArrowLeft className="size-4" />Về website</Link>
          <div className="mt-8 grid size-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"><KeyRound className="size-5" /></div>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950">Đăng nhập Admin</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Chỉ tài khoản đã được thêm vào bảng <code className="rounded bg-slate-100 px-1.5 py-0.5">admin_profiles</code> mới được phép truy cập.</p>

          {!configured && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm leading-6 text-amber-800">Supabase chưa được cấu hình. Sao chép <code>.env.example</code> thành <code>.env.local</code> và điền thông tin dự án.</div>
          )}
          {error && (
            <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">{error === "callback" ? "Liên kết đăng nhập không hợp lệ hoặc đã hết hạn." : error}</div>
          )}

          <form action={loginAction} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Email Admin<Input name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="mt-2" /></label>
            <label className="block text-sm font-semibold text-slate-700">Mật khẩu<Input name="password" type="password" autoComplete="current-password" required minLength={8} placeholder="••••••••" className="mt-2" /></label>
            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={!configured}>Đăng nhập an toàn</Button>
          </form>
        </div>
      </section>
    </main>
  );
}
