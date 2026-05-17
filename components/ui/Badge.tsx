import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

const badgeStyles = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[12px] uppercase tracking-[0.08em]",
  {
    variants: {
      variant: {
        default: "bg-muted text-text",
        primary: "bg-primary/10 text-primary",
        accent: "bg-accent/10 text-accent",
        outline: "border border-border text-text-subtle",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeStyles>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeStyles({ variant }), className)} {...props} />
  );
}
