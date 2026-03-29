import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostForm } from "@/components/posts/post-form";

export default async function EditPostPage({
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

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();
  if (post.author_id !== user.id) redirect(`/posts/${id}`);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">모집글 수정</h1>
      <PostForm
        initialData={{
          id: post.id,
          contest_name: post.contest_name,
          contest_url: post.contest_url,
          contest_deadline: post.contest_deadline,
          recruit_deadline: post.recruit_deadline,
          recruit_count: post.recruit_count,
          roles: post.roles,
          description: post.description,
        }}
        userId={user.id}
      />
    </div>
  );
}
