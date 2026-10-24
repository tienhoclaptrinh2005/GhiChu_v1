import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import { demoCategories, demoNoteDetails, demoNotes } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import type { Json } from "@/types/database";
import type {
  CategorySummary,
  NoteDetail,
  NoteSummary,
  TiptapNode,
} from "@/types/domain";

function asTiptapDocument(value: Json): TiptapNode {
  if (value && typeof value === "object" && !Array.isArray(value) && "type" in value) {
    return value as unknown as TiptapNode;
  }
  return { type: "doc", content: [] };
}

async function getCategoryMap(noteIds: string[]) {
  const result = new Map<string, CategorySummary[]>();
  noteIds.forEach((id) => result.set(id, []));
  if (noteIds.length === 0) return result;

  const supabase = createPublicSupabaseClient();
  const { data: relations, error: relationsError } = await supabase
    .from("note_categories")
    .select("note_id, category_id")
    .in("note_id", noteIds);

  if (relationsError) throw relationsError;
  const categoryIds = [...new Set((relations ?? []).map((item) => item.category_id))];
  if (categoryIds.length === 0) return result;

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug, description, color")
    .in("id", categoryIds)
    .eq("is_active", true);

  if (categoriesError) throw categoriesError;
  const byId = new Map(
    (categories ?? []).map((category) => [
      category.id,
      {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
        noteCount: 0,
      } satisfies CategorySummary,
    ]),
  );

  for (const relation of relations ?? []) {
    const category = byId.get(relation.category_id);
    if (category) result.get(relation.note_id)?.push(category);
  }

  return result;
}

function isViewStatsUnavailable(error: { code?: string }) {
  return error.code === "PGRST205" || error.code === "42P01";
}

async function getViewCountMap(noteIds: string[]) {
  const result = new Map<string, number>();
  noteIds.forEach((id) => result.set(id, 0));
  if (noteIds.length === 0) return result;

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("note_view_stats")
    .select("note_id, view_count")
    .in("note_id", noteIds);

  // Keeps a rolling deploy readable until the database migration is applied.
  if (error) {
    if (isViewStatsUnavailable(error)) return result;
    throw error;
  }

  for (const item of data ?? []) {
    result.set(item.note_id, Number(item.view_count) || 0);
  }

  return result;
}

async function loadPublishedNotes(limit = 24): Promise<NoteSummary[]> {
  if (!isSupabaseConfigured()) return demoNotes.slice(0, limit);

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("notes")
    .select(
      "id, title, slug, excerpt, status, is_pinned, published_at, updated_at, reading_time_minutes",
    )
    .eq("status", "PUBLIC")
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));

  if (error) throw error;

  const noteIds = (data ?? []).map((note) => note.id);
  const [categoriesByNote, viewCountsByNote] = await Promise.all([
    getCategoryMap(noteIds),
    getViewCountMap(noteIds),
  ]);

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
    viewCount: viewCountsByNote.get(note.id) ?? 0,
    categories: categoriesByNote.get(note.id) ?? [],
  }));
}

const getCachedPublishedNotes = unstable_cache(
  loadPublishedNotes,
  ["published-notes-v1"],
  { revalidate: 300, tags: ["published-notes"] },
);

export const getPublishedNotes = cache(getCachedPublishedNotes);

async function loadPinnedPublishedNotes(limit = 4): Promise<NoteSummary[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 4);
  if (!isSupabaseConfigured()) {
    return demoNotes
      .filter((note) => note.status === "PUBLIC" && note.isPinned)
      .sort((first, second) =>
        (second.publishedAt ?? second.updatedAt).localeCompare(
          first.publishedAt ?? first.updatedAt,
        ),
      )
      .slice(0, safeLimit);
  }

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("notes")
    .select(
      "id, title, slug, excerpt, status, is_pinned, published_at, updated_at, reading_time_minutes",
    )
    .eq("status", "PUBLIC")
    .eq("is_pinned", true)
    .is("deleted_at", null)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .limit(safeLimit);

  if (error) throw error;

  const noteIds = (data ?? []).map((note) => note.id);
  const [categoriesByNote, viewCountsByNote] = await Promise.all([
    getCategoryMap(noteIds),
    getViewCountMap(noteIds),
  ]);
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
    viewCount: viewCountsByNote.get(note.id) ?? 0,
    categories: categoriesByNote.get(note.id) ?? [],
  }));
}

const getCachedPinnedPublishedNotes = unstable_cache(
  loadPinnedPublishedNotes,
  ["pinned-published-notes-v1"],
  { revalidate: 300, tags: ["published-notes"] },
);

export const getPinnedPublishedNotes = cache(getCachedPinnedPublishedNotes);

async function loadPublishedNoteBySlug(slug: string): Promise<NoteDetail | null> {
  if (!isSupabaseConfigured()) return demoNoteDetails[slug] ?? null;

  const supabase = createPublicSupabaseClient();
  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("slug", slug)
    .eq("status", "PUBLIC")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  if (!note?.published_version_id) return null;

  const { data: version, error: versionError } = await supabase
    .from("note_versions")
    .select("version_number, content")
    .eq("id", note.published_version_id)
    .eq("note_id", note.id)
    .maybeSingle();

  if (versionError) throw versionError;
  if (!version) return null;

  const [categoriesByNote, viewCountsByNote] = await Promise.all([
    getCategoryMap([note.id]),
    getViewCountMap([note.id]),
  ]);

  return {
    id: note.id,
    title: note.title,
    slug: note.slug,
    excerpt: note.excerpt,
    status: note.status,
    isPinned: note.is_pinned,
    publishedAt: note.published_at,
    updatedAt: note.updated_at,
    readingTimeMinutes: note.reading_time_minutes,
    viewCount: viewCountsByNote.get(note.id) ?? 0,
    categories: categoriesByNote.get(note.id) ?? [],
    content: asTiptapDocument(version.content),
    versionNumber: version.version_number,
    seoTitle: note.seo_title,
    seoDescription: note.seo_description,
  };
}

const getCachedPublishedNoteBySlug = unstable_cache(
  loadPublishedNoteBySlug,
  ["published-note-v1"],
  { revalidate: 300, tags: ["published-notes"] },
);

export const getPublishedNoteBySlug = cache(getCachedPublishedNoteBySlug);

async function loadCategories(): Promise<CategorySummary[]> {
  if (!isSupabaseConfigured()) return demoCategories;

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, color")
    .eq("is_active", true)
    .order("position", { ascending: true });

  if (error) throw error;

  const { data: relations, error: relationsError } = await supabase
    .from("note_categories")
    .select("category_id");

  if (relationsError) throw relationsError;
  const counts = (relations ?? []).reduce<Map<string, number>>((map, relation) => {
    map.set(relation.category_id, (map.get(relation.category_id) ?? 0) + 1);
    return map;
  }, new Map());

  return (data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    color: category.color,
    noteCount: counts.get(category.id) ?? 0,
  }));
}

const getCachedCategories = unstable_cache(
  loadCategories,
  ["public-categories-v1"],
  { revalidate: 300, tags: ["published-notes", "categories"] },
);

export const getCategories = cache(getCachedCategories);

export async function searchPublishedNotes(query: string) {
  const normalized = query.trim().toLocaleLowerCase("vi-VN").slice(0, 100);
  if (!normalized) return [];

  const notes = await getPublishedNotes(100);
  return notes.filter((note) =>
    `${note.title} ${note.excerpt}`.toLocaleLowerCase("vi-VN").includes(normalized),
  );
}
