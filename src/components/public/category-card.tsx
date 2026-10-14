import { ArrowRight, Files } from "lucide-react";
import Link from "next/link";

import type { CategorySummary } from "@/types/domain";

export function CategoryCard({ category }: { category: CategorySummary }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-950/5"
    >
      <div
        className="mb-5 grid size-11 place-items-center rounded-xl text-white shadow-lg"
        style={{ backgroundColor: category.color }}
      >
        <Files className="size-5" aria-hidden="true" />
      </div>
      <h2 className="flex items-center justify-between gap-3 text-lg font-bold text-slate-950">
        {category.name}
        <ArrowRight className="size-4 transition group-hover:translate-x-1" />
      </h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
        {category.description || "Các ghi chú được sắp xếp theo chủ đề này."}
      </p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {category.noteCount} ghi chú
      </p>
    </Link>
  );
}
