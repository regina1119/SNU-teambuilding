import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotificationList } from "@/components/layout/notification-list";
import { EmptyState } from "@/components/shared/empty-state";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(0, 29);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">알림</h1>
      {notifications && notifications.length > 0 ? (
        <NotificationList notifications={notifications} />
      ) : (
        <EmptyState message="알림이 없습니다." />
      )}
    </div>
  );
}
