"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Link2,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  updateQuickLinksAction,
  type QuickLinksActionState,
} from "@/features/site/actions";
import type {
  QuickLinkIcon,
  QuickLinkItem,
  QuickLinksEditorData,
  QuickLinkTone,
} from "@/types/domain";

const initialActionState: QuickLinksActionState = {
  status: "idle",
  message: "",
  revision: 0,
};

const selectClassName =
  "mt-1.5 h-12 w-full rounded-sm border-[3px] border-line bg-surface px-3 text-sm font-semibold text-ink shadow-[3px_3px_0_var(--ds-shadow)] outline-none transition-[transform,box-shadow] duration-150 focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--ds-shadow)]";

function createQuickLink(): QuickLinkItem {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    href: "",
    icon: "link",
    tone: "blue",
    newTab: true,
  };
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="accent" size="lg" disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Save className="size-4" aria-hidden="true" />
      )}
      {pending ? "Đang lưu…" : "Lưu liên kết nhanh"}
    </Button>
  );
}

export function QuickLinksForm({ data }: { data: QuickLinksEditorData }) {
  const [state, formAction] = useActionState(updateQuickLinksAction, initialActionState);
  const [items, setItems] = useState<QuickLinkItem[]>(data.items);

  useEffect(() => {
    if (!state.revision || !state.message) return;
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state.message, state.revision, state.status]);

  function updateItem(
    index: number,
    field: keyof Omit<QuickLinkItem, "id">,
    value: string | boolean,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? ({ ...item, [field]: value } as QuickLinkItem) : item,
      ),
    );
  }

  function moveItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    setItems((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function removeItem(index: number) {
    const item = items[index];
    const confirmed = window.confirm(
      `Xóa liên kết “${item?.title || `số ${index + 1}`}” khỏi trang chủ?`,
    );
    if (!confirmed) return;
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <form action={formAction} className="space-y-7">
      <input type="hidden" name="blockId" value={data.blockId ?? ""} />

      <Card>
        <CardContent className="grid gap-5 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end">
          <div>
            <p className="retro-label">Cấu hình khu vực</p>
            <label className="mt-4 block text-sm font-bold text-ink" htmlFor="blockName">
              Tên khu vực
              <Input
                id="blockName"
                name="blockName"
                defaultValue={data.blockName}
                minLength={2}
                maxLength={100}
                className="mt-2"
                required
              />
            </label>
          </div>
          <p className="rounded-sm border-[3px] border-line bg-surface-alt p-4 text-xs leading-5 text-muted shadow-[3px_3px_0_var(--ds-shadow)]">
            Thứ tự ở đây cũng là thứ tự khách truy cập nhìn thấy. Link nội bộ bắt đầu
            bằng <strong className="text-ink">/</strong>; link ngoài dùng https://,
            mailto: hoặc tel:.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="retro-label">CRUD liên kết</p>
              <h2 className="mt-3 font-display text-xl font-bold text-ink">
                Các điểm đến trên trang chủ
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Thêm, sửa, xóa và đổi thứ tự tối đa 12 liên kết.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={items.length >= 12}
              onClick={() => setItems((current) => [...current, createQuickLink()])}
            >
              <Plus className="size-4" aria-hidden="true" />
              Thêm liên kết
            </Button>
          </div>

          {items.length ? (
            <div className="space-y-5">
              {items.map((item, index) => (
                <section
                  key={item.id}
                  aria-labelledby={`quick-link-title-${item.id}`}
                  className="rounded-sm border-[3px] border-line bg-surface-alt p-4 shadow-[4px_4px_0_var(--ds-shadow)] sm:p-5"
                >
                  <input type="hidden" name="quickLinkId" value={item.id} />
                  <input
                    type="hidden"
                    name="quickLinkNewTab"
                    value={item.newTab ? "true" : "false"}
                  />

                  <div className="mb-4 flex items-center justify-between gap-3 border-b-2 border-dashed border-line/30 pb-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="voxel-icon grid size-10 shrink-0 place-items-center bg-sky text-[#10212b]">
                        <Link2 className="size-4" aria-hidden="true" />
                      </span>
                      <h3
                        id={`quick-link-title-${item.id}`}
                        className="truncate font-display text-sm font-bold text-ink"
                      >
                        {item.title || `Liên kết ${index + 1}`}
                      </h3>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={index === 0}
                        aria-label={`Đưa ${item.title || `liên kết ${index + 1}`} lên trên`}
                        onClick={() => moveItem(index, -1)}
                      >
                        <ArrowUp className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={index === items.length - 1}
                        aria-label={`Đưa ${item.title || `liên kết ${index + 1}`} xuống dưới`}
                        onClick={() => moveItem(index, 1)}
                      >
                        <ArrowDown className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-danger hover:bg-pink hover:text-[#10212b]"
                        aria-label={`Xóa ${item.title || `liên kết ${index + 1}`}`}
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-xs font-bold text-ink">
                      Tên liên kết
                      <Input
                        name="quickLinkTitle"
                        value={item.title}
                        maxLength={80}
                        className="mt-1.5"
                        placeholder="Nhóm cộng đồng"
                        onChange={(event) =>
                          updateItem(index, "title", event.target.value)
                        }
                        required
                      />
                    </label>
                    <label className="text-xs font-bold text-ink">
                      Đường dẫn
                      <Input
                        name="quickLinkHref"
                        value={item.href}
                        maxLength={500}
                        className="mt-1.5"
                        placeholder="https://... hoặc /notes"
                        onChange={(event) => updateItem(index, "href", event.target.value)}
                        required
                      />
                    </label>
                  </div>

                  <label className="mt-4 block text-xs font-bold text-ink">
                    Thông tin chi tiết
                    <textarea
                      name="quickLinkDescription"
                      value={item.description}
                      maxLength={180}
                      rows={2}
                      placeholder="Mô tả ngắn để người xem biết liên kết dẫn tới đâu"
                      onChange={(event) =>
                        updateItem(index, "description", event.target.value)
                      }
                      className="mt-1.5 w-full resize-y rounded-sm border-[3px] border-line bg-surface px-3.5 py-3 text-sm leading-6 text-ink shadow-[3px_3px_0_var(--ds-shadow)] outline-none transition-[transform,box-shadow] duration-150 placeholder:text-muted/80 focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--ds-shadow)]"
                    />
                  </label>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr] lg:items-end">
                    <label className="text-xs font-bold text-ink">
                      Biểu tượng
                      <select
                        name="quickLinkIcon"
                        value={item.icon}
                        onChange={(event) =>
                          updateItem(index, "icon", event.target.value as QuickLinkIcon)
                        }
                        className={selectClassName}
                      >
                        <option value="link">Liên kết</option>
                        <option value="message-circle">Tin nhắn</option>
                        <option value="notebook-tabs">Ghi chú</option>
                        <option value="folder-tree">Danh mục</option>
                        <option value="search">Tìm kiếm</option>
                        <option value="send">Telegram</option>
                        <option value="mail">Email</option>
                        <option value="users">Cộng đồng</option>
                        <option value="sparkles">Nổi bật</option>
                      </select>
                    </label>
                    <label className="text-xs font-bold text-ink">
                      Màu khối
                      <select
                        name="quickLinkTone"
                        value={item.tone}
                        onChange={(event) =>
                          updateItem(index, "tone", event.target.value as QuickLinkTone)
                        }
                        className={selectClassName}
                      >
                        <option value="blue">Kim cương xanh</option>
                        <option value="amber">Vàng kho báu</option>
                        <option value="pink">Đất nung</option>
                        <option value="green">Cỏ xanh</option>
                      </select>
                    </label>
                    <label className="flex min-h-12 items-center gap-3 rounded-sm border-[3px] border-line bg-surface px-3 text-xs font-bold text-ink shadow-[3px_3px_0_var(--ds-shadow)]">
                      <input
                        type="checkbox"
                        checked={item.newTab}
                        onChange={(event) =>
                          updateItem(index, "newTab", event.target.checked)
                        }
                        className="size-5 accent-[var(--ds-forest)]"
                      />
                      <span className="flex items-center gap-2">
                        <ExternalLink className="size-4" aria-hidden="true" />
                        Mở link web ở tab mới
                      </span>
                    </label>
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="empty-state px-5 py-10 text-center">
              <Link2 className="mx-auto size-8 text-forest" aria-hidden="true" />
              <p className="mt-3 text-sm font-bold text-ink">Chưa có liên kết nhanh</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Khu vực này sẽ tự ẩn ngoài trang chủ cho tới khi bạn thêm liên kết.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setItems([createQuickLink()])}
              >
                <Plus className="size-4" aria-hidden="true" />
                Thêm liên kết đầu tiên
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="sticky bottom-3 z-20 flex flex-col gap-3 rounded-sm border-[3px] border-line bg-surface p-4 shadow-[6px_6px_0_var(--ds-shadow)] sm:flex-row sm:items-center sm:justify-between lg:bottom-5">
        <p role="status" aria-live="polite" className="text-sm font-semibold text-muted">
          {state.status === "error"
            ? state.message
            : `${items.length}/12 liên kết · Lưu để cập nhật trang chủ.`}
        </p>
        <SaveButton />
      </div>
    </form>
  );
}
