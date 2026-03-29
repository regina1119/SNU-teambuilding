"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  message: string;
  post_id: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationList({
  notifications,
}: {
  notifications: Notification[];
}) {
  const router = useRouter();

  const handleClick = async (noti: Notification) => {
    if (!noti.is_read) {
      const supabase = createClient();
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", noti.id);
    }
    router.push(`/posts/${noti.post_id}`);
  };

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  };

  return (
    <div className="divide-y">
      {notifications.map((noti) => (
        <button
          key={noti.id}
          onClick={() => handleClick(noti)}
          className={cn(
            "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
            !noti.is_read && "bg-muted/30",
          )}
        >
          {!noti.is_read && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
          <div className="flex-1">
            <p className="text-sm">{noti.message}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatTime(noti.created_at)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
