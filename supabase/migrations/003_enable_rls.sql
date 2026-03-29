-- =============================================
-- 3. RLS 활성화 + 정책 생성
-- =============================================

-- ---- profiles ----
alter table public.profiles enable row level security;

create policy "profiles_select"
  on public.profiles for select
  using (true);

create policy "profiles_update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---- posts ----
alter table public.posts enable row level security;

create policy "posts_select"
  on public.posts for select
  using (true);

create policy "posts_insert"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "posts_update"
  on public.posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- ---- applications ----
alter table public.applications enable row level security;

create policy "applications_select"
  on public.applications for select
  using (
    auth.uid() = applicant_id
    or auth.uid() = (select author_id from public.posts where id = post_id)
  );

create policy "applications_insert"
  on public.applications for insert
  with check (
    auth.uid() = applicant_id
    and auth.uid() != (select author_id from public.posts where id = post_id)
  );

create policy "applications_update"
  on public.applications for update
  using (
    auth.uid() = (select author_id from public.posts where id = post_id)
  );

-- ---- notifications ----
alter table public.notifications enable row level security;

create policy "notifications_select"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_update"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
