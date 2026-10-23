import { z } from "zod";

const allowedLinkPattern = /^(https?:\/\/|mailto:|tel:)/i;
const allowedQuickLinkPattern = /^(https?:\/\/|mailto:|tel:|\/(?!\/))/i;

export const socialLinkSchema = z.object({
  label: z.string().trim().min(1, "Liên kết cần có tên.").max(40),
  href: z
    .string()
    .trim()
    .min(1, "Liên kết cần có địa chỉ.")
    .max(500)
    .refine((value) => allowedLinkPattern.test(value), {
      message: "Địa chỉ phải bắt đầu bằng http://, https://, mailto: hoặc tel:.",
    }),
  icon: z.enum(["facebook", "send", "mail", "link"]).default("link"),
});

export const siteSettingsSchema = z.object({
  displayName: z.string().trim().min(2, "Tên hiển thị cần ít nhất 2 ký tự.").max(80),
  headline: z.string().trim().min(4, "Tiêu đề cần ít nhất 4 ký tự.").max(180),
  description: z.string().trim().min(4, "Mô tả cần ít nhất 4 ký tự.").max(600),
  avatarMediaId: z.union([z.uuid(), z.literal("")]),
  backgroundMediaId: z.union([z.uuid(), z.literal("")]),
  socialLinks: z.array(socialLinkSchema).max(8, "Chỉ nên hiển thị tối đa 8 liên kết ngoài."),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

export const quickLinkSchema = z.object({
  id: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1, "Liên kết cần có tên.").max(80),
  description: z.string().trim().max(180, "Mô tả tối đa 180 ký tự."),
  href: z
    .string()
    .trim()
    .min(1, "Liên kết cần có địa chỉ.")
    .max(500)
    .refine((value) => allowedQuickLinkPattern.test(value), {
      message:
        "Địa chỉ phải là đường dẫn nội bộ /..., http://, https://, mailto: hoặc tel:.",
    }),
  icon: z.enum([
    "link",
    "message-circle",
    "notebook-tabs",
    "folder-tree",
    "search",
    "send",
    "mail",
    "users",
    "sparkles",
  ]),
  tone: z.enum(["blue", "amber", "pink", "green"]),
  newTab: z.boolean(),
});

export const quickLinksEditorSchema = z.object({
  blockName: z
    .string()
    .trim()
    .min(2, "Tên khu vực cần ít nhất 2 ký tự.")
    .max(100),
  items: z.array(quickLinkSchema).max(12, "Chỉ hiển thị tối đa 12 liên kết nhanh."),
});

export type QuickLinksEditorInput = z.infer<typeof quickLinksEditorSchema>;

export const pageBlockSchema = z.object({
  pageId: z.uuid(),
  type: z.enum([
    "TEXT",
    "HEADING",
    "BUTTON",
    "IMAGE",
    "BANNER",
    "VIDEO",
    "CARD",
    "DIVIDER",
    "NOTE_LIST",
    "SOCIAL_LINKS",
  ]),
  name: z.string().trim().min(2).max(100),
  content: z.record(z.string(), z.unknown()),
  styles: z.record(z.string(), z.unknown()).default({}),
  position: z.number().int().min(0),
  isActive: z.boolean().default(true),
});

export type PageBlockInput = z.infer<typeof pageBlockSchema>;
