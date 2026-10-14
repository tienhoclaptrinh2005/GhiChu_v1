export type NoteStatus = "DRAFT" | "PRIVATE" | "PUBLIC" | "ARCHIVED";
export type PageStatus = "DRAFT" | "PUBLISHED";
export type BlockType =
  | "TEXT"
  | "HEADING"
  | "BUTTON"
  | "IMAGE"
  | "BANNER"
  | "VIDEO"
  | "CARD"
  | "DIVIDER"
  | "NOTE_LIST"
  | "SOCIAL_LINKS";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue | undefined }
  | JsonValue[];

export interface SiteSettings {
  displayName: string;
  headline: string;
  description: string;
  avatarUrl: string | null;
  backgroundImageUrl: string | null;
  theme: {
    accent: string;
    radius: "soft" | "rounded" | "pill";
    mode: "light" | "dark" | "system";
  };
  socialLinks: Array<{
    label: string;
    href: string;
    icon: string;
  }>;
}

export interface PageBlock {
  id: string;
  type: BlockType;
  name: string;
  content: Record<string, JsonValue | undefined>;
  styles: Record<string, JsonValue | undefined>;
  position: number;
  isActive: boolean;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  noteCount: number;
}

export interface NoteSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: NoteStatus;
  isPinned: boolean;
  publishedAt: string | null;
  updatedAt: string;
  readingTimeMinutes: number;
  categories: CategorySummary[];
}

export interface TiptapMark {
  type: string;
  attrs?: Record<string, JsonValue | undefined>;
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, JsonValue | undefined>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

export interface NoteDetail extends NoteSummary {
  content: TiptapNode;
  versionNumber: number;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface DashboardStats {
  totalNotes: number;
  publicNotes: number;
  privateNotes: number;
  draftNotes: number;
  activeBlocks: number;
  mediaFiles: number;
}
