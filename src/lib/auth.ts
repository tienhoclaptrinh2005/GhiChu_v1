import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { getServerEnv, isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const getAdminUser = cache(async function getAdminUser() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { ADMIN_EMAIL } = getServerEnv();
  if (user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return null;

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id, user_id, email, display_name, role, is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!profile || profile.role !== "ADMIN") return null;

  return { user, profile };
});

export async function requireAdmin() {
  const admin = await getAdminUser();
  if (!admin) redirect("/login");
  return admin;
}
