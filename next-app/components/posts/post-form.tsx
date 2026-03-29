"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { postSchema } from "@/lib/validations";
import { ROLE_OPTIONS } from "@/lib/constants";
import { SkillTagSelect } from "@/components/shared/skill-tag-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PostFormProps {
  initialData?: {
    id: string;
    contest_name: string;
    contest_url: string | null;
    contest_deadline: string | null;
    recruit_deadline: string;
    recruit_count: number;
    roles: string[];
    description: string;
  };
  userId: string;
}

export function PostForm({ initialData, userId }: PostFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    contest_name: initialData?.contest_name ?? "",
    contest_url: initialData?.contest_url ?? "",
    contest_deadline: initialData?.contest_deadline ?? "",
    recruit_deadline: initialData?.recruit_deadline ?? "",
    recruit_count: initialData?.recruit_count ?? 1,
    roles: initialData?.roles ?? [],
    description: initialData?.description ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = postSchema.safeParse(form);
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

    const payload = {
      contest_name: form.contest_name,
      contest_url: form.contest_url || null,
      contest_deadline: form.contest_deadline || null,
      recruit_deadline: form.recruit_deadline,
      recruit_count: form.recruit_count,
      roles: form.roles,
      description: form.description,
      author_id: userId,
    };

    if (isEdit) {
      const { author_id: _, ...updatePayload } = payload;
      const { error } = await supabase
        .from("posts")
        .update(updatePayload)
        .eq("id", initialData.id);
      setLoading(false);
      if (error) {
        toast.error("수정에 실패했습니다.");
        return;
      }
      toast.success("모집글이 수정되었습니다.");
      router.push(`/posts/${initialData.id}`);
    } else {
      const { data, error } = await supabase
        .from("posts")
        .insert(payload)
        .select("id")
        .single();
      setLoading(false);
      if (error) {
        toast.error("작성에 실패했습니다.");
        return;
      }
      toast.success("모집글이 등록되었습니다.");
      router.push(`/posts/${data.id}`);
    }

    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="contest_name">공모전 이름 *</Label>
        <Input
          id="contest_name"
          value={form.contest_name}
          onChange={(e) => setForm({ ...form, contest_name: e.target.value })}
          placeholder="예: 2026 SW 해커톤"
        />
        {errors.contest_name && (
          <p className="text-sm text-destructive">{errors.contest_name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contest_url">공모전 링크 (선택)</Label>
        <Input
          id="contest_url"
          value={form.contest_url}
          onChange={(e) => setForm({ ...form, contest_url: e.target.value })}
          placeholder="https://..."
        />
        {errors.contest_url && (
          <p className="text-sm text-destructive">{errors.contest_url}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contest_deadline">공모전 마감일 (선택)</Label>
          <Input
            id="contest_deadline"
            type="date"
            value={form.contest_deadline}
            onChange={(e) =>
              setForm({ ...form, contest_deadline: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recruit_deadline">모집 마감일 *</Label>
          <Input
            id="recruit_deadline"
            type="date"
            value={form.recruit_deadline}
            onChange={(e) =>
              setForm({ ...form, recruit_deadline: e.target.value })
            }
          />
          {errors.recruit_deadline && (
            <p className="text-sm text-destructive">
              {errors.recruit_deadline}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recruit_count">모집 인원 *</Label>
        <Input
          id="recruit_count"
          type="number"
          min={1}
          value={form.recruit_count}
          onChange={(e) =>
            setForm({ ...form, recruit_count: Number(e.target.value) })
          }
        />
        {errors.recruit_count && (
          <p className="text-sm text-destructive">{errors.recruit_count}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>모집 역할 *</Label>
        <SkillTagSelect
          options={ROLE_OPTIONS}
          selected={form.roles}
          onChange={(roles) => setForm({ ...form, roles })}
        />
        {errors.roles && (
          <p className="text-sm text-destructive">{errors.roles}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">팀 소개 *</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="프로젝트 방향, 진행 방식, 팀 분위기 등을 소개해주세요"
          rows={6}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "처리 중..." : isEdit ? "수정하기" : "등록하기"}
      </Button>
    </form>
  );
}
