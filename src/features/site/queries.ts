import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import { demoHomeBlocks, demoSiteSettings } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/env";
import { getPublicMediaUrl } from "@/lib/media/public-url";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { Json } from "@/types/database";
import type { PageBlock, SiteSettings } from "@/types/domain";

export const SITE_SETTINGS_CACHE_TAG = "site-settings";
export const HOME_BLOCKS_CACHE_TAG = "home-blocks";

function asRecord(value: Json): Record<string, Json | undefined> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, Json | undefined>;
  }
  return {};
}

type PublicMediaReference = {
  id: string;
  object_key: string;
  folder: string;
};

function mapSiteSettings(
  data: {
    display_name: string;
    headline: string;
    description: string;
    avatar_media_id: string | null;
    background_media_id: string | null;
    theme: Json;
    social_links: Json;
  },
  avatar: PublicMediaReference | null,
  background: PublicMediaReference | null,
): SiteSettings {
  const theme = asRecord(data.theme);
  const socialLinks = Array.isArray(data.social_links) ? data.social_links : [];

  return {
    displayName: data.display_name,
    headline: data.headline,
    description: data.description,
    avatarMediaId: avatar?.id ?? null,
    avatarUrl: avatar ? getPublicMediaUrl(avatar.object_key) : null,
    backgroundMediaId: background?.id ?? null,
    backgroundImageUrl: background ? getPublicMediaUrl(background.object_key) : null,
    theme: {
      accent: typeof theme.accent === "string" ? theme.accent : "#5b5cf0",
      radius:
        theme.radius === "soft" || theme.radius === "pill"
          ? theme.radius
          : "rounded",
      mode:
        theme.mode === "dark" || theme.mode === "system"
          ? theme.mode
          : "light",
    },
    socialLinks: socialLinks.flatMap((item) => {
      const record = asRecord(item);
      if (
        typeof record.label !== "string" ||
        typeof record.href !== "string" ||
        typeof record.icon !== "string"
      ) {
        return [];
      }
      return [{ label: record.label, href: record.href, icon: record.icon }];
    }),
  };
}

async function loadSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return demoSiteSettings;

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .eq("is_public", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return demoSiteSettings;

  const selectedIds = [data.avatar_media_id, data.background_media_id].filter(
    (id): id is string => Boolean(id),
  );
  const mediaById = new Map<string, PublicMediaReference>();

  if (selectedIds.length) {
    const { data: selectedMedia, error: selectedMediaError } = await supabase
      .from("media_files")
      .select("id, object_key, folder")
      .in("id", selectedIds)
      .eq("status", "READY")
      .eq("visibility", "PUBLIC")
      .is("deleted_at", null);
    if (selectedMediaError) throw selectedMediaError;
    for (const media of selectedMedia ?? []) mediaById.set(media.id, media);
  }

  let avatar = data.avatar_media_id
    ? mediaById.get(data.avatar_media_id) ?? null
    : null;
  if (!avatar || avatar.folder !== "avatars") {
    const { data: latestAvatar } = await supabase
      .from("media_files")
      .select("id, object_key, folder")
      .eq("folder", "avatars")
      .eq("status", "READY")
      .eq("visibility", "PUBLIC")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    avatar = latestAvatar ?? null;
  }

  const background = data.background_media_id
    ? mediaById.get(data.background_media_id) ?? null
    : null;

  return mapSiteSettings(
    data,
    avatar,
    background?.folder === "banners" ? background : null,
  );
}

const getCachedSiteSettings = unstable_cache(
  loadSiteSettings,
  ["public-site-settings-v2"],
  { revalidate: 300, tags: [SITE_SETTINGS_CACHE_TAG] },
);

export const getSiteSettings = cache(getCachedSiteSettings);

async function loadHomeBlocks(): Promise<PageBlock[]> {
  if (!isSupabaseConfigured()) return demoHomeBlocks;

  const supabase = createPublicSupabaseClient();
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", "home")
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (pageError) throw pageError;
  if (!page) return [];

  const { data, error } = await supabase
    .from("page_blocks")
    .select("*")
    .eq("page_id", page.id)
    .eq("is_active", true)
    .order("position", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((block) => ({
    id: block.id,
    type: block.type,
    name: block.name,
    content: asRecord(block.content),
    styles: asRecord(block.styles),
    position: block.position,
    isActive: block.is_active,
  }));
}

const getCachedHomeBlocks = unstable_cache(
  loadHomeBlocks,
  ["public-home-blocks-v1"],
  { revalidate: 300, tags: [HOME_BLOCKS_CACHE_TAG] },
);

export const getHomeBlocks = cache(getCachedHomeBlocks);
