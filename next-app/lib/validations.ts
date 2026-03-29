import { z } from "zod/v4";

export const profileSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  department: z.string().min(1, "학과를 입력해주세요"),
  grade: z.string().min(1, "학년을 선택해주세요"),
  bio: z.string().min(1, "자기소개를 입력해주세요").max(200, "200자 이내로 입력해주세요"),
  skills: z.array(z.string()).min(1, "기술 스택을 1개 이상 선택해주세요"),
  portfolio_url: z.union([z.url("올바른 URL을 입력해주세요"), z.literal("")]).optional(),
});

export const postSchema = z.object({
  contest_name: z.string().min(1, "공모전 이름을 입력해주세요"),
  contest_url: z.union([z.url("올바른 URL을 입력해주세요"), z.literal("")]).optional(),
  contest_deadline: z.string().optional(),
  recruit_deadline: z.string().min(1, "모집 마감일을 입력해주세요"),
  recruit_count: z.number().min(1, "1명 이상 입력해주세요"),
  roles: z.array(z.string()).min(1, "모집 역할을 1개 이상 선택해주세요"),
  description: z.string().min(1, "팀 소개를 입력해주세요"),
});

export const applicationSchema = z.object({
  message: z.string().min(1, "지원 메시지를 입력해주세요"),
});
