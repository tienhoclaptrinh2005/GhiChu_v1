import { z } from "zod";

import { slugify } from "@/lib/utils";

export const noteFormSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(180)
    .transform(slugify),
  excerpt: z.string().trim().max(320).default(""),
  status: z.enum(["DRAFT", "PRIVATE", "PUBLIC", "ARCHIVED"]),
  isPinned: z.boolean().default(false),
  parentId: z.uuid().nullable().default(null),
  categoryIds: z.array(z.uuid()).max(10).default([]),
  content: z.record(z.string(), z.unknown()),
  seoTitle: z.string().trim().max(70).nullable().default(null),
  seoDescription: z.string().trim().max(160).nullable().default(null),
});

export type NoteFormInput = z.input<typeof noteFormSchema>;
export type NoteFormValues = z.output<typeof noteFormSchema>;
