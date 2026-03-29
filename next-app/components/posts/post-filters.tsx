"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_OPTIONS } from "@/lib/constants";
import { Suspense } from "react";

function PostFiltersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") || "";
  const role = searchParams.get("role") || "";
  const statusFilter = searchParams.get("status") || "";

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/posts?${params.toString()}`);
  };

  const clearAll = () => {
    router.push("/posts");
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="공모전 이름으로 검색..."
        defaultValue={q}
        onChange={(e) => {
          const timeout = setTimeout(() => {
            updateParams("q", e.target.value);
          }, 300);
          return () => clearTimeout(timeout);
        }}
      />

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={statusFilter === "recruiting" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() =>
            updateParams(
              "status",
              statusFilter === "recruiting" ? "" : "recruiting",
            )
          }
        >
          모집중만 보기
        </Badge>
        {ROLE_OPTIONS.map((r) => (
          <Badge
            key={r}
            variant={role === r ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => updateParams("role", role === r ? "" : r)}
          >
            {r}
          </Badge>
        ))}
        {(q || role || statusFilter) && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            필터 초기화
          </Button>
        )}
      </div>
    </div>
  );
}

export function PostFilters() {
  return (
    <Suspense>
      <PostFiltersContent />
    </Suspense>
  );
}
