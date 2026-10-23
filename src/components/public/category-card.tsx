import { ArrowRight, Files } from "lucide-react";
import Link from "next/link";

import type { CategorySummary } from "@/types/domain";

export function CategoryCard({ category }: { category: CategorySummary }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative rounded-sm border-[3px] border-line bg-surface p-5 shadow-[5px_5px_0_var(--ds-shadow),inset_0_-4px_0_color-mix(in_srgb,var(--ds-sky)_15%,transparent)] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-surface-alt hover:shadow-[7px_7px_0_var(--ds-shadow)]"
    >
      <div
        className="voxel-icon mb-5 grid size-12 place-items-center text-white"
        style={{ backgroundColor: category.color }}
      >
        <Files className="size-5" aria-hidden="true" />
      </div>
      <h2 className="flex items-center justify-between gap-3 font-display text-lg font-bold text-ink">
        {category.name}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-muted">
        {category.description || "Các ghi chú được sắp xếp theo chủ đề này."}
      </p>
      <p className="mt-4 border-t-2 border-dashed border-line/30 pt-3 font-display text-xs font-bold uppercase tracking-[0.12em] text-muted">
        {category.noteCount} ghi chú
      </p>
    </Link>
  );
}
