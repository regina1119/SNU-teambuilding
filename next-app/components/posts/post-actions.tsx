"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

interface PostActionsProps {
  postId: string;
  status: string;
}

export function PostActions({ postId, status }: PostActionsProps) {
  const router = useRouter();

  const toggleStatus = async () => {
    const supabase = createClient();
    const newStatus = status === "recruiting" ? "closed" : "recruiting";
    const { error } = await supabase
      .from("posts")
      .update({ status: newStatus })
      .eq("id", postId);

    if (error) {
      toast.error("상태 변경에 실패했습니다.");
      return;
    }
    toast.success(
      newStatus === "closed" ? "모집이 완료되었습니다." : "모집을 재개합니다.",
    );
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" asChild>
        <Link href={`/posts/${postId}/edit`}>수정</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href={`/posts/${postId}/applicants`}>지원자 관리</Link>
      </Button>
      <Button variant="secondary" onClick={toggleStatus}>
        {status === "recruiting" ? "모집완료로 변경" : "모집중으로 변경"}
      </Button>
    </div>
  );
}
