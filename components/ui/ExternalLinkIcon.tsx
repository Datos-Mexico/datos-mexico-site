import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <ArrowUpRight
      aria-hidden="true"
      className={cn("inline-block h-4 w-4", className)}
    />
  );
}
