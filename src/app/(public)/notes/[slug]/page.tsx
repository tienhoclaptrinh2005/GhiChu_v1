import type { Metadata } from "next";
import { ArrowLeft, Clock3, History } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TiptapRenderer } from "@/components/public/tiptap-renderer";
import { Badge } from "@/components/ui/badge";
import { getPublishedNoteBySlug } from "@/features/notes/queries";
import { formatDate } from "@/lib/utils";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = await getPublishedNoteBySlug(slug);
  if (!note) return { title: "Không tìm thấy ghi chú" };
  return {
    title: note.seoTitle || note.title,
    description: note.seoDescription || note.excerpt,
  };
}

export default async function NoteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const note = await getPublishedNoteBySlug(slug);
  if (!note) notFound();

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/notes" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-forest">
        <ArrowLeft className="size-4" />
        Tất cả ghi chú
      </Link>
      <article className="mt-5 overflow-hidden rounded-xl border-2 border-line bg-surface shadow-[8px_8px_0_var(--ds-shadow)]">
        <header className="pixel-corners border-b-2 border-line bg-surface-alt px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-wrap gap-2">
            {note.categories.map((category) => <Badge key={category.id} tone="indigo">{category.name}</Badge>)}
            {note.isPinned && <Badge tone="amber">Đã ghim</Badge>}
          </div>
          <h1 className="mt-5 text-balance text-3xl font-bold tracking-[-0.04em] text-ink sm:text-5xl">{note.title}</h1>
          <p className="mt-4 text-lg leading-8 text-muted">{note.excerpt}</p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t-2 border-dashed border-line/30 pt-4 font-display text-xs font-semibold text-muted">
            <span>Cập nhật {formatDate(note.updatedAt)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" />{note.readingTimeMinutes} phút đọc</span>
            <span className="inline-flex items-center gap-1.5"><History className="size-3.5" />Phiên bản {note.versionNumber}</span>
          </div>
        </header>
        <TiptapRenderer document={note.content} className="px-6 py-8 sm:px-10 sm:py-10" />
      </article>
    </main>
  );
}
