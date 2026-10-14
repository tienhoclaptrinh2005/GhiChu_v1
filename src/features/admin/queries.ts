import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DashboardStats } from "@/types/domain";

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createServerSupabaseClient();
  const [total, publicNotes, privateNotes, draftNotes, blocks, media] = await Promise.all([
    supabase.from("notes").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("notes").select("id", { count: "exact", head: true }).eq("status", "PUBLIC").is("deleted_at", null),
    supabase.from("notes").select("id", { count: "exact", head: true }).eq("status", "PRIVATE").is("deleted_at", null),
    supabase.from("notes").select("id", { count: "exact", head: true }).eq("status", "DRAFT").is("deleted_at", null),
    supabase.from("page_blocks").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("media_files").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalNotes: total.count ?? 0,
    publicNotes: publicNotes.count ?? 0,
    privateNotes: privateNotes.count ?? 0,
    draftNotes: draftNotes.count ?? 0,
    activeBlocks: blocks.count ?? 0,
    mediaFiles: media.count ?? 0,
  };
}
