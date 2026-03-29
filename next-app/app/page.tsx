import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: recentPosts } = await supabase
    .from("posts")
    .select("*, profiles!author_id(name, department)")
    .eq("status", "recruiting")
    .order("created_at", { ascending: false })
    .range(0, 5);

  return (
    <div className="mx-auto max-w-3xl px-4">
      {/* 히어로 섹션 */}
      <section className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight">SNU TeamUp</h1>
        <p className="max-w-md text-muted-foreground">
          서울대학교 공모전 팀빌딩 플랫폼.
          <br />
          함께할 팀원을 찾고, 공모전에 도전하세요.
        </p>
        <div className="flex gap-3">
          {user ? (
            <>
              <Button asChild>
                <Link href="/posts">모집글 보러가기</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/posts/new">모집글 작성</Link>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">시작하기</Link>
            </Button>
          )}
        </div>
      </section>

      {/* 최근 모집글 */}
      {recentPosts && recentPosts.length > 0 && (
        <section className="pb-16">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">최근 모집글</h2>
            <Link
              href="/posts"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              전체보기
            </Link>
          </div>
          <div className="grid gap-4">
            {recentPosts.map((post: any) => (
              <PostCard
                key={post.id}
                id={post.id}
                contestName={post.contest_name}
                roles={post.roles}
                recruitDeadline={post.recruit_deadline}
                recruitCount={post.recruit_count}
                status={post.status}
                authorName={post.profiles?.name || ""}
                authorDepartment={post.profiles?.department || ""}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
