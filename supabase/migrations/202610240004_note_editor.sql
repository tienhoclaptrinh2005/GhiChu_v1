begin;

create or replace function public.save_note(
  p_note_id uuid,
  p_title text,
  p_slug text,
  p_excerpt text,
  p_status public.note_status,
  p_is_pinned boolean,
  p_parent_id uuid,
  p_category_ids uuid[],
  p_content jsonb,
  p_plain_text text,
  p_change_summary text,
  p_seo_title text,
  p_seo_description text,
  p_reading_time_minutes integer
)
returns public.notes
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_note_id uuid;
  v_version_id uuid;
  v_version_number integer;
  v_result public.notes;
  v_action text;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if jsonb_typeof(p_content) <> 'object' or p_content ->> 'type' <> 'doc' then
    raise exception 'invalid note content' using errcode = '22023';
  end if;

  if p_reading_time_minutes < 1 then
    raise exception 'invalid reading time' using errcode = '22023';
  end if;

  if p_note_id is null then
    insert into public.notes (
      title,
      slug,
      excerpt,
      status,
      is_pinned,
      parent_id,
      seo_title,
      seo_description,
      reading_time_minutes,
      created_by
    )
    values (
      p_title,
      p_slug,
      p_excerpt,
      'DRAFT',
      p_is_pinned,
      p_parent_id,
      p_seo_title,
      p_seo_description,
      p_reading_time_minutes,
      auth.uid()
    )
    returning id into v_note_id;

    v_version_number := 1;
    v_action := 'NOTE_CREATED';
  else
    select id
    into v_note_id
    from public.notes
    where id = p_note_id
      and deleted_at is null
    for update;

    if v_note_id is null then
      raise exception 'note not found' using errcode = 'P0002';
    end if;

    select coalesce(max(version_number), 0) + 1
    into v_version_number
    from public.note_versions
    where note_id = v_note_id;

    v_action := 'NOTE_UPDATED';
  end if;

  if p_parent_id = v_note_id then
    raise exception 'note cannot be its own parent' using errcode = '23514';
  end if;

  insert into public.note_versions (
    note_id,
    version_number,
    title,
    content,
    plain_text,
    change_summary,
    created_by
  )
  values (
    v_note_id,
    v_version_number,
    p_title,
    p_content,
    p_plain_text,
    nullif(btrim(p_change_summary), ''),
    auth.uid()
  )
  returning id into v_version_id;

  update public.notes
  set title = p_title,
      slug = p_slug,
      excerpt = p_excerpt,
      status = p_status,
      is_pinned = p_is_pinned,
      parent_id = p_parent_id,
      current_version_id = v_version_id,
      published_version_id = case
        when p_status = 'PUBLIC' then v_version_id
        else published_version_id
      end,
      published_at = case
        when p_status = 'PUBLIC' then now()
        else published_at
      end,
      seo_title = p_seo_title,
      seo_description = p_seo_description,
      reading_time_minutes = p_reading_time_minutes,
      deleted_at = null
  where id = v_note_id
  returning * into v_result;

  delete from public.note_categories where note_id = v_note_id;

  insert into public.note_categories (note_id, category_id)
  select v_note_id, selected.category_id
  from unnest(coalesce(p_category_ids, '{}'::uuid[])) as selected(category_id)
  join public.categories on categories.id = selected.category_id
  where categories.is_active = true
  on conflict do nothing;

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
    'note',
    v_note_id,
    jsonb_build_object(
      'version_id', v_version_id,
      'version_number', v_version_number,
      'status', p_status,
      'category_count', coalesce(array_length(p_category_ids, 1), 0)
    )
  );

  return v_result;
end;
$$;

revoke all on function public.save_note(
  uuid,
  text,
  text,
  text,
  public.note_status,
  boolean,
  uuid,
  uuid[],
  jsonb,
  text,
  text,
  text,
  text,
  integer
) from public;

grant execute on function public.save_note(
  uuid,
  text,
  text,
  text,
  public.note_status,
  boolean,
  uuid,
  uuid[],
  jsonb,
  text,
  text,
  text,
  text,
  integer
) to authenticated;

commit;
