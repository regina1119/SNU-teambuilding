"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false)
        .then(({ count }) => {
          setCount(count ?? 0);
        });
    });
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative text-sm text-muted-foreground hover:text-foreground"
    >
      알림
      {count > 0 && (
        <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}
