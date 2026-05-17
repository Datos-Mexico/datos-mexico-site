import { Body } from "@/components/typography";
import type { LucideIcon } from "lucide-react";

export function AreaCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <article className="flex flex-col rounded-lg border border-border bg-background p-6 md:p-7">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
        {title}
      </h3>
      <Body className="mt-3 text-[15px] leading-[1.6] text-text-subtle">
        {description}
      </Body>
    </article>
  );
}
