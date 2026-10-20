export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas">
      <div className="brutal-surface flex items-center gap-3 px-5 py-4 text-sm font-bold text-muted">
        <span className="size-4 animate-spin border-2 border-line border-t-accent" />
        Đang tải nội dung…
      </div>
    </div>
  );
}
