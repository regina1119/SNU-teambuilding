import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MyPostsTab } from "@/components/mypage/my-posts-tab";
import { MyApplicationsTab } from "@/components/mypage/my-applications-tab";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: myPosts } = await supabase
    .from("posts")
    .select("id, contest_name, status, recruit_deadline, applications(count)")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  const { data: myApplications } = await supabase
    .from("applications")
    .select("id, status, created_at, posts(id, contest_name, status)")
    .eq("applicant_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* 프로필 요약 */}
      <div className="mb-8 rounded-lg border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{profile?.name || "이름 없음"}</h1>
            <p className="text-sm text-muted-foreground">
              {profile?.department} · {profile?.grade}
            </p>
            {profile?.bio && (
              <p className="mt-2 text-sm">{profile.bio}</p>
            )}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {profile.skills.map((skill: string) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/edit">수정</Link>
          </Button>
        </div>
      </div>

      {/* 탭 */}
      <Tabs defaultValue="posts">
        <TabsList className="w-full">
          <TabsTrigger value="posts" className="flex-1">
            내 모집글
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex-1">
            내 지원현황
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-4">
          <MyPostsTab posts={(myPosts as any) || []} />
        </TabsContent>
        <TabsContent value="applications" className="mt-4">
          <MyApplicationsTab applications={(myApplications as any) || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
