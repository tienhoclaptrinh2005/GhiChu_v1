export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f7fb]">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
        <span className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
        Đang tải nội dung…
      </div>
    </div>
  );
}
