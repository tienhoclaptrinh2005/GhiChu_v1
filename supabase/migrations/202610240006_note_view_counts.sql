begin;

create table public.note_view_stats (
  note_id uuid primary key references public.notes(id) on delete cascade,
  view_count bigint not null default 0,
  created_at timestamptz not null default now(),
  constraint note_view_count_nonnegative check (view_count >= 0)
);

create table public.note_view_visitors (
  note_id uuid not null references public.notes(id) on delete cascade,
  visitor_hash text not null,
  last_counted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (note_id, visitor_hash),
  constraint note_view_visitor_hash_format
    check (visitor_hash ~ '^[0-9a-f]{64}$')
);

alter table public.note_view_stats enable row level security;
alter table public.note_view_visitors enable row level security;

create policy "public can read public note view stats"
on public.note_view_stats for select
to anon, authenticated
using (
  exists (
    select 1
    from public.notes
    where notes.id = note_view_stats.note_id
      and notes.status = 'PUBLIC'
      and notes.deleted_at is null
      and notes.published_version_id is not null
  )
);

create policy "admin can read all note view stats"
on public.note_view_stats for select
to authenticated
using (public.is_admin());

create or replace function public.register_note_view(
  p_note_id uuid,
  p_visitor_hash text
)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_should_increment boolean := false;
  v_view_count bigint;
begin
  if p_visitor_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid visitor hash' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.notes
    where id = p_note_id
      and status = 'PUBLIC'
      and deleted_at is null
      and published_version_id is not null
  ) then
    raise exception 'public note not found' using errcode = 'P0002';
  end if;

  insert into public.note_view_stats (note_id)
  values (p_note_id)
  on conflict (note_id) do nothing;

  insert into public.note_view_visitors (note_id, visitor_hash)
  values (p_note_id, p_visitor_hash)
  on conflict (note_id, visitor_hash) do nothing;

  v_should_increment := found;

  if not v_should_increment then
    update public.note_view_visitors
    set last_counted_at = now()
    where note_id = p_note_id
      and visitor_hash = p_visitor_hash
      and last_counted_at <= now() - interval '24 hours';

    v_should_increment := found;
  end if;

  if v_should_increment then
    update public.note_view_stats
    set view_count = view_count + 1
    where note_id = p_note_id
    returning view_count into v_view_count;
  else
    select view_count
    into v_view_count
    from public.note_view_stats
    where note_id = p_note_id;
  end if;

  return coalesce(v_view_count, 0);
end;
$$;

revoke all on table public.note_view_stats from public, anon, authenticated;
revoke all on table public.note_view_visitors from public, anon, authenticated;
grant select on table public.note_view_stats to anon, authenticated;
grant all privileges on table public.note_view_stats to service_role;
grant all privileges on table public.note_view_visitors to service_role;

revoke all on function public.register_note_view(uuid, text)
  from public, anon, authenticated;
grant execute on function public.register_note_view(uuid, text) to service_role;

commit;
