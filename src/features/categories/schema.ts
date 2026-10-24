import { z } from "zod";

import { slugify } from "@/lib/utils";

export const categoryFormSchema = z.object({
  categoryId: z.uuid().nullable().default(null),
  name: z.string().trim().min(2, "Tên danh mục cần ít nhất 2 ký tự.").max(80),
  slug: z
    .string()
    .trim()
    .max(120)
    .transform(slugify)
    .pipe(
      z
        .string()
        .min(2, "Đường dẫn cần ít nhất 2 ký tự.")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Đường dẫn chưa đúng định dạng."),
    ),
  description: z.string().trim().max(320, "Mô tả tối đa 320 ký tự.").default(""),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Màu phải có dạng #RRGGBB."),
  parentId: z.uuid().nullable().default(null),
  position: z.coerce.number().int().min(0).max(10_000),
  isActive: z.boolean().default(false),
});

export type CategoryFormValues = z.output<typeof categoryFormSchema>;
