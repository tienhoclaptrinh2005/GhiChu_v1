import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-sm border-[3px] border-line bg-surface text-ink shadow-[6px_6px_0_var(--ds-shadow),inset_0_-4px_0_color-mix(in_srgb,var(--ds-sky)_18%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}
