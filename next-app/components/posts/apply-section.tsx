"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ApplySectionProps {
  postId: string;
  userId: string;
  postStatus: string;
  myApplication: { id: string; status: string } | null;
}

export function ApplySection({
  postId,
  userId,
  postStatus,
  myApplication,
}: ApplySectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (myApplication) {
    return (
      <Button disabled className="w-full">
        지원완료 ({myApplication.status === "pending" ? "대기중" : myApplication.status === "accepted" ? "승인" : "거절"})
      </Button>
    );
  }

  if (postStatus === "closed") {
    return (
      <Button disabled className="w-full">
        모집이 마감되었습니다
      </Button>
    );
  }

  const handleApply = async () => {
    if (!message.trim()) {
      toast.error("지원 메시지를 입력해주세요.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("applications").insert({
      post_id: postId,
      applicant_id: userId,
      message,
    });
    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast.error("이미 지원한 팀입니다.");
      } else {
        toast.error("지원에 실패했습니다.");
      }
      return;
    }

    toast.success("지원이 완료되었습니다.");
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">지원하기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>팀 지원</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="지원 동기와 본인의 역할을 소개해주세요"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
          />
          <Button
            onClick={handleApply}
            className="w-full"
            disabled={loading}
          >
            {loading ? "제출 중..." : "제출"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
