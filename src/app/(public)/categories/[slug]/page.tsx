import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { NoteCard } from "@/components/public/note-card";
import { getCategories, getPublishedNotes } from "@/features/notes/queries";

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [categories, notes] = await Promise.all([getCategories(), getPublishedNotes(100)]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const filtered = notes.filter((note) => note.categories.some((item) => item.slug === slug));

  return (
    <main id="main-content" className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/categories" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-forest"><ArrowLeft className="size-4" />Danh mục</Link>
      <div className="section-rule mt-5 pb-8">
        <span className="block size-4 border-[3px] border-line shadow-[2px_2px_0_var(--ds-shadow)]" style={{ backgroundColor: category.color }} />
        <h1 className="voxel-title mt-4 text-4xl text-ink sm:text-5xl">{category.name}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted">{category.description}</p>
      </div>
      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((note) => <NoteCard key={note.id} note={note} />)}</div>
      ) : (
        <p className="empty-state mt-10 p-8 text-center text-sm text-muted">Chưa có ghi chú công khai trong danh mục này.</p>
      )}
    </main>
  );
}
