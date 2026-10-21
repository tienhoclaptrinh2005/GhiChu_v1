import { ArrowDown, CheckCircle2 } from "lucide-react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import type { SiteSettings } from "@/types/domain";

export function ProfileHero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="pixel-corners overflow-hidden rounded-xl border-2 border-line bg-surface text-ink shadow-[8px_8px_0_var(--ds-shadow)]">
      <div className="pixel-grid relative h-32 overflow-hidden border-b-2 border-line bg-forest-deep sm:h-40">
        {settings.backgroundImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.backgroundImageUrl}
            alt=""
            className="absolute inset-0 size-full object-cover"
            fetchPriority="high"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(9,13,11,0.42))]" />
        <span className="absolute left-6 top-6 size-4 border-2 border-[#fffdf5] bg-accent shadow-[5px_5px_0_#0a100d]" aria-hidden="true" />
        <span className="absolute bottom-5 right-20 size-3 bg-sky shadow-[4px_4px_0_#0a100d]" aria-hidden="true" />
        <ThemeToggle className="absolute right-5 top-5 z-10 sm:right-6 sm:top-6" />
      </div>

      <div className="relative px-5 pb-8 text-center sm:px-10 sm:pb-10">
        <div className="mx-auto -mt-14 grid size-28 place-items-center overflow-hidden rounded-xl border-2 border-line bg-pink text-3xl font-black text-[#231f20] shadow-[6px_6px_0_var(--ds-shadow)] sm:-mt-16 sm:size-32">
          {settings.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.avatarUrl}
              alt={`Ảnh đại diện ${settings.displayName}`}
              className="size-full object-cover"
              fetchPriority="high"
            />
          ) : (
            getInitials(settings.displayName)
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <p className="font-display text-xl font-bold sm:text-2xl">{settings.displayName}</p>
          <CheckCircle2 className="size-5 fill-sky text-line" aria-label="Hồ sơ đã xác minh" />
        </div>

        <Badge tone="amber" className="mt-3">
          Personal knowledge hub
        </Badge>

        <h1 className="mx-auto mt-6 max-w-2xl text-balance text-2xl font-bold leading-[1.18] tracking-[-0.03em] sm:text-4xl">
          {settings.headline}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-6 text-muted sm:text-base sm:leading-7">
          {settings.description}
        </p>

        <a
          href="#noi-dung"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md border-2 border-line bg-surface-alt px-4 text-sm font-bold text-ink shadow-[3px_3px_0_var(--ds-shadow)] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:bg-accent hover:shadow-[4px_4px_0_var(--ds-shadow)]"
        >
          Chọn một liên kết bên dưới
          <ArrowDown className="size-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
