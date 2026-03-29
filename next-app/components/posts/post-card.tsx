import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";

interface PostCardProps {
  id: string;
  contestName: string;
  roles: string[];
  recruitDeadline: string;
  recruitCount: number;
  status: string;
  authorName: string;
  authorDepartment: string;
}

export function PostCard({
  id,
  contestName,
  roles,
  recruitDeadline,
  recruitCount,
  status,
  authorName,
  authorDepartment,
}: PostCardProps) {
  return (
    <Link href={`/posts/${id}`}>
      <Card className="transition-colors hover:border-foreground/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">
              {contestName}
            </CardTitle>
            <StatusBadge status={status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
              <Badge key={role} variant="outline" className="text-xs">
                {role}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {authorName} · {authorDepartment}
            </span>
            <span>~{recruitDeadline} · {recruitCount}명 모집</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
