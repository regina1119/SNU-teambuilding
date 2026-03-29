"use client";

import { Badge } from "@/components/ui/badge";

interface SkillTagSelectProps {
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function SkillTagSelect({
  options,
  selected,
  onChange,
}: SkillTagSelectProps) {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((s) => s !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tag) => (
        <Badge
          key={tag}
          variant={selected.includes(tag) ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => toggle(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
