import { Badge } from "@/components/ui/badge";

type Status = "draft" | "review" | "approved" | "published";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; variant: "draft" | "review" | "approved" | "published" }> = {
  draft: { label: "Draft", variant: "draft" },
  review: { label: "In Review", variant: "review" },
  approved: { label: "Approved", variant: "approved" },
  published: { label: "Published", variant: "published" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
