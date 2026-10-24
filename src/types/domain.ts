export type NoteStatus = "DRAFT" | "PRIVATE" | "PUBLIC" | "ARCHIVED";
export type PageStatus = "DRAFT" | "PUBLISHED";
export type MediaStatus = "PENDING" | "READY" | "FAILED" | "DELETED";
export type MediaVisibility = "PUBLIC" | "PRIVATE";
export type QuickLinkIcon =
  | "link"
  | "message-circle"
  | "notebook-tabs"
  | "folder-tree"
  | "search"
  | "send"
  | "mail"
  | "users"
  | "sparkles";
export type QuickLinkTone = "blue" | "amber" | "pink" | "green";
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
  avatarMediaId: string | null;
  avatarUrl: string | null;
  backgroundMediaId: string | null;
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

export interface ProfileMediaOption {
  id: string;
  originalName: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  sizeBytes: number;
  folder: "avatars" | "banners";
}

export interface SiteSettingsEditorData {
  settings: SiteSettings;
  avatars: ProfileMediaOption[];
  banners: ProfileMediaOption[];
}

export interface QuickLinkItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: QuickLinkIcon;
  tone: QuickLinkTone;
  newTab: boolean;
}

export interface QuickLinksEditorData {
  blockId: string | null;
  blockName: string;
  items: QuickLinkItem[];
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
  viewCount: number;
  categories: CategorySummary[];
}

export interface AdminNoteListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: NoteStatus;
  isPinned: boolean;
  publishedAt: string | null;
  updatedAt: string;
  readingTimeMinutes: number;
  viewCount: number;
  deletedAt: string | null;
}

export interface AdminCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  parentId: string | null;
  parentName: string | null;
  position: number;
  isActive: boolean;
  noteCount: number;
  childCount: number;
}

export interface AdminNoteCategoryOption {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export interface AdminNoteParentOption {
  id: string;
  title: string;
  status: NoteStatus;
}

export interface AdminNoteEditorValue {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: NoteStatus;
  isPinned: boolean;
  parentId: string | null;
  categoryIds: string[];
  content: TiptapNode;
  versionNumber: number;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string | null;
}

export interface AdminNoteEditorData {
  note: AdminNoteEditorValue | null;
  categories: AdminNoteCategoryOption[];
  parentNotes: AdminNoteParentOption[];
}

export interface AdminNoteVersionItem {
  id: string;
  versionNumber: number;
  title: string;
  plainText: string;
  changeSummary: string | null;
  createdAt: string;
  isCurrent: boolean;
  isPublished: boolean;
}

export interface AdminNoteHistoryData {
  note: {
    id: string;
    title: string;
    slug: string;
    status: NoteStatus;
  };
  versions: AdminNoteVersionItem[];
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

export interface MediaFileItem {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  folder: string;
  status: MediaStatus;
  visibility: MediaVisibility;
  failureReason: string | null;
  createdAt: string;
}
