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
    <main id="main-content" className="mx-auto min-h-[70vh] max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/categories" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"><ArrowLeft className="size-4" />Danh mục</Link>
      <div className="mt-6 border-b border-slate-200 pb-8">
        <span className="block size-3 rounded-full" style={{ backgroundColor: category.color }} />
        <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-slate-950">{category.name}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">{category.description}</p>
      </div>
      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((note) => <NoteCard key={note.id} note={note} />)}</div>
      ) : (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">Chưa có ghi chú công khai trong danh mục này.</p>
      )}
    </main>
  );
}
