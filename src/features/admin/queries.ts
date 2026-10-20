import "server-only";

import { requireAdmin } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DashboardStats, MediaFileItem } from "@/types/domain";

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createServerSupabaseClient();
  const [total, publicNotes, privateNotes, draftNotes, blocks, media] = await Promise.all([
    supabase.from("notes").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("notes").select("id", { count: "exact", head: true }).eq("status", "PUBLIC").is("deleted_at", null),
    supabase.from("notes").select("id", { count: "exact", head: true }).eq("status", "PRIVATE").is("deleted_at", null),
    supabase.from("notes").select("id", { count: "exact", head: true }).eq("status", "DRAFT").is("deleted_at", null),
    supabase.from("page_blocks").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("media_files")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .neq("status", "DELETED"),
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

export async function getAdminMediaFiles(): Promise<MediaFileItem[]> {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("media_files")
    .select(
      "id, original_name, mime_type, size_bytes, width, height, alt_text, folder, status, visibility, failure_reason, created_at",
    )
    .is("deleted_at", null)
    .neq("status", "DELETED")
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) throw new Error("Không thể tải thư viện media.");

  return (data ?? []).map((item) => ({
    id: item.id,
    originalName: item.original_name,
    mimeType: item.mime_type,
    sizeBytes: item.size_bytes,
    width: item.width,
    height: item.height,
    altText: item.alt_text,
    folder: item.folder,
    status: item.status,
    visibility: item.visibility,
    failureReason: item.failure_reason,
    createdAt: item.created_at,
  }));
}
