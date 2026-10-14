import { z } from "zod";

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
