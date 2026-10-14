import { ArrowUpRight, Clock3, Pin } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { NoteSummary } from "@/types/domain";

export function NoteCard({ note, compact = false }: { note: NoteSummary; compact?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {note.categories.slice(0, 2).map((category) => (
            <Badge key={category.id} tone="indigo">
              {category.name}
            </Badge>
          ))}
          {note.categories.length === 0 && <Badge>Ghi chú</Badge>}
        </div>
        {note.isPinned && (
          <span title="Đã ghim" className="text-amber-500">
            <Pin className="size-4 fill-current" aria-hidden="true" />
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold leading-snug tracking-tight text-slate-950 group-hover:text-indigo-700">
        <Link href={`/notes/${note.slug}`} className="after:absolute after:inset-0">
          {note.title}
        </Link>
      </h2>
      {!compact && (
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{note.excerpt}</p>
      )}
      <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs font-medium text-slate-400">
        <span>{formatDate(note.publishedAt)}</span>
        <span className="flex items-center gap-1.5">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {note.readingTimeMinutes} phút
          <ArrowUpRight className="ml-1 size-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
