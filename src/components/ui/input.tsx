import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-sm border-[3px] border-line bg-surface px-3.5 text-sm font-medium text-ink shadow-[3px_3px_0_var(--ds-shadow),inset_0_3px_0_color-mix(in_srgb,var(--ds-sky)_12%,transparent)] outline-none transition-[box-shadow,transform,background-color] duration-150 placeholder:text-muted/80 focus:-translate-x-0.5 focus:-translate-y-0.5 focus:bg-surface focus:shadow-[5px_5px_0_var(--ds-shadow)]",
        className,
      )}
      {...props}
    />
  );
}
