import type { Metadata } from "next";
import { Search } from "lucide-react";
import Link from "next/link";

import { NoteCard } from "@/components/public/note-card";
import { getPublishedNotes } from "@/features/notes/queries";

export const metadata: Metadata = {
  title: "Ghi chú",
  description: "Tất cả ghi chú công khai, được sắp xếp theo thời gian cập nhật.",
};

export default async function NotesPage() {
  const notes = await getPublishedNotes();
  return (
    <main id="main-content" className="mx-auto min-h-[70vh] max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Thư viện</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-slate-950">Tất cả ghi chú</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Những bài viết ngắn, tài liệu thực hành và checklist mình muốn tìm lại thật nhanh.</p>
        </div>
        <Link href="/search" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-slate-300">
          <Search className="size-4" />
          Tìm ghi chú
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => <NoteCard key={note.id} note={note} />)}
      </div>
    </main>
  );
}
