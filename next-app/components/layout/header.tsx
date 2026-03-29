"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/layout/notification-bell";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold">
            SNU TeamUp
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/posts"
              className="text-muted-foreground hover:text-foreground"
            >
              모집글
            </Link>
            {user && (
              <Link
                href="/mypage"
                className="text-muted-foreground hover:text-foreground"
              >
                마이페이지
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <span className="text-sm text-muted-foreground">
                {user.user_metadata?.name || user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">로그인</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
