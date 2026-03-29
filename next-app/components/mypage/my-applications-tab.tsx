import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

interface MyApplicationsTabProps {
  applications: {
    id: string;
    status: string;
    created_at: string;
    posts: {
      id: string;
      contest_name: string;
      status: string;
    };
  }[];
}

export function MyApplicationsTab({ applications }: MyApplicationsTabProps) {
  if (applications.length === 0) {
    return <EmptyState message="지원한 팀이 없습니다." />;
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <Link key={app.id} href={`/posts/${app.posts.id}`}>
          <Card className="transition-colors hover:border-foreground/20">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{app.posts.contest_name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(app.created_at).toLocaleDateString("ko-KR")} 지원
                </p>
              </div>
              <StatusBadge status={app.status} />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
