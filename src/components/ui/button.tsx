import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-slate-950 text-white shadow-lg shadow-slate-950/15 hover:-translate-y-0.5 hover:bg-slate-800",
        accent:
          "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 hover:bg-indigo-500",
        outline:
          "border border-slate-200 bg-white/80 text-slate-800 hover:border-slate-300 hover:bg-white",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
        danger: "bg-rose-600 text-white hover:bg-rose-500",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-4",
        lg: "h-12 px-5 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
