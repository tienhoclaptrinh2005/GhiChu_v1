begin;

create extension if not exists pgcrypto with schema extensions;

create type public.user_role as enum ('ADMIN');
create type public.page_status as enum ('DRAFT', 'PUBLISHED');
create type public.note_status as enum ('DRAFT', 'PRIVATE', 'PUBLIC', 'ARCHIVED');
create type public.block_type as enum (
  'TEXT',
  'HEADING',
  'BUTTON',
  'IMAGE',
  'BANNER',
  'VIDEO',
  'CARD',
  'DIVIDER',
  'NOTE_LIST',
  'SOCIAL_LINKS'
);
create type public.media_visibility as enum ('PUBLIC', 'PRIVATE');

create table public.admin_profiles (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  role public.user_role not null default 'ADMIN',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_email_is_lowercase check (email = lower(email))
);

create table public.site_settings (
  id smallint primary key default 1,
  display_name text not null default 'NoteSpace',
  headline text not null default 'Ghi lại điều hữu ích. Chia sẻ điều đáng nhớ.',
  description text not null default '',
  avatar_url text,
  background_image_url text,
  theme jsonb not null default '{"accent":"#5b5cf0","radius":"rounded","mode":"light"}'::jsonb,
  social_links jsonb not null default '[]'::jsonb,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint singleton_site_settings check (id = 1),
  constraint theme_is_object check (jsonb_typeof(theme) = 'object'),
  constraint social_links_is_array check (jsonb_typeof(social_links) = 'array')
);

create table public.media_files (
  id uuid primary key default extensions.gen_random_uuid(),
  object_key text not null unique,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  width integer,
  height integer,
  alt_text text,
  visibility public.media_visibility not null default 'PRIVATE',
  public_url text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_size_positive check (size_bytes > 0),
  constraint media_dimensions_positive check (
    (width is null or width > 0) and (height is null or height > 0)
  ),
  constraint public_media_has_url check (
    visibility <> 'PUBLIC' or public_url is not null
  )
);

create table public.pages (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null,
  slug text not null unique,
  status public.page_status not null default 'DRAFT',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint page_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint published_page_has_date check (status <> 'PUBLISHED' or published_at is not null)
);

create table public.page_blocks (
  id uuid primary key default extensions.gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  type public.block_type not null,
  name text not null,
  content jsonb not null default '{}'::jsonb,
  styles jsonb not null default '{}'::jsonb,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint page_block_position_nonnegative check (position >= 0),
  constraint block_content_is_object check (jsonb_typeof(content) = 'object'),
  constraint block_styles_is_object check (jsonb_typeof(styles) = 'object'),
  unique (page_id, position)
);

create table public.categories (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  color text not null default '#5b5cf0',
  parent_id uuid references public.categories(id) on delete set null,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint category_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint category_position_nonnegative check (position >= 0),
  constraint category_color_hex check (color ~ '^#[0-9a-fA-F]{6}$'),
  constraint category_not_own_parent check (parent_id is null or parent_id <> id)
);

create table public.notes (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  status public.note_status not null default 'DRAFT',
  is_pinned boolean not null default false,
  parent_id uuid references public.notes(id) on delete set null,
  current_version_id uuid,
  published_version_id uuid,
  cover_media_id uuid references public.media_files(id) on delete set null,
  seo_title text,
  seo_description text,
  reading_time_minutes integer not null default 1,
  published_at timestamptz,
  deleted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_document tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(excerpt, '')), 'B')
  ) stored,
  constraint note_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint note_not_own_parent check (parent_id is null or parent_id <> id),
  constraint reading_time_positive check (reading_time_minutes > 0),
  constraint note_title_length check (char_length(title) between 3 and 160),
  constraint note_excerpt_length check (char_length(excerpt) <= 320)
);

create table public.note_versions (
  id uuid primary key default extensions.gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  version_number integer not null,
  title text not null,
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  plain_text text not null default '',
  change_summary text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint version_number_positive check (version_number > 0),
  constraint version_content_is_object check (jsonb_typeof(content) = 'object'),
  unique (note_id, version_number)
);

alter table public.notes
  add constraint notes_current_version_fk
    foreign key (current_version_id) references public.note_versions(id) on delete restrict,
  add constraint notes_published_version_fk
    foreign key (published_version_id) references public.note_versions(id) on delete restrict,
  add constraint public_note_has_published_version
    check (
      status <> 'PUBLIC' or
      (published_version_id is not null and published_at is not null and deleted_at is null)
    );

create table public.note_categories (
  note_id uuid not null references public.notes(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (note_id, category_id)
);

create table public.audit_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  created_at timestamptz not null default now(),
  constraint audit_metadata_is_object check (jsonb_typeof(metadata) = 'object')
);

create index notes_public_listing_idx
  on public.notes (is_pinned desc, published_at desc)
  where status = 'PUBLIC' and deleted_at is null;
create index notes_status_idx on public.notes (status) where deleted_at is null;
create index notes_parent_idx on public.notes (parent_id) where parent_id is not null;
create index notes_search_idx on public.notes using gin (search_document);
create index note_versions_note_created_idx on public.note_versions (note_id, created_at desc);
create index page_blocks_page_position_idx on public.page_blocks (page_id, position);
create index categories_parent_position_idx on public.categories (parent_id, position);
create index note_categories_category_idx on public.note_categories (category_id, note_id);
create index media_visibility_created_idx on public.media_files (visibility, created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger admin_profiles_set_updated_at before update on public.admin_profiles
for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();
create trigger media_files_set_updated_at before update on public.media_files
for each row execute function public.set_updated_at();
create trigger pages_set_updated_at before update on public.pages
for each row execute function public.set_updated_at();
create trigger page_blocks_set_updated_at before update on public.page_blocks
for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger notes_set_updated_at before update on public.notes
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role = 'ADMIN'
      and is_active = true
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.validate_note_version_pointers()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.current_version_id is not null and not exists (
    select 1 from public.note_versions
    where id = new.current_version_id and note_id = new.id
  ) then
    raise exception 'current_version_id must belong to this note';
  end if;

  if new.published_version_id is not null and not exists (
    select 1 from public.note_versions
    where id = new.published_version_id and note_id = new.id
  ) then
    raise exception 'published_version_id must belong to this note';
  end if;

  return new;
end;
$$;

create trigger notes_validate_version_pointers
before insert or update of current_version_id, published_version_id on public.notes
for each row execute function public.validate_note_version_pointers();

create or replace function public.publish_note(
  p_note_id uuid,
  p_version_id uuid
)
returns public.notes
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  result public.notes;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.note_versions
    where id = p_version_id and note_id = p_note_id
  ) then
    raise exception 'version does not belong to note' using errcode = '23503';
  end if;

  update public.notes
  set status = 'PUBLIC',
      current_version_id = p_version_id,
      published_version_id = p_version_id,
      published_at = now(),
      deleted_at = null
  where id = p_note_id
  returning * into result;

  if result.id is null then
    raise exception 'note not found' using errcode = 'P0002';
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'NOTE_PUBLISHED', 'note', p_note_id, jsonb_build_object('version_id', p_version_id));

  return result;
end;
$$;

revoke all on function public.publish_note(uuid, uuid) from public;
grant execute on function public.publish_note(uuid, uuid) to authenticated;

alter table public.admin_profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.media_files enable row level security;
alter table public.pages enable row level security;
alter table public.page_blocks enable row level security;
alter table public.categories enable row level security;
alter table public.notes enable row level security;
alter table public.note_versions enable row level security;
alter table public.note_categories enable row level security;
alter table public.audit_logs enable row level security;

create policy "admin can read own profile"
on public.admin_profiles for select
to authenticated
using (user_id = auth.uid() and is_active = true);

create policy "public can read public site settings"
on public.site_settings for select
to anon, authenticated
using (is_public = true);
create policy "admin manages site settings"
on public.site_settings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read public media metadata"
on public.media_files for select
to anon, authenticated
using (visibility = 'PUBLIC');
create policy "admin manages media metadata"
on public.media_files for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published pages"
on public.pages for select
to anon, authenticated
using (status = 'PUBLISHED');
create policy "admin manages pages"
on public.pages for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read active blocks on published pages"
on public.page_blocks for select
to anon, authenticated
using (
  is_active = true and exists (
    select 1 from public.pages
    where pages.id = page_blocks.page_id and pages.status = 'PUBLISHED'
  )
);
create policy "admin manages page blocks"
on public.page_blocks for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read active categories"
on public.categories for select
to anon, authenticated
using (is_active = true);
create policy "admin manages categories"
on public.categories for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read published notes"
on public.notes for select
to anon, authenticated
using (status = 'PUBLIC' and deleted_at is null and published_version_id is not null);
create policy "admin manages notes"
on public.notes for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public can read currently published note versions"
on public.note_versions for select
to anon, authenticated
using (
  exists (
    select 1 from public.notes
    where notes.id = note_versions.note_id
      and notes.status = 'PUBLIC'
      and notes.deleted_at is null
      and notes.published_version_id = note_versions.id
  )
);
create policy "admin can read all note versions"
on public.note_versions for select
to authenticated
using (public.is_admin());
create policy "admin can create immutable note versions"
on public.note_versions for insert
to authenticated
with check (public.is_admin() and created_by = auth.uid());

create policy "public can read categories of public notes"
on public.note_categories for select
to anon, authenticated
using (
  exists (
    select 1 from public.notes
    where notes.id = note_categories.note_id
      and notes.status = 'PUBLIC'
      and notes.deleted_at is null
  )
);
create policy "admin manages note categories"
on public.note_categories for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin can read audit logs"
on public.audit_logs for select
to authenticated
using (public.is_admin());
create policy "admin can append audit logs"
on public.audit_logs for insert
to authenticated
with check (public.is_admin() and actor_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select on public.site_settings, public.media_files, public.pages, public.page_blocks,
  public.categories, public.notes, public.note_versions, public.note_categories
  to anon, authenticated;
grant select on public.admin_profiles, public.audit_logs to authenticated;
grant insert, update, delete on public.site_settings, public.media_files, public.pages,
  public.page_blocks, public.categories, public.notes, public.note_categories
  to authenticated;
grant insert on public.note_versions, public.audit_logs to authenticated;

commit;
