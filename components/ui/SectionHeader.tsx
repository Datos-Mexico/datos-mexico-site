import { Eyebrow, H2, Lead } from "@/components/typography";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <header
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <Eyebrow className={cn("mb-4 text-accent", align === "center" && "mx-auto")}>
          {eyebrow}
        </Eyebrow>
      )}
      <H2>{title}</H2>
      {lead && <Lead className="mt-5">{lead}</Lead>}
    </header>
  );
}
