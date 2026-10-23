"use server";

import { revalidatePath, updateTag } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { updateR2ObjectCachePolicy } from "@/lib/r2/verify";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  HOME_BLOCKS_CACHE_TAG,
  SITE_SETTINGS_CACHE_TAG,
} from "@/features/site/queries";
import {
  quickLinksEditorSchema,
  siteSettingsSchema,
} from "@/features/site/schema";

export type SiteSettingsActionState = {
  status: "idle" | "success" | "error";
  message: string;
  revision: number;
};

export type QuickLinksActionState = SiteSettingsActionState;

function formText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function socialLinksFromForm(formData: FormData) {
  const labels = formData.getAll("socialLabel").map(String);
  const hrefs = formData.getAll("socialHref").map(String);
  const icons = formData.getAll("socialIcon").map(String);
  const rowCount = Math.max(labels.length, hrefs.length, icons.length);

  return Array.from({ length: rowCount }, (_, index) => ({
    label: labels[index]?.trim() ?? "",
    href: hrefs[index]?.trim() ?? "",
    icon: icons[index]?.trim() || "link",
  })).filter((item) => item.label || item.href);
}

function quickLinksFromForm(formData: FormData) {
  const ids = formData.getAll("quickLinkId").map(String);
  const titles = formData.getAll("quickLinkTitle").map(String);
  const descriptions = formData.getAll("quickLinkDescription").map(String);
  const hrefs = formData.getAll("quickLinkHref").map(String);
  const icons = formData.getAll("quickLinkIcon").map(String);
  const tones = formData.getAll("quickLinkTone").map(String);
  const newTabs = formData.getAll("quickLinkNewTab").map(String);
  const rowCount = Math.max(
    ids.length,
    titles.length,
    descriptions.length,
    hrefs.length,
    icons.length,
    tones.length,
    newTabs.length,
  );

  return Array.from({ length: rowCount }, (_, index) => ({
    id: ids[index]?.trim() ?? "",
    title: titles[index]?.trim() ?? "",
    description: descriptions[index]?.trim() ?? "",
    href: hrefs[index]?.trim() ?? "",
    icon: icons[index]?.trim() || "link",
    tone: tones[index]?.trim() || "blue",
    newTab: newTabs[index] === "true",
  }));
}

export async function updateSiteSettingsAction(
  _previousState: SiteSettingsActionState,
  formData: FormData,
): Promise<SiteSettingsActionState> {
  const admin = await requireAdmin();
  const parsed = siteSettingsSchema.safeParse({
    displayName: formText(formData, "displayName"),
    headline: formText(formData, "headline"),
    description: formText(formData, "description"),
    avatarMediaId: formText(formData, "avatarMediaId"),
    backgroundMediaId: formText(formData, "backgroundMediaId"),
    socialLinks: socialLinksFromForm(formData),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Thông tin trang chủ chưa hợp lệ.",
      revision: Date.now(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const selectedMediaIds = [
    ...new Set(
      [parsed.data.avatarMediaId, parsed.data.backgroundMediaId].filter(
        (id): id is string => Boolean(id),
      ),
    ),
  ];

  if (selectedMediaIds.length) {
    const { data: selectedMedia, error: mediaError } = await supabase
      .from("media_files")
      .select("id, folder, status, object_key, mime_type")
      .in("id", selectedMediaIds)
      .eq("status", "READY")
      .is("deleted_at", null);

    if (mediaError || selectedMedia?.length !== selectedMediaIds.length) {
      return {
        status: "error",
        message: "Ảnh đã chọn không còn sẵn sàng. Hãy chọn lại từ thư viện.",
        revision: Date.now(),
      };
    }

    const avatar = selectedMedia.find((item) => item.id === parsed.data.avatarMediaId);
    const background = selectedMedia.find(
      (item) => item.id === parsed.data.backgroundMediaId,
    );
    if (avatar && avatar.folder !== "avatars") {
      return {
        status: "error",
        message: "File được chọn không thuộc nhóm ảnh đại diện.",
        revision: Date.now(),
      };
    }
    if (background && background.folder !== "banners") {
      return {
        status: "error",
        message: "File được chọn không thuộc nhóm ảnh bìa.",
        revision: Date.now(),
      };
    }

    for (const media of selectedMedia) {
      try {
        await updateR2ObjectCachePolicy({
          objectKey: media.object_key,
          mediaId: media.id,
          contentType: media.mime_type,
          visibility: "PUBLIC",
        });
      } catch {
        return {
          status: "error",
          message: "Không thể bật cache CDN cho ảnh đã chọn.",
          revision: Date.now(),
        };
      }

      const { error } = await supabase
        .from("media_files")
        .update({
          visibility: "PUBLIC",
          requested_visibility: "PUBLIC",
        })
        .eq("id", media.id)
        .eq("status", "READY");
      if (error) {
        return {
          status: "error",
          message: "Không thể cấp quyền hiển thị cho ảnh đã chọn.",
          revision: Date.now(),
        };
      }
    }
  }

  const { data: updatedSettings, error } = await supabase
    .from("site_settings")
    .update({
      display_name: parsed.data.displayName,
      headline: parsed.data.headline,
      description: parsed.data.description,
      avatar_media_id: parsed.data.avatarMediaId || null,
      background_media_id: parsed.data.backgroundMediaId || null,
      social_links: parsed.data.socialLinks,
    })
    .eq("id", 1)
    .select("id")
    .maybeSingle();

  if (error || !updatedSettings) {
    return {
      status: "error",
      message: "Không thể lưu thông tin trang chủ. Hãy thử lại.",
      revision: Date.now(),
    };
  }

  await supabase.from("audit_logs").insert({
    actor_id: admin.user.id,
    action: "SITE_SETTINGS_UPDATED",
    entity_type: "site_settings",
    entity_id: null,
    metadata: {
      avatar_media_id: parsed.data.avatarMediaId || null,
      background_media_id: parsed.data.backgroundMediaId || null,
      social_link_count: parsed.data.socialLinks.length,
    },
  });

  updateTag(SITE_SETTINGS_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/admin/settings");

  return {
    status: "success",
    message: "Đã cập nhật trang chủ. Thay đổi đã hiển thị bên ngoài.",
    revision: Date.now(),
  };
}

export async function updateQuickLinksAction(
  _previousState: QuickLinksActionState,
  formData: FormData,
): Promise<QuickLinksActionState> {
  const admin = await requireAdmin();
  const parsed = quickLinksEditorSchema.safeParse({
    blockName: formText(formData, "blockName"),
    items: quickLinksFromForm(formData),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Danh sách liên kết chưa hợp lệ.",
      revision: Date.now(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: homePage, error: pageError } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", "home")
    .maybeSingle();

  if (pageError || !homePage) {
    return {
      status: "error",
      message: "Không tìm thấy trang chủ để lưu liên kết.",
      revision: Date.now(),
    };
  }

  const submittedBlockId = formText(formData, "blockId");
  let block: { id: string } | null = null;
  if (submittedBlockId) {
    const { data, error } = await supabase
      .from("page_blocks")
      .select("id")
      .eq("id", submittedBlockId)
      .eq("page_id", homePage.id)
      .eq("type", "BUTTON")
      .maybeSingle();
    if (error) {
      return {
        status: "error",
        message: "Không thể xác minh khu vực liên kết nhanh.",
        revision: Date.now(),
      };
    }
    block = data;
  }

  if (!block) {
    const { data, error } = await supabase
      .from("page_blocks")
      .select("id")
      .eq("page_id", homePage.id)
      .eq("type", "BUTTON")
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) {
      return {
        status: "error",
        message: "Không thể kiểm tra khu vực liên kết nhanh.",
        revision: Date.now(),
      };
    }
    block = data;
  }

  const content = {
    layout: "stack",
    items: parsed.data.items.map((item) => ({
      ...item,
      external: /^(https?:\/\/|mailto:|tel:)/i.test(item.href),
    })),
  };

  let savedBlockId: string;
  if (block) {
    const { data, error } = await supabase
      .from("page_blocks")
      .update({
        name: parsed.data.blockName,
        content,
        is_active: true,
      })
      .eq("id", block.id)
      .eq("page_id", homePage.id)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      return {
        status: "error",
        message: "Không thể lưu danh sách liên kết. Hãy thử lại.",
        revision: Date.now(),
      };
    }
    savedBlockId = data.id;
  } else {
    const { data: lastBlock, error: positionError } = await supabase
      .from("page_blocks")
      .select("position")
      .eq("page_id", homePage.id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (positionError) {
      return {
        status: "error",
        message: "Không thể xác định vị trí cho khu vực liên kết.",
        revision: Date.now(),
      };
    }

    const { data, error } = await supabase
      .from("page_blocks")
      .insert({
        page_id: homePage.id,
        type: "BUTTON",
        name: parsed.data.blockName,
        content,
        styles: {},
        position: (lastBlock?.position ?? -1) + 1,
        is_active: true,
      })
      .select("id")
      .single();
    if (error || !data) {
      return {
        status: "error",
        message: "Không thể tạo khu vực liên kết nhanh.",
        revision: Date.now(),
      };
    }
    savedBlockId = data.id;
  }

  await supabase.from("audit_logs").insert({
    actor_id: admin.user.id,
    action: "QUICK_LINKS_UPDATED",
    entity_type: "page_blocks",
    entity_id: savedBlockId,
    metadata: { quick_link_count: parsed.data.items.length },
  });

  updateTag(HOME_BLOCKS_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/admin/links");

  return {
    status: "success",
    message: "Đã cập nhật liên kết nhanh trên trang chủ.",
    revision: Date.now(),
  };
}
