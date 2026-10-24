begin;

create or replace function public.save_category(
  p_category_id uuid,
  p_name text,
  p_slug text,
  p_description text,
  p_color text,
  p_parent_id uuid,
  p_position integer,
  p_is_active boolean
)
returns public.categories
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_category_id uuid;
  v_result public.categories;
  v_action text;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if p_category_id is null then
    insert into public.categories (
      name,
      slug,
      description,
      color,
      parent_id,
      position,
      is_active
    )
    values (
      p_name,
      p_slug,
      nullif(btrim(p_description), ''),
      p_color,
      p_parent_id,
      p_position,
      p_is_active
    )
    returning * into v_result;

    v_category_id := v_result.id;
    v_action := 'CATEGORY_CREATED';
  else
    select id
    into v_category_id
    from public.categories
    where id = p_category_id
    for update;

    if v_category_id is null then
      raise exception 'category not found' using errcode = 'P0002';
    end if;

    if p_parent_id = v_category_id then
      raise exception 'category cannot be its own parent' using errcode = '23514';
    end if;

    if p_parent_id is not null and exists (
      with recursive ancestors as (
        select id, parent_id
        from public.categories
        where id = p_parent_id

        union

        select category.id, category.parent_id
        from public.categories as category
        join ancestors on category.id = ancestors.parent_id
      )
      select 1 from ancestors where id = v_category_id
    ) then
      raise exception 'category parent would create a cycle' using errcode = '23514';
    end if;

    update public.categories
    set name = p_name,
        slug = p_slug,
        description = nullif(btrim(p_description), ''),
        color = p_color,
        parent_id = p_parent_id,
        position = p_position,
        is_active = p_is_active
    where id = v_category_id
    returning * into v_result;

    v_action := 'CATEGORY_UPDATED';
  end if;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    v_action,
    'category',
    v_category_id,
    jsonb_build_object(
      'name', v_result.name,
      'slug', v_result.slug,
      'is_active', v_result.is_active,
      'parent_id', v_result.parent_id
    )
  );

  return v_result;
end;
$$;

create or replace function public.delete_category(p_category_id uuid)
returns public.categories
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result public.categories;
  v_note_count integer;
  v_child_count integer;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select *
  into v_result
  from public.categories
  where id = p_category_id
  for update;

  if v_result.id is null then
    raise exception 'category not found' using errcode = 'P0002';
  end if;

  select count(*) into v_note_count
  from public.note_categories
  where category_id = p_category_id;

  select count(*) into v_child_count
  from public.categories
  where parent_id = p_category_id;

  delete from public.categories where id = p_category_id;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    'CATEGORY_DELETED',
    'category',
    p_category_id,
    jsonb_build_object(
      'name', v_result.name,
      'slug', v_result.slug,
      'detached_note_count', v_note_count,
      'detached_child_count', v_child_count
    )
  );

  return v_result;
end;
$$;

create or replace function public.soft_delete_note(p_note_id uuid)
returns public.notes
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result public.notes;
  v_previous_status public.note_status;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select status
  into v_previous_status
  from public.notes
  where id = p_note_id
    and deleted_at is null
  for update;

  if v_previous_status is null then
    raise exception 'note not found' using errcode = 'P0002';
  end if;

  update public.notes
  set status = 'ARCHIVED',
      is_pinned = false,
      deleted_at = now()
  where id = p_note_id
  returning * into v_result;

  update public.notes
  set parent_id = null
  where parent_id = p_note_id
    and deleted_at is null;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    'NOTE_MOVED_TO_TRASH',
    'note',
    p_note_id,
    jsonb_build_object(
      'title', v_result.title,
      'slug', v_result.slug,
      'previous_status', v_previous_status
    )
  );

  return v_result;
end;
$$;

create or replace function public.restore_note(p_note_id uuid)
returns public.notes
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result public.notes;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update public.notes
  set status = 'DRAFT',
      is_pinned = false,
      deleted_at = null
  where id = p_note_id
    and deleted_at is not null
  returning * into v_result;

  if v_result.id is null then
    raise exception 'deleted note not found' using errcode = 'P0002';
  end if;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    'NOTE_RESTORED',
    'note',
    p_note_id,
    jsonb_build_object('title', v_result.title, 'slug', v_result.slug)
  );

  return v_result;
end;
$$;

revoke all on function public.save_category(
  uuid,
  text,
  text,
  text,
  text,
  uuid,
  integer,
  boolean
) from public;
revoke all on function public.delete_category(uuid) from public;
revoke all on function public.soft_delete_note(uuid) from public;
revoke all on function public.restore_note(uuid) from public;

grant execute on function public.save_category(
  uuid,
  text,
  text,
  text,
  text,
  uuid,
  integer,
  boolean
) to authenticated;
grant execute on function public.delete_category(uuid) to authenticated;
grant execute on function public.soft_delete_note(uuid) to authenticated;
grant execute on function public.restore_note(uuid) to authenticated;

commit;
