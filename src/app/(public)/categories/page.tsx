import type { Metadata } from "next";

import { CategoryCard } from "@/components/public/category-card";
import { getCategories } from "@/features/notes/queries";

export const metadata: Metadata = { title: "Danh mục", description: "Duyệt ghi chú theo từng chủ đề." };

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <main id="main-content" className="mx-auto min-h-[70vh] max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Chủ đề</p>
      <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-slate-950">Khám phá theo danh mục</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Mỗi danh mục gom các ghi chú có liên quan để bạn không cần nhớ chính xác tiêu đề.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => <CategoryCard key={category.id} category={category} />)}
      </div>
    </main>
  );
}
