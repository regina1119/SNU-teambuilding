import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/posts/post-card";
import { PostFilters } from "@/components/posts/post-filters";
import { EmptyState } from "@/components/shared/empty-state";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; status?: string }>;
}) {
  const { q, role, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select("*, profiles!author_id(name, department)")
    .order("created_at", { ascending: false });

  if (status === "recruiting") {
    query = query.eq("status", "recruiting");
  }
  if (role) {
    query = query.contains("roles", [role]);
  }
  if (q) {
    query = query.ilike("contest_name", `%${q}%`);
  }

  const { data: posts } = await query;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">모집글</h1>
        <a
          href="/posts/new"
          className="inline-flex h-9 items-center rounded-4xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          모집글 작성
        </a>
      </div>

      <PostFilters />

      <div className="mt-6 grid gap-4">
        {posts && posts.length > 0 ? (
          posts.map((post: any) => (
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
          ))
        ) : (
          <EmptyState message="모집글이 없습니다." />
        )}
      </div>
    </div>
  );
}
