import {
  ArrowRight,
  ExternalLink,
  FolderTree,
  MessageCircle,
  NotebookTabs,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { NoteCard } from "@/components/public/note-card";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { JsonValue, NoteSummary, PageBlock } from "@/types/domain";

function text(value: JsonValue | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function number(value: JsonValue | undefined, fallback: number) {
  return typeof value === "number" ? value : fallback;
}

function icon(name: string) {
  const Icon =
    name === "message-circle"
      ? MessageCircle
      : name === "folder-tree"
        ? FolderTree
        : name === "sparkles"
          ? Sparkles
          : NotebookTabs;
  return <Icon className="size-5" aria-hidden="true" />;
}

function LinkButtons({ block }: { block: PageBlock }) {
  const items = Array.isArray(block.content.items) ? block.content.items : [];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return null;
        const title = text(item.title, "Liên kết");
        const href = text(item.href, "#");
        const external = item.external === true;
        const content = (
          <>
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-indigo-600 group-hover:text-white">
              {icon(text(item.icon))}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-slate-950">{title}</span>
              <span className="mt-1 block text-sm leading-5 text-slate-500">
                {text(item.description)}
              </span>
            </span>
            {external ? (
              <ExternalLink className="size-4 text-slate-400" aria-hidden="true" />
            ) : (
              <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1" aria-hidden="true" />
            )}
          </>
        );
        const className =
          "group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-950/5";

        return external ? (
          <a key={`${title}-${index}`} href={href} target="_blank" rel="noreferrer" className={className}>
            {content}
          </a>
        ) : (
          <Link key={`${title}-${index}`} href={href} className={className}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}

export function BlockRenderer({ block, notes }: { block: PageBlock; notes: NoteSummary[] }) {
  if (!block.isActive) return null;

  if (block.type === "BANNER") {
    return (
      <Card className="overflow-hidden border-indigo-100 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 text-white">
        <CardContent className="relative p-6 sm:p-8">
          <div className="absolute -right-10 -top-14 size-40 rounded-full border-[24px] border-white/10" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-100">
            {text(block.content.eyebrow)}
          </p>
          <h2 className="mt-3 max-w-xl text-2xl font-black tracking-tight sm:text-3xl">
            {text(block.content.title, block.name)}
          </h2>
          <p className="mt-3 max-w-xl leading-7 text-indigo-50/85">
            {text(block.content.description)}
          </p>
          <Link
            href={text(block.content.href, "/notes")}
            className={cn(buttonVariants({ variant: "outline", size: "md" }), "mt-6 border-white/30 bg-white text-indigo-700 hover:bg-indigo-50")}
          >
            {text(block.content.actionLabel, "Xem thêm")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (block.type === "BUTTON") return <LinkButtons block={block} />;

  if (block.type === "CARD") {
    return (
      <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/90 to-teal-50/70">
        <CardContent className="flex gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            {icon(text(block.content.icon, "sparkles"))}
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              {text(block.content.title, block.name)}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text(block.content.text)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (block.type === "NOTE_LIST") {
    const limit = number(block.content.limit, 3);
    return (
      <section>
        <div className="mb-5 flex items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Đọc tiếp</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              {text(block.content.title, block.name)}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{text(block.content.description)}</p>
          </div>
          <Link href="/notes" className="hidden text-sm font-bold text-indigo-600 hover:text-indigo-500 sm:block">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {notes.slice(0, limit).map((note) => <NoteCard key={note.id} note={note} />)}
        </div>
      </section>
    );
  }

  if (block.type === "DIVIDER") return <hr className="border-slate-200" />;

  if (block.type === "HEADING") {
    return <h2 className="text-2xl font-black tracking-tight text-slate-950">{text(block.content.text, block.name)}</h2>;
  }

  if (block.type === "TEXT") {
    return <p className="text-base leading-7 text-slate-600">{text(block.content.text)}</p>;
  }

  return null;
}
