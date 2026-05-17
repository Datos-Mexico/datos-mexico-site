import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type FAQItem = {
  question: string;
  answer: ReactNode;
};

export type FAQProps = {
  items: FAQItem[];
  className?: string;
};

export function FAQ({ items, className }: FAQProps) {
  return (
    <ul className={cn("border-t border-border", className)}>
      {items.map((item, index) => (
        <li key={index} className="border-b border-border">
          <details className="group py-6 [&_summary::-webkit-details-marker]:hidden">
            <summary
              className={cn(
                "flex cursor-pointer items-center justify-between gap-4 list-none",
                "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              <h3 className="font-serif text-[19px] font-semibold leading-[1.35] text-foreground md:text-[21px]">
                {item.question}
              </h3>
              <ChevronDown
                aria-hidden="true"
                className="h-5 w-5 flex-shrink-0 text-text-subtle transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <div className="mt-4 max-w-2xl font-sans text-[16px] leading-[1.7] text-text-subtle">
              {item.answer}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
