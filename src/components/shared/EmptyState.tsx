import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-4">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-muted-foreground">{description}</p>
      {action && (
        <Button variant="hero" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
