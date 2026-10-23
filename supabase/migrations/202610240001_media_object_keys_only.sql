begin;

alter table public.site_settings
  add column avatar_media_id uuid references public.media_files(id) on delete set null,
  add column background_media_id uuid references public.media_files(id) on delete set null;

-- Chuyển các URL cũ (/api/media/<uuid> hoặc URL tuyệt đối) thành quan hệ media.
update public.site_settings as settings
set avatar_media_id = media.id
from public.media_files as media
where settings.avatar_url is not null
  and position(media.id::text in settings.avatar_url) > 0;

update public.site_settings as settings
set background_media_id = media.id
from public.media_files as media
where settings.background_image_url is not null
  and position(media.id::text in settings.background_image_url) > 0;

-- Giữ ảnh đại diện mới nhất nếu dữ liệu cũ chưa có liên kết rõ ràng.
update public.site_settings
set avatar_media_id = (
  select media.id
  from public.media_files as media
  where media.folder = 'avatars'
    and media.status = 'READY'
    and media.visibility = 'PUBLIC'
    and media.deleted_at is null
  order by media.created_at desc
  limit 1
)
where avatar_media_id is null;

create or replace function public.media_reference_count(p_media_id uuid)
returns bigint
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  result bigint;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select
    (select count(*) from public.notes where cover_media_id = p_media_id)
    + (select count(*) from public.page_blocks
      where position(p_media_id::text in content::text) > 0)
    + (select count(*) from public.note_versions
      where position(p_media_id::text in content::text) > 0)
    + (select count(*) from public.site_settings
      where avatar_media_id = p_media_id
         or background_media_id = p_media_id)
  into result;

  return result;
end;
$$;

alter table public.media_files
  drop constraint if exists public_media_has_url,
  drop column public_url;

alter table public.site_settings
  drop column avatar_url,
  drop column background_image_url;

comment on column public.media_files.object_key is
  'Đường dẫn tương đối duy nhất của object trong R2; URL công khai được dựng khi đọc dữ liệu.';
comment on column public.site_settings.avatar_media_id is
  'Ảnh đại diện đang hoạt động; URL được dựng từ media_files.object_key.';
comment on column public.site_settings.background_media_id is
  'Ảnh bìa đang hoạt động; URL được dựng từ media_files.object_key.';

commit;
