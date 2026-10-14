import type { MetadataRoute } from "next";

import { getCategories, getPublishedNotes } from "@/features/notes/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [notes, categories] = await Promise.all([getPublishedNotes(100), getCategories()]);

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/notes`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/categories`, changeFrequency: "weekly", priority: 0.7 },
    ...notes.map((note) => ({
      url: `${baseUrl}/notes/${note.slug}`,
      lastModified: note.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
