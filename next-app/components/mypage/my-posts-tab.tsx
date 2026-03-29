import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

interface MyPostsTabProps {
  posts: {
    id: string;
    contest_name: string;
    status: string;
    recruit_deadline: string;
    applications: { count: number }[];
  }[];
}

export function MyPostsTab({ posts }: MyPostsTabProps) {
  if (posts.length === 0) {
    return <EmptyState message="작성한 모집글이 없습니다." />;
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <Link key={post.id} href={`/posts/${post.id}`}>
          <Card className="transition-colors hover:border-foreground/20">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{post.contest_name}</p>
                <p className="text-xs text-muted-foreground">
                  마감: {post.recruit_deadline} · 지원자{" "}
                  {post.applications?.[0]?.count ?? 0}명
                </p>
              </div>
              <StatusBadge status={post.status} />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
