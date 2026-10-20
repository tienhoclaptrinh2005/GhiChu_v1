import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border-2 border-line text-sm font-bold shadow-[3px_3px_0_var(--ds-shadow)] transition-[transform,box-shadow,background-color,color] duration-150 outline-none hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ds-shadow)] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_var(--ds-shadow)] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
  {
    variants: {
      variant: {
        primary:
          "bg-forest-deep text-[#fffdf5] hover:bg-forest hover:text-[var(--ds-on-forest)]",
        accent:
          "bg-accent text-[var(--ds-on-accent)] hover:bg-pink",
        outline:
          "bg-surface text-ink hover:bg-surface-alt",
        ghost:
          "border-transparent bg-transparent text-muted shadow-none hover:border-line hover:bg-surface hover:text-ink hover:shadow-[3px_3px_0_var(--ds-shadow)]",
        danger: "bg-danger text-surface hover:bg-pink hover:text-[var(--ds-on-accent)]",
      },
      size: {
        sm: "h-11 px-3",
        md: "h-11 px-4",
        lg: "h-12 px-5 text-base",
        icon: "size-11",
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
