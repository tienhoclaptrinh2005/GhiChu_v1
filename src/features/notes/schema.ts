import { z } from "zod";

import { slugify } from "@/lib/utils";

export const noteFormSchema = z.object({
  title: z.string().trim().min(3, "Tiêu đề cần ít nhất 3 ký tự.").max(160),
  slug: z
    .string()
    .trim()
    .max(180)
    .transform(slugify)
    .pipe(
      z
        .string()
        .min(3, "Đường dẫn cần ít nhất 3 ký tự.")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Đường dẫn chưa đúng định dạng."),
    ),
  excerpt: z.string().trim().max(320, "Mô tả ngắn tối đa 320 ký tự.").default(""),
  status: z.enum(["DRAFT", "PRIVATE", "PUBLIC", "ARCHIVED"]),
  isPinned: z.boolean().default(false),
  parentId: z.uuid().nullable().default(null),
  categoryIds: z.array(z.uuid()).max(10).default([]),
  content: z
    .record(z.string(), z.unknown())
    .refine(
      (value) => value.type === "doc" && Array.isArray(value.content),
      "Nội dung ghi chú chưa đúng định dạng.",
    ),
  changeSummary: z.string().trim().max(200).default(""),
  seoTitle: z.string().trim().max(70, "Tiêu đề SEO tối đa 70 ký tự.").nullable().default(null),
  seoDescription: z
    .string()
    .trim()
    .max(160, "Mô tả SEO tối đa 160 ký tự.")
    .nullable()
    .default(null),
});

export type NoteFormInput = z.input<typeof noteFormSchema>;
export type NoteFormValues = z.output<typeof noteFormSchema>;
