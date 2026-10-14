import type { Metadata } from "next";
import { Search } from "lucide-react";

import { NoteCard } from "@/components/public/note-card";
import { Input } from "@/components/ui/input";
import { searchPublishedNotes } from "@/features/notes/queries";

export const metadata: Metadata = { title: "Tìm kiếm", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const notes = q ? await searchPublishedNotes(q) : [];
  return (
    <main id="main-content" className="mx-auto min-h-[70vh] max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Tra cứu</p>
      <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-slate-950">Tìm ghi chú</h1>
      <form action="/search" className="relative mt-6 max-w-2xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input name="q" defaultValue={q} maxLength={100} placeholder="Nhập tiêu đề hoặc từ khóa…" className="h-13 rounded-2xl pl-11 pr-28 text-base shadow-sm" />
        <button type="submit" className="absolute right-1.5 top-1.5 h-10 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">Tìm kiếm</button>
      </form>
      {q && (
        <p className="mt-7 text-sm text-slate-500">Tìm thấy <strong className="text-slate-800">{notes.length}</strong> kết quả cho “{q}”.</p>
      )}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{notes.map((note) => <NoteCard key={note.id} note={note} />)}</div>
    </main>
  );
}
