-- =============================================
-- 2. 인덱스 생성
-- =============================================

-- 모집글 리스트: 상태 필터 + 최신순 정렬
create index idx_posts_status_created on public.posts (status, created_at desc);

-- 모집글 검색: 공모전 이름
create index idx_posts_contest_name on public.posts using gin (to_tsvector('simple', contest_name));

-- 지원: 모집글별 지원자 조회
create index idx_applications_post_id on public.applications (post_id);

-- 지원: 사용자별 지원 현황 조회
create index idx_applications_applicant_id on public.applications (applicant_id);

-- 알림: 사용자별 알림 조회 (읽지 않은 것 우선)
create index idx_notifications_user_id on public.notifications (user_id, is_read, created_at desc);
