"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  CheckCircle2,
  ExternalLink,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  updateSiteSettingsAction,
  type SiteSettingsActionState,
} from "@/features/site/actions";
import { cn } from "@/lib/utils";
import type {
  ProfileMediaOption,
  SiteSettingsEditorData,
} from "@/types/domain";

type SocialLinkDraft = {
  key: string;
  label: string;
  href: string;
  icon: "facebook" | "send" | "mail" | "link";
};

const initialActionState: SiteSettingsActionState = {
  status: "idle",
  message: "",
  revision: 0,
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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
      {pending ? "Đang lưu thay đổi…" : "Lưu và cập nhật trang chủ"}
    </Button>
  );
}

function MediaChoice({
  item,
  name,
  selectedId,
  onSelect,
}: {
  item: ProfileMediaOption;
  name: string;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selected = selectedId === item.id;
  return (
    <label
      className={cn(
        "group cursor-pointer overflow-hidden rounded-sm border-[3px] border-line bg-surface shadow-[3px_3px_0_var(--ds-shadow)] transition-[transform,box-shadow,background-color] duration-150 focus-within:ring-3 focus-within:ring-sky",
        selected && "-translate-x-0.5 -translate-y-0.5 bg-sky shadow-[5px_5px_0_var(--ds-shadow)]",
      )}
    >
      <input
        type="radio"
        name={name}
        value={item.id}
        checked={selected}
        onChange={() => onSelect(item.id)}
        className="sr-only"
      />
      <span className="relative block aspect-square overflow-hidden border-b-[3px] border-line bg-surface-alt">
        <Image
          src={`/api/admin/media/${item.id}/download`}
          alt={item.altText || item.originalName}
          fill
          unoptimized
          sizes="144px"
          className="object-cover"
        />
        {selected ? (
          <span className="absolute right-2 top-2 grid size-8 place-items-center border-[3px] border-line bg-accent text-[#10212b] shadow-[2px_2px_0_var(--ds-shadow)]">
            <CheckCircle2 className="size-4" aria-hidden="true" />
          </span>
        ) : null}
      </span>
      <span className="block min-w-0 p-3">
        <span className="block truncate text-xs font-bold text-ink" title={item.originalName}>
          {item.originalName}
        </span>
        <span className="mt-1 block text-[0.68rem] text-muted">
          {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
          {formatBytes(item.sizeBytes)}
        </span>
      </span>
    </label>
  );
}

function EmptyMediaChoice({
  name,
  selected,
  onSelect,
  label,
}: {
  name: string;
  selected: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <label
      className={cn(
        "grid min-h-32 cursor-pointer place-items-center rounded-sm border-[3px] border-dashed border-line bg-surface-alt p-4 text-center shadow-[3px_3px_0_var(--ds-shadow)] focus-within:ring-3 focus-within:ring-sky",
        selected && "bg-accent text-[#10212b]",
      )}
    >
      <input
        type="radio"
        name={name}
        value=""
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span>
        <ImageIcon className="mx-auto size-6" aria-hidden="true" />
        <span className="mt-2 block text-xs font-bold">{label}</span>
      </span>
    </label>
  );
}

function toDraftLinks(data: SiteSettingsEditorData): SocialLinkDraft[] {
  return data.settings.socialLinks.map((item, index) => ({
    key: `${index}-${item.href}`,
    label: item.label,
    href: item.href,
    icon:
      item.icon === "facebook" || item.icon === "send" || item.icon === "mail"
        ? item.icon
        : "link",
  }));
}

export function SiteSettingsForm({ data }: { data: SiteSettingsEditorData }) {
  const [state, formAction] = useActionState(updateSiteSettingsAction, initialActionState);
  const [avatarId, setAvatarId] = useState(data.settings.avatarMediaId ?? "");
  const [backgroundId, setBackgroundId] = useState(
    data.settings.backgroundMediaId ?? "",
  );
  const [socialLinks, setSocialLinks] = useState<SocialLinkDraft[]>(() => toDraftLinks(data));

  const activeAvatar = useMemo(
    () => data.avatars.find((item) => item.id === avatarId) ?? null,
    [avatarId, data.avatars],
  );

  useEffect(() => {
    if (!state.revision || !state.message) return;
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state.message, state.revision, state.status]);

  function updateSocialLink(index: number, field: keyof Omit<SocialLinkDraft, "key">, value: string) {
    setSocialLinks((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } as SocialLinkDraft : item,
      ),
    );
  }

  return (
    <form action={formAction} className="space-y-7">
      <Card>
        <CardContent className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="space-y-5">
            <div>
              <p className="retro-label">Nội dung công khai</p>
              <h2 className="mt-3 font-display text-xl font-bold text-ink">Thông tin hồ sơ trang chủ</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Những trường này cập nhật trực tiếp phần hồ sơ mà khách truy cập nhìn thấy.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-bold text-ink" htmlFor="displayName">
                Tên hiển thị
                <Input
                  id="displayName"
                  name="displayName"
                  defaultValue={data.settings.displayName}
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  className="mt-2"
                  required
                />
              </label>
              <label className="text-sm font-bold text-ink" htmlFor="headline">
                Tiêu đề nổi bật
                <Input
                  id="headline"
                  name="headline"
                  defaultValue={data.settings.headline}
                  minLength={4}
                  maxLength={180}
                  className="mt-2"
                  required
                />
              </label>
            </div>

            <label className="block text-sm font-bold text-ink" htmlFor="description">
              Thông tin chi tiết
              <textarea
                id="description"
                name="description"
                defaultValue={data.settings.description}
                minLength={4}
                maxLength={600}
                rows={5}
                className="mt-2 w-full resize-y rounded-sm border-[3px] border-line bg-surface px-3.5 py-3 text-sm leading-6 text-ink shadow-[3px_3px_0_var(--ds-shadow),inset_0_3px_0_color-mix(in_srgb,var(--ds-sky)_12%,transparent)] outline-none transition-[box-shadow,transform] duration-150 focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_var(--ds-shadow)]"
                required
              />
              <span className="mt-1.5 block text-xs font-normal leading-5 text-muted">
                Nên dùng 1–3 câu ngắn để trang chủ tải nhanh và dễ đọc trên điện thoại.
              </span>
            </label>
          </div>

          <aside className="pixel-grid rounded-sm border-[3px] border-line bg-forest-deep p-5 text-[#f7fdff] shadow-[5px_5px_0_var(--ds-shadow)]">
            <div className="profile-avatar-frame relative mx-auto size-28">
              <div className="relative z-[1] size-full overflow-hidden border-[3px] border-line bg-[#071117]">
                {activeAvatar ? (
                  <Image
                    src={`/api/admin/media/${activeAvatar.id}/download`}
                    alt={activeAvatar.altText || activeAvatar.originalName}
                    fill
                    unoptimized
                    sizes="112px"
                    className="object-contain p-1"
                  />
                ) : (
                  <span className="grid size-full place-items-center bg-sky text-[#10212b]">
                    <UserRound className="size-10" aria-hidden="true" />
                  </span>
                )}
              </div>
            </div>
            <p className="mt-5 text-center font-display font-bold">Một ảnh đại diện đang hoạt động</p>
            <p className="mt-2 text-center text-xs leading-5 text-[#d7e1dc]">
              Chọn ảnh khác sẽ thay ảnh đang hiển thị; file cũ vẫn an toàn trong thư viện.
            </p>
          </aside>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="retro-label">Hình ảnh</p>
              <h2 className="mt-3 font-display text-xl font-bold text-ink">Ảnh đại diện và ảnh bìa</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Chỉ một ảnh đại diện và một ảnh bìa được gắn vào trang chủ tại một thời điểm.
              </p>
            </div>
            <Link href="/admin/media" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <ImageIcon className="size-4" aria-hidden="true" />
              Mở thư viện ảnh
            </Link>
          </div>

          <fieldset>
            <legend className="text-sm font-bold text-ink">Ảnh đại diện</legend>
            <p className="mt-1 text-xs leading-5 text-muted">
              Ảnh upload trong nhóm “Ảnh đại diện” được chuyển WebP và tự động dùng cho trang chủ.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <EmptyMediaChoice
                name="avatarMediaId"
                selected={!avatarId}
                onSelect={() => setAvatarId("")}
                label="Dùng chữ viết tắt"
              />
              {data.avatars.map((item) => (
                <MediaChoice
                  key={item.id}
                  item={item}
                  name="avatarMediaId"
                  selectedId={avatarId}
                  onSelect={setAvatarId}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="border-t-2 border-dashed border-line/30 pt-6">
            <legend className="text-sm font-bold text-ink">Ảnh bìa</legend>
            <p className="mt-1 text-xs leading-5 text-muted">
              Để trống nếu muốn tiếp tục dùng phong cảnh voxel mặc định.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <EmptyMediaChoice
                name="backgroundMediaId"
                selected={!backgroundId}
                onSelect={() => setBackgroundId("")}
                label="Phong cảnh mặc định"
              />
              {data.banners.map((item) => (
                <MediaChoice
                  key={item.id}
                  item={item}
                  name="backgroundMediaId"
                  selectedId={backgroundId}
                  onSelect={setBackgroundId}
                />
              ))}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="retro-label">Liên kết ngoài</p>
              <h2 className="mt-3 font-display text-xl font-bold text-ink">Kênh liên hệ công khai</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Thêm, sửa hoặc xóa Facebook, Telegram, email và các địa chỉ khác.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={socialLinks.length >= 8}
              onClick={() =>
                setSocialLinks((current) => [
                  ...current,
                  { key: crypto.randomUUID(), label: "", href: "", icon: "link" },
                ])
              }
            >
              <Plus className="size-4" aria-hidden="true" />
              Thêm liên kết
            </Button>
          </div>

          {socialLinks.length ? (
            <div className="space-y-4">
              {socialLinks.map((item, index) => (
                <div
                  key={item.key}
                  className="grid gap-3 rounded-sm border-[3px] border-line bg-surface-alt p-4 shadow-[3px_3px_0_var(--ds-shadow)] md:grid-cols-[10rem_minmax(0,1fr)_9rem_auto] md:items-end"
                >
                  <label className="text-xs font-bold text-ink">
                    Tên
                    <Input
                      name="socialLabel"
                      value={item.label}
                      maxLength={40}
                      onChange={(event) => updateSocialLink(index, "label", event.target.value)}
                      placeholder="Facebook"
                      className="mt-1.5"
                      required
                    />
                  </label>
                  <label className="min-w-0 text-xs font-bold text-ink">
                    Địa chỉ
                    <Input
                      name="socialHref"
                      value={item.href}
                      maxLength={500}
                      onChange={(event) => updateSocialLink(index, "href", event.target.value)}
                      placeholder="https://... hoặc mailto:..."
                      className="mt-1.5"
                      required
                    />
                  </label>
                  <label className="text-xs font-bold text-ink">
                    Biểu tượng
                    <select
                      name="socialIcon"
                      value={item.icon}
                      onChange={(event) => updateSocialLink(index, "icon", event.target.value)}
                      className="mt-1.5 h-12 w-full rounded-sm border-[3px] border-line bg-surface px-3 text-sm font-semibold text-ink shadow-[3px_3px_0_var(--ds-shadow)] outline-none focus:ring-3 focus:ring-sky"
                    >
                      <option value="facebook">Facebook</option>
                      <option value="send">Telegram</option>
                      <option value="mail">Email</option>
                      <option value="link">Liên kết</option>
                    </select>
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Xóa liên kết ${item.label || index + 1}`}
                    onClick={() =>
                      setSocialLinks((current) => current.filter((_, itemIndex) => itemIndex !== index))
                    }
                    className="text-danger hover:bg-pink hover:text-[#10212b]"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border-[3px] border-dashed border-line bg-surface-alt p-6 text-center">
              <ExternalLink className="mx-auto size-7 text-forest" aria-hidden="true" />
              <p className="mt-2 text-sm font-bold text-ink">Chưa có liên kết ngoài</p>
              <p className="mt-1 text-xs text-muted">Trang chủ sẽ tự ẩn khu vực này.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="sticky bottom-3 z-20 flex flex-col gap-3 rounded-sm border-[3px] border-line bg-surface p-4 shadow-[6px_6px_0_var(--ds-shadow)] sm:flex-row sm:items-center sm:justify-between lg:bottom-5">
        <p role="status" aria-live="polite" className="text-sm font-semibold text-muted">
          {state.status === "error" ? state.message : "Lưu một lần để cập nhật toàn bộ thông tin công khai."}
        </p>
        <SaveButton />
      </div>
    </form>
  );
}
