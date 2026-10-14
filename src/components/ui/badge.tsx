import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "indigo" | "green" | "amber" | "rose";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-600 ring-slate-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
