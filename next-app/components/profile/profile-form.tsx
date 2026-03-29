"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { profileSchema } from "@/lib/validations";
import { SKILL_OPTIONS, GRADE_OPTIONS } from "@/lib/constants";
import { SkillTagSelect } from "@/components/shared/skill-tag-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ProfileFormProps {
  initialData?: {
    name: string;
    department: string;
    grade: string;
    bio: string;
    skills: string[];
    portfolio_url: string | null;
  };
  userId: string;
}

export function ProfileForm({ initialData, userId }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    department: initialData?.department ?? "",
    grade: initialData?.grade ?? "",
    bio: initialData?.bio ?? "",
    skills: initialData?.skills ?? [],
    portfolio_url: initialData?.portfolio_url ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        name: form.name,
        department: form.department,
        grade: form.grade,
        bio: form.bio,
        skills: form.skills,
        portfolio_url: form.portfolio_url || null,
      })
      .eq("id", userId);

    setLoading(false);

    if (error) {
      toast.error("저장에 실패했습니다.");
      return;
    }

    toast.success("프로필이 저장되었습니다.");
    router.push("/mypage");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">이름 *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="실명을 입력해주세요"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">학과 *</Label>
        <Input
          id="department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          placeholder="예: 컴퓨터공학부"
        />
        {errors.department && (
          <p className="text-sm text-destructive">{errors.department}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>학년 *</Label>
        <Select
          value={form.grade}
          onValueChange={(value) => setForm({ ...form, grade: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="학년을 선택해주세요" />
          </SelectTrigger>
          <SelectContent>
            {GRADE_OPTIONS.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.grade && (
          <p className="text-sm text-destructive">{errors.grade}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">자기소개 * (200자 이내)</Label>
        <Textarea
          id="bio"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="간단한 자기소개를 작성해주세요"
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground text-right">
          {form.bio.length}/200
        </p>
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>기술 스택/역량 *</Label>
        <SkillTagSelect
          options={SKILL_OPTIONS}
          selected={form.skills}
          onChange={(skills) => setForm({ ...form, skills })}
        />
        {errors.skills && (
          <p className="text-sm text-destructive">{errors.skills}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolio_url">포트폴리오 URL (선택)</Label>
        <Input
          id="portfolio_url"
          value={form.portfolio_url}
          onChange={(e) =>
            setForm({ ...form, portfolio_url: e.target.value })
          }
          placeholder="https://github.com/username"
        />
        {errors.portfolio_url && (
          <p className="text-sm text-destructive">{errors.portfolio_url}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
