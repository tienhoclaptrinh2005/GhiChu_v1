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
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/notes" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600">
        <ArrowLeft className="size-4" />
        Tất cả ghi chú
      </Link>
      <article className="mt-6 overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_26px_90px_-50px_rgba(15,23,42,0.38)] backdrop-blur-xl">
        <header className="border-b border-slate-100 px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-wrap gap-2">
            {note.categories.map((category) => <Badge key={category.id} tone="indigo">{category.name}</Badge>)}
            {note.isPinned && <Badge tone="amber">Đã ghim</Badge>}
          </div>
          <h1 className="mt-4 text-balance text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">{note.title}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">{note.excerpt}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-slate-400">
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
