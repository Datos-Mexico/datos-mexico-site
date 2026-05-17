import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

export function Container({
  as: Component = "div",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Component className={cn("mx-auto w-full max-w-6xl px-6 md:px-8", className)}>
      {children}
    </Component>
  );
}
