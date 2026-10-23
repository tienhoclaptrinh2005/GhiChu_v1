import "server-only";

import { getSiteSettings } from "@/features/site/queries";
import { requireAdmin } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import type {
  AdminNoteListItem,
  DashboardStats,
  MediaFileItem,
  ProfileMediaOption,
  QuickLinkIcon,
  QuickLinkItem,
  QuickLinksEditorData,
  QuickLinkTone,
  NoteStatus,
  SiteSettingsEditorData,
} from "@/types/domain";

const quickLinkIcons: QuickLinkIcon[] = [
  "link",
  "message-circle",
  "notebook-tabs",
  "folder-tree",
  "search",
  "send",
  "mail",
  "users",
  "sparkles",
];

const quickLinkTones: QuickLinkTone[] = ["blue", "amber", "pink", "green"];

function asRecord(value: Json): Record<string, Json | undefined> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, Json | undefined>;
  }
  return {};
}

function normalizeQuickLink(item: Json, index: number): QuickLinkItem | null {
  const record = asRecord(item);
  if (typeof record.title !== "string" || typeof record.href !== "string") return null;

  const icon = quickLinkIcons.includes(record.icon as QuickLinkIcon)
    ? (record.icon as QuickLinkIcon)
    : "link";
  const toneAliases: Record<string, QuickLinkTone> = {
    orange: "amber",
    rose: "pink",
    violet: "green",
  };
  const rawTone = typeof record.tone === "string" ? record.tone : "blue";
  const tone = quickLinkTones.includes(rawTone as QuickLinkTone)
    ? (rawTone as QuickLinkTone)
    : (toneAliases[rawTone] ?? "blue");
  const legacyExternal = record.external === true;

  return {
    id: typeof record.id === "string" ? record.id : `legacy-${index + 1}`,
    title: record.title,
    description: typeof record.description === "string" ? record.description : "",
    href: record.href,
    icon,
    tone,
    newTab: typeof record.newTab === "boolean" ? record.newTab : legacyExternal,
  };
}

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

export async function getAdminNotes({
  query = "",
  status = "ALL",
}: {
  query?: string;
  status?: NoteStatus | "ALL";
} = {}): Promise<AdminNoteListItem[]> {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const normalizedQuery = query.trim().slice(0, 100);

  let request = supabase
    .from("notes")
    .select(
      "id, title, slug, excerpt, status, is_pinned, published_at, updated_at, reading_time_minutes",
    )
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (status !== "ALL") request = request.eq("status", status);
  if (normalizedQuery) {
    request = request.textSearch("search_document", normalizedQuery, {
      config: "simple",
      type: "websearch",
    });
  }

  const { data, error } = await request;
  if (error) throw new Error("Không thể tìm kiếm ghi chú trong trang quản trị.");

  return (data ?? []).map((note) => ({
    id: note.id,
    title: note.title,
    slug: note.slug,
    excerpt: note.excerpt,
    status: note.status,
    isPinned: note.is_pinned,
    publishedAt: note.published_at,
    updatedAt: note.updated_at,
    readingTimeMinutes: note.reading_time_minutes,
  }));
}

export async function getQuickLinksEditorData(): Promise<QuickLinksEditorData> {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const { data: homePage, error: pageError } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", "home")
    .maybeSingle();

  if (pageError) throw new Error("Không thể tải cấu hình trang chủ.");
  if (!homePage) {
    return { blockId: null, blockName: "Liên kết nhanh", items: [] };
  }

  const { data: block, error: blockError } = await supabase
    .from("page_blocks")
    .select("id, name, content")
    .eq("page_id", homePage.id)
    .eq("type", "BUTTON")
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (blockError) throw new Error("Không thể tải danh sách liên kết nhanh.");
  if (!block) {
    return { blockId: null, blockName: "Liên kết nhanh", items: [] };
  }

  const content = asRecord(block.content);
  const items = Array.isArray(content.items)
    ? content.items.flatMap((item, index) => {
        const normalized = normalizeQuickLink(item, index);
        return normalized ? [normalized] : [];
      })
    : [];

  return {
    blockId: block.id,
    blockName: block.name,
    items,
  };
}

export async function getSiteSettingsEditorData(): Promise<SiteSettingsEditorData> {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const [settings, mediaResult] = await Promise.all([
    getSiteSettings(),
    supabase
      .from("media_files")
      .select("id, original_name, alt_text, width, height, size_bytes, folder")
      .in("folder", ["avatars", "banners"])
      .eq("status", "READY")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  if (mediaResult.error) {
    throw new Error("Không thể tải ảnh hồ sơ và ảnh bìa.");
  }

  const media = (mediaResult.data ?? []).flatMap((item) => {
    if (item.folder !== "avatars" && item.folder !== "banners") return [];
    return [{
      id: item.id,
      originalName: item.original_name,
      altText: item.alt_text,
      width: item.width,
      height: item.height,
      sizeBytes: item.size_bytes,
      folder: item.folder,
    } satisfies ProfileMediaOption];
  });

  return {
    settings,
    avatars: media.filter((item) => item.folder === "avatars"),
    banners: media.filter((item) => item.folder === "banners"),
  };
}
