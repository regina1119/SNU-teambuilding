import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { PostActions } from "@/components/posts/post-actions";
import { ApplySection } from "@/components/posts/apply-section";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles!author_id(*)")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthor = user?.id === post.author_id;

  // 현재 사용자의 지원 여부
  let myApplication = null;
  if (user && !isAuthor) {
    const { data } = await supabase
      .from("applications")
      .select("id, status")
      .eq("post_id", id)
      .eq("applicant_id", user.id)
      .maybeSingle();
    myApplication = data;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{post.contest_name}</h1>
          {post.contest_url && (
            <a
              href={post.contest_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground underline"
            >
              공모전 링크
            </a>
          )}
        </div>
        <StatusBadge status={post.status} />
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {post.roles.map((role: string) => (
            <Badge key={role} variant="outline">
              {role}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>모집 인원: {post.recruit_count}명</div>
          <div>모집 마감: {post.recruit_deadline}</div>
          {post.contest_deadline && (
            <div>공모전 마감: {post.contest_deadline}</div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">팀 소개</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {post.description}
        </p>
      </div>

      <div className="mb-8 rounded-lg border p-4">
        <h2 className="mb-2 text-sm font-semibold">팀장</h2>
        <div className="text-sm">
          <p className="font-medium">{post.profiles?.name}</p>
          <p className="text-muted-foreground">
            {post.profiles?.department} · {post.profiles?.grade}
          </p>
          {post.profiles?.skills?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {post.profiles.skills.map((skill: string) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {isAuthor && <PostActions postId={id} status={post.status} />}

      {!isAuthor && user && (
        <ApplySection
          postId={id}
          userId={user.id}
          postStatus={post.status}
          myApplication={myApplication}
        />
      )}

      {!user && (
        <a
          href="/login"
          className="inline-flex h-10 w-full items-center justify-center rounded-4xl bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          로그인 후 지원하기
        </a>
      )}
    </div>
  );
}
