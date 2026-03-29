"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { toast } from "sonner";

interface ApplicantCardProps {
  application: {
    id: string;
    message: string;
    status: string;
    profiles: {
      name: string;
      department: string;
      grade: string;
      skills: string[];
      portfolio_url: string | null;
      email: string;
    };
  };
}

export function ApplicantCard({ application }: ApplicantCardProps) {
  const router = useRouter();
  const profile = application.profiles;

  const updateStatus = async (status: "accepted" | "rejected") => {
    const supabase = createClient();
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", application.id);

    if (error) {
      toast.error("처리에 실패했습니다.");
      return;
    }
    toast.success(status === "accepted" ? "승인되었습니다." : "거절되었습니다.");
    router.refresh();
  };

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{profile.name}</p>
            <p className="text-sm text-muted-foreground">
              {profile.department} · {profile.grade}
            </p>
          </div>
          <StatusBadge status={application.status} />
        </div>

        {profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        {profile.portfolio_url && (
          <a
            href={profile.portfolio_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 underline"
          >
            포트폴리오
          </a>
        )}

        <div className="rounded-md bg-muted p-3">
          <p className="text-sm whitespace-pre-wrap">{application.message}</p>
        </div>

        {application.status === "accepted" && (
          <p className="text-sm text-muted-foreground">
            연락처: {profile.email}
          </p>
        )}

        {application.status === "pending" && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => updateStatus("accepted")}>
              승인
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus("rejected")}
            >
              거절
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
