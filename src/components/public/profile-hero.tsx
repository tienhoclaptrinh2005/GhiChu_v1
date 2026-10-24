import { Box } from "lucide-react";
import Image from "next/image";

import { VoxelName } from "@/components/effects/voxel-name";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getInitials } from "@/lib/utils";
import type { SiteSettings } from "@/types/domain";

function VerifiedBadge() {
  return (
    <span
      className="inline-flex size-6 shrink-0 drop-shadow-[1px_1px_0_var(--ds-shadow)] sm:size-7"
      role="img"
      aria-label="Hồ sơ đã xác minh"
      title="Hồ sơ đã xác minh"
    >
      <svg viewBox="0 0 24 24" className="size-full" aria-hidden="true">
        <path
          fill="var(--ds-verified)"
          d="m23 12-2.44-2.79.34-3.69-3.61-.82L15.4 1.5 12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.81L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12Z"
        />
        <path
          fill="#fff"
          d="m10.09 16.72-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35Z"
        />
      </svg>
    </span>
  );
}

export function ProfileHero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="pixel-corners voxel-panel overflow-hidden text-ink">
      <div className="voxel-landscape relative h-40 overflow-hidden border-b-[3px] border-line sm:h-48">
        {settings.backgroundImageUrl ? (
          <Image
            src={settings.backgroundImageUrl}
            alt=""
            fill
            priority
            quality={76}
            sizes="(max-width: 768px) 100vw, 768px"
            className="z-0 object-cover opacity-65 mix-blend-luminosity"
          />
        ) : null}
        <div className="absolute inset-0 z-[2] bg-[linear-gradient(180deg,transparent_45%,rgba(7,21,29,0.2))]" />
        <span
          className="grass-block absolute bottom-4 left-6 z-[3] size-12"
          aria-hidden="true"
        />
        <span
          className="voxel-icon absolute right-24 top-8 z-[3] grid size-8 place-items-center bg-accent text-[#10212b]"
          aria-hidden="true"
        >
          <Box className="size-4" />
        </span>
        <ThemeToggle className="absolute right-5 top-5 z-10 sm:right-6 sm:top-6" />
      </div>

      <div className="relative px-5 pb-8 text-center sm:px-10 sm:pb-10">
        <div className="profile-avatar-frame relative z-[4] mx-auto -mt-16 size-32 sm:-mt-[4.5rem] sm:size-36">
          <div className="relative z-[1] grid size-full place-items-center overflow-hidden border-[3px] border-line bg-[#071117] text-3xl font-black text-[#10212b]">
            {settings.avatarUrl ? (
              <Image
                src={settings.avatarUrl}
                alt={`Ảnh đại diện ${settings.displayName}`}
                fill
                priority
                quality={84}
                sizes="(max-width: 639px) 128px, 144px"
                className="object-contain p-1"
              />
            ) : (
              <span className="grid size-full place-items-center bg-sky">
                {getInitials(settings.displayName)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="inline-flex max-w-full items-center justify-center gap-2">
            <VoxelName name={settings.displayName} />
            <VerifiedBadge />
          </div>
        </div>

        <p className="mx-auto mt-16 max-w-xl text-pretty text-sm leading-6 text-muted sm:text-base sm:leading-7">
          {settings.description}
        </p>
      </div>
    </section>
  );
}
