import "server-only";

import { cache } from "react";

import { demoHomeBlocks, demoSiteSettings } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { Json } from "@/types/database";
import type { PageBlock, SiteSettings } from "@/types/domain";

function asRecord(value: Json): Record<string, Json | undefined> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, Json | undefined>;
  }
  return {};
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
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

  const theme = asRecord(data.theme);
  const socialLinks = Array.isArray(data.social_links) ? data.social_links : [];

  return {
    displayName: data.display_name,
    headline: data.headline,
    description: data.description,
    avatarUrl: data.avatar_url,
    backgroundImageUrl: data.background_image_url,
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
});

export const getHomeBlocks = cache(async (): Promise<PageBlock[]> => {
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
});
