import { Badge } from "@/components/ui/badge";

const STATUS_MAP = {
  recruiting: { label: "모집중", variant: "default" as const },
  closed: { label: "모집완료", variant: "secondary" as const },
  pending: { label: "대기중", variant: "outline" as const },
  accepted: { label: "승인", variant: "default" as const },
  rejected: { label: "거절", variant: "destructive" as const },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status as keyof typeof STATUS_MAP];
  if (!config) return null;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
