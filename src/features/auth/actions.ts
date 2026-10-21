"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getServerEnv, isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(200),
});

function loginError(message: string): never {
  redirect(`/login?error=${encodeURIComponent(message)}`);
}

export async function loginAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    loginError("Hãy cấu hình Supabase trong .env.local trước khi đăng nhập.");
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) loginError("Email hoặc mật khẩu không hợp lệ.");

  const env = getServerEnv();
  if (parsed.data.email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
    loginError("Tài khoản không có quyền quản trị.");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) loginError("Không thể đăng nhập với thông tin đã nhập.");

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role, is_active")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!profile?.is_active || profile.role !== "ADMIN") {
    await supabase.auth.signOut();
    loginError("Tài khoản chưa được cấp quyền quản trị.");
  }

  redirect("/admin");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
