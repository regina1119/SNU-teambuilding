import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // @snu.ac.kr 이메일 검증
      if (user?.email && !user.email.endsWith("@snu.ac.kr")) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/login?error=invalid_email`,
        );
      }

      // 프로필 완성 여부 확인
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("department")
          .eq("id", user.id)
          .single();

        if (!profile?.department) {
          return NextResponse.redirect(`${origin}/profile/edit`);
        }
      }

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
