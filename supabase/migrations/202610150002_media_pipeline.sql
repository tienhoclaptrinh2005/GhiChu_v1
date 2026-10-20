begin;

create type public.media_status as enum ('PENDING', 'READY', 'FAILED', 'DELETED');

alter table public.media_files
  add column folder text not null default 'notes',
  add column status public.media_status not null default 'READY',
  add column requested_visibility public.media_visibility not null default 'PRIVATE',
  add column failure_reason text,
  add column expires_at timestamptz,
  add column verified_at timestamptz,
  add column deleted_at timestamptz,
  add constraint media_folder_allowed
    check (folder in ('avatars', 'banners', 'notes', 'attachments'));

update public.media_files
set requested_visibility = visibility,
    verified_at = coalesce(updated_at, created_at)
where status = 'READY';

alter table public.media_files
  alter column status set default 'PENDING',
  add constraint ready_media_is_verified
    check (status <> 'READY' or verified_at is not null),
  add constraint deleted_media_has_timestamp
    check (status <> 'DELETED' or deleted_at is not null);

drop policy "public can read public media metadata" on public.media_files;
create policy "public can read ready public media metadata"
on public.media_files for select
to anon, authenticated
using (
  visibility = 'PUBLIC'
  and status = 'READY'
  and deleted_at is null
);

drop index if exists public.media_visibility_created_idx;
create index media_ready_visibility_created_idx
  on public.media_files (visibility, created_at desc)
  where status = 'READY' and deleted_at is null;
create index media_pending_expiry_idx
  on public.media_files (expires_at)
  where status = 'PENDING';

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
      where position(p_media_id::text in coalesce(avatar_url, '')) > 0
         or position(p_media_id::text in coalesce(background_image_url, '')) > 0)
  into result;

  return result;
end;
$$;

revoke all on function public.media_reference_count(uuid) from public;
grant execute on function public.media_reference_count(uuid) to authenticated;

commit;
