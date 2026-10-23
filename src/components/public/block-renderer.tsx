import {
  ArrowRight,
  ExternalLink,
  FolderTree,
  Mail,
  Megaphone,
  MessageCircle,
  NotebookTabs,
  Search,
  Send,
  Sparkles,
  UsersRound,
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
  let Icon = NotebookTabs;
  if (name === "message-circle") Icon = MessageCircle;
  if (name === "folder-tree") Icon = FolderTree;
  if (name === "search") Icon = Search;
  if (name === "send") Icon = Send;
  if (name === "mail") Icon = Mail;
  if (name === "users") Icon = UsersRound;
  if (name === "sparkles") Icon = Sparkles;
  return <Icon className="size-5" aria-hidden="true" />;
}

function linkIconTone(tone: string, index: number) {
  if (tone === "blue") return "bg-sky text-[#10212b]";
  if (tone === "orange" || tone === "amber") return "bg-accent text-[#10212b]";
  if (tone === "rose" || tone === "pink") return "bg-pink text-[#10212b]";
  if (tone === "green" || tone === "violet") {
    return "bg-forest text-[var(--ds-on-forest)]";
  }

  const fallbackTones = [
    "bg-sky text-[#10212b]",
    "bg-accent text-[#10212b]",
    "bg-pink text-[#10212b]",
    "bg-forest text-[var(--ds-on-forest)]",
  ];
  return fallbackTones[index % fallbackTones.length];
}

function isWebUrl(href: string) {
  return /^https?:\/\//i.test(href);
}

function isExternalScheme(href: string) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(href);
}

function LinkButtons({ block }: { block: PageBlock }) {
  const items = Array.isArray(block.content.items) ? block.content.items : [];
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={`links-${block.id}`}>
      <div className="mb-5 text-center">
        <p className="retro-label justify-center">Điểm đến nhanh</p>
        <h2 id={`links-${block.id}`} className="voxel-title mt-3 text-2xl text-ink sm:text-3xl">
          {block.name}
        </h2>
      </div>

      <div className="grid gap-4">
        {items.map((item, index) => {
          if (!item || typeof item !== "object" || Array.isArray(item)) return null;
          const title = text(item.title, "Liên kết");
          const href = text(item.href, "#");
          const external = item.external === true || isExternalScheme(href);
          const description = text(item.description);
          const content = (
            <>
              <span
                className={cn(
                  "voxel-icon grid size-12 shrink-0 place-items-center transition-transform duration-150 group-hover:-rotate-3 group-hover:scale-105",
                  linkIconTone(text(item.tone), index),
                )}
              >
                {icon(text(item.icon))}
              </span>
              <span className="min-w-0 text-center">
                <span className="block font-display text-base font-bold text-ink sm:text-lg">
                  {title}
                </span>
                {description ? (
                  <span className="mt-1 block text-xs leading-5 text-muted sm:text-sm">
                    {description}
                  </span>
                ) : null}
              </span>
              <span className="grid size-12 place-items-center text-muted">
                {external ? (
                  <ExternalLink className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                ) : (
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                )}
              </span>
            </>
          );
          const className =
            "voxel-link group grid min-h-[5.5rem] grid-cols-[7px_3rem_minmax(0,1fr)_3rem] items-center gap-3 rounded-sm border-[3px] border-line bg-surface pr-3 shadow-[5px_5px_0_var(--ds-shadow),inset_0_-4px_0_color-mix(in_srgb,var(--ds-sky)_14%,transparent)] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-surface-alt hover:shadow-[7px_7px_0_var(--ds-shadow)] sm:grid-cols-[7px_3.5rem_minmax(0,1fr)_3.5rem] sm:pr-4";

          return external ? (
            <a
              key={`${title}-${index}`}
              href={href}
              target={isWebUrl(href) ? "_blank" : undefined}
              rel={isWebUrl(href) ? "noreferrer" : undefined}
              className={className}
            >
              {content}
            </a>
          ) : (
            <Link key={`${title}-${index}`} href={href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function BlockRenderer({ block, notes }: { block: PageBlock; notes: NoteSummary[] }) {
  if (!block.isActive) return null;

  if (block.type === "BANNER") {
    const href = text(block.content.href, "/notes");
    const action = (
      <>
        {text(block.content.actionLabel, "Xem thêm")}
        <ArrowRight className="size-4" aria-hidden="true" />
      </>
    );
    const actionClassName = cn(buttonVariants({ variant: "primary", size: "md" }), "shrink-0");

    return (
      <Card className="pixel-corners overflow-hidden bg-sky text-[#10212b]">
        <CardContent className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <span className="voxel-icon grid size-12 shrink-0 place-items-center bg-accent">
            <Megaphone className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[0.68rem] font-bold uppercase tracking-[0.18em]">
              {text(block.content.eyebrow, "Thông báo")}
            </p>
            <h2 className="voxel-title mt-1.5 text-xl sm:text-2xl">
              {text(block.content.title, block.name)}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#173747] sm:text-base">
              {text(block.content.description)}
            </p>
          </div>
          {isExternalScheme(href) ? (
            <a
              href={href}
              target={isWebUrl(href) ? "_blank" : undefined}
              rel={isWebUrl(href) ? "noreferrer" : undefined}
              className={actionClassName}
            >
              {action}
            </a>
          ) : (
            <Link href={href} className={actionClassName}>
              {action}
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  if (block.type === "BUTTON") return <LinkButtons block={block} />;

  if (block.type === "CARD") {
    return (
      <Card className="bg-surface-alt">
        <CardContent className="flex gap-4">
          <span className="voxel-icon grid size-12 shrink-0 place-items-center bg-forest text-[var(--ds-on-forest)]">
            {icon(text(block.content.icon, "sparkles"))}
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink">
              {text(block.content.title, block.name)}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">{text(block.content.text)}</p>
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
            <p className="retro-label">Đọc tiếp</p>
            <h2 className="voxel-title mt-3 text-2xl text-ink sm:text-3xl">
              {text(block.content.title, block.name)}
            </h2>
            <p className="mt-1 text-sm text-muted">{text(block.content.description)}</p>
          </div>
          <Link href="/notes" className="hidden border-b-2 border-line pb-1 text-sm font-bold text-forest transition-colors hover:text-pink sm:block">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {notes.slice(0, limit).map((note) => <NoteCard key={note.id} note={note} />)}
        </div>
      </section>
    );
  }

  if (block.type === "DIVIDER") return <hr className="section-rule" />;

  if (block.type === "HEADING") {
    return <h2 className="voxel-title text-2xl text-ink">{text(block.content.text, block.name)}</h2>;
  }

  if (block.type === "TEXT") {
    return <p className="text-base leading-7 text-muted">{text(block.content.text)}</p>;
  }

  return null;
}
