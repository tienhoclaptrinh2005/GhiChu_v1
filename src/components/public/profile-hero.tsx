import { ArrowDown, Box, CheckCircle2 } from "lucide-react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import type { SiteSettings } from "@/types/domain";

export function ProfileHero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="pixel-corners voxel-panel overflow-hidden text-ink">
      <div className="voxel-landscape relative h-40 overflow-hidden border-b-[3px] border-line sm:h-48">
        {settings.backgroundImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.backgroundImageUrl}
            alt=""
            className="absolute inset-0 z-0 size-full object-cover opacity-65 mix-blend-luminosity"
            fetchPriority="high"
          />
        ) : null}
        <div className="absolute inset-0 z-[2] bg-[linear-gradient(180deg,transparent_45%,rgba(7,21,29,0.2))]" />
        <span className="grass-block absolute bottom-4 left-6 z-[3] size-12" aria-hidden="true" />
        <span className="voxel-icon absolute right-24 top-8 z-[3] grid size-8 place-items-center bg-accent text-[#10212b]" aria-hidden="true">
          <Box className="size-4" />
        </span>
        <ThemeToggle className="absolute right-5 top-5 z-10 sm:right-6 sm:top-6" />
      </div>

      <div className="relative px-5 pb-8 text-center sm:px-10 sm:pb-10">
        <div className="voxel-icon relative z-[4] mx-auto -mt-14 grid size-28 place-items-center overflow-hidden bg-sky text-3xl font-black text-[#10212b] sm:-mt-16 sm:size-32">
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

        <h1 className="voxel-title mx-auto mt-6 max-w-2xl text-balance text-2xl leading-[1.18] sm:text-4xl">
          {settings.headline}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-6 text-muted sm:text-base sm:leading-7">
          {settings.description}
        </p>

        <a
          href="#noi-dung"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm border-[3px] border-line bg-forest px-4 text-sm font-bold text-[var(--ds-on-forest)] shadow-[3px_3px_0_var(--ds-shadow),inset_0_-3px_0_color-mix(in_srgb,var(--ds-shadow)_18%,transparent)] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-0.5 hover:bg-accent hover:text-[var(--ds-on-accent)] hover:shadow-[5px_5px_0_var(--ds-shadow)]"
        >
          Chọn một liên kết bên dưới
          <ArrowDown className="size-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
