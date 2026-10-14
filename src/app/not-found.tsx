import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main-content" className="grid min-h-screen place-items-center px-4">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
          <FileQuestion className="size-7" />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">404</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Không tìm thấy trang</h1>
        <p className="mt-3 leading-7 text-slate-500">Nội dung có thể đã được đổi đường dẫn, chuyển sang riêng tư hoặc đưa vào thùng rác.</p>
        <Link href="/" className={`${buttonVariants({ variant: "primary" })} mt-6`}>
          <ArrowLeft className="size-4" />
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
