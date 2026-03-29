import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplicantCard } from "@/components/applicants/applicant-card";
import { EmptyState } from "@/components/shared/empty-state";

export default async function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 모집글 작성자 확인
  const { data: post } = await supabase
    .from("posts")
    .select("author_id, contest_name")
    .eq("id", id)
    .single();

  if (!post || post.author_id !== user.id) redirect("/posts");

  const { data: applications } = await supabase
    .from("applications")
    .select("*, profiles!applicant_id(name, department, grade, skills, portfolio_url, email)")
    .eq("post_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">지원자 관리</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {post.contest_name}
      </p>

      <div className="space-y-4">
        {applications && applications.length > 0 ? (
          applications.map((app: any) => (
            <ApplicantCard key={app.id} application={app} />
          ))
        ) : (
          <EmptyState message="아직 지원자가 없습니다." />
        )}
      </div>
    </div>
  );
}
