import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "indigo" | "green" | "amber" | "rose";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-alt text-ink",
  indigo: "bg-sky text-[#10212b]",
  green: "bg-forest text-[var(--ds-on-forest)]",
  amber: "bg-accent text-[var(--ds-on-accent)]",
  rose: "bg-pink text-[#10212b]",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border-[3px] border-line px-2.5 py-1 font-display text-[0.68rem] font-bold uppercase tracking-[0.08em] shadow-[2px_2px_0_var(--ds-shadow),inset_0_-2px_0_color-mix(in_srgb,var(--ds-shadow)_14%,transparent)]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
