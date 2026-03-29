import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfileEditPage() {
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

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">프로필 설정</h1>
      <ProfileForm
        initialData={
          profile
            ? {
                name: profile.name,
                department: profile.department,
                grade: profile.grade,
                bio: profile.bio,
                skills: profile.skills,
                portfolio_url: profile.portfolio_url,
              }
            : undefined
        }
        userId={user.id}
      />
    </div>
  );
}
