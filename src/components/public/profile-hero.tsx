import { ArrowDown, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import type { SiteSettings } from "@/types/domain";

export function ProfileHero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 px-5 py-9 text-center shadow-[0_28px_90px_-48px_rgba(75,69,184,0.55)] backdrop-blur-xl sm:px-10 sm:py-12">
      <div className="absolute -left-20 -top-24 size-64 rounded-full bg-indigo-300/25 blur-3xl" />
      <div className="absolute -bottom-28 -right-16 size-72 rounded-full bg-rose-200/35 blur-3xl" />
      <div className="relative mx-auto max-w-2xl">
        <div className="mx-auto mb-5 grid size-24 place-items-center rounded-[1.75rem] border-4 border-white bg-gradient-to-br from-indigo-500 via-violet-500 to-rose-400 text-2xl font-black text-white shadow-xl shadow-indigo-500/20">
          {settings.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.avatarUrl}
              alt={`Ảnh đại diện ${settings.displayName}`}
              className="size-full rounded-[1.45rem] object-cover"
            />
          ) : (
            getInitials(settings.displayName)
          )}
        </div>
        <Badge tone="indigo" className="mb-4">
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          Personal knowledge hub
        </Badge>
        <h1 className="text-balance text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">
          {settings.headline}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-slate-600 sm:text-lg">
          {settings.description}
        </p>
        <a
          href="#noi-dung"
          className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-slate-950"
        >
          Xem nội dung
          <ArrowDown className="size-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
