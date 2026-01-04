import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { useSeedSampleStories } from "@/hooks/useStories";

export function SeedSampleData() {
  const { mutate: seedData, isPending } = useSeedSampleStories();

  return (
    <Button
      variant="outline"
      onClick={() => seedData()}
      disabled={isPending}
      className="mt-2"
    >
      <Database className="h-4 w-4" />
      {isPending ? "Creating..." : "Add Sample Stories"}
    </Button>
  );
}
