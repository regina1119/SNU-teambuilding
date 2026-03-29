-- =============================================
-- 4. Functions + Triggers
-- =============================================

-- ---- 회원가입 시 profiles 자동 생성 ----
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---- profiles updated_at 자동 갱신 ----
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profiles_updated
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- ---- 지원 시 팀장에게 알림 생성 ----
create or replace function public.handle_new_application()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_author_id uuid;
  v_contest_name text;
  v_applicant_name text;
begin
  select author_id, contest_name into v_author_id, v_contest_name
  from public.posts where id = new.post_id;

  select name into v_applicant_name
  from public.profiles where id = new.applicant_id;

  insert into public.notifications (user_id, type, message, post_id)
  values (
    v_author_id,
    'new_application',
    v_applicant_name || '님이 [' || v_contest_name || '] 팀에 지원했습니다',
    new.post_id
  );

  return new;
end;
$$;

create trigger on_application_created
  after insert on public.applications
  for each row
  execute function public.handle_new_application();

-- ---- 승인/거절 시 지원자에게 알림 생성 ----
create or replace function public.handle_application_status_change()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_contest_name text;
  v_message text;
begin
  if old.status = new.status then
    return new;
  end if;

  select contest_name into v_contest_name
  from public.posts where id = new.post_id;

  if new.status = 'accepted' then
    v_message := '[' || v_contest_name || '] 팀에 승인되었습니다';
  elsif new.status = 'rejected' then
    v_message := '[' || v_contest_name || '] 팀 지원이 거절되었습니다';
  else
    return new;
  end if;

  insert into public.notifications (user_id, type, message, post_id)
  values (
    new.applicant_id,
    new.status,
    v_message,
    new.post_id
  );

  return new;
end;
$$;

create trigger on_application_status_changed
  after update on public.applications
  for each row
  execute function public.handle_application_status_change();
