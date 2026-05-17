import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type TypographyProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Display<T extends ElementType = "h1">({
  as,
  className,
  children,
  ...rest
}: TypographyProps<T>) {
  const Component = (as ?? "h1") as ElementType;
  return (
    <Component
      className={cn(
        "font-serif font-semibold tracking-tight text-foreground",
        "text-[36px] leading-[1.1] md:text-[64px] md:leading-[1.05]",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function H1<T extends ElementType = "h1">({
  as,
  className,
  children,
  ...rest
}: TypographyProps<T>) {
  const Component = (as ?? "h1") as ElementType;
  return (
    <Component
      className={cn(
        "font-serif font-semibold tracking-tight text-foreground",
        "text-[32px] leading-[1.15] md:text-[48px] md:leading-[1.1]",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function H2<T extends ElementType = "h2">({
  as,
  className,
  children,
  ...rest
}: TypographyProps<T>) {
  const Component = (as ?? "h2") as ElementType;
  return (
    <Component
      className={cn(
        "font-serif font-semibold tracking-tight text-foreground",
        "text-[26px] leading-[1.2] md:text-[36px] md:leading-[1.2]",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function H3<T extends ElementType = "h3">({
  as,
  className,
  children,
  ...rest
}: TypographyProps<T>) {
  const Component = (as ?? "h3") as ElementType;
  return (
    <Component
      className={cn(
        "font-serif font-semibold tracking-tight text-foreground",
        "text-[22px] leading-[1.3] md:text-[24px] md:leading-[1.3]",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function Lead<T extends ElementType = "p">({
  as,
  className,
  children,
  ...rest
}: TypographyProps<T>) {
  const Component = (as ?? "p") as ElementType;
  return (
    <Component
      className={cn(
        "font-sans text-text-subtle",
        "text-[18px] leading-[1.5] md:text-[20px] md:leading-[1.5]",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function Body<T extends ElementType = "p">({
  as,
  className,
  children,
  ...rest
}: TypographyProps<T>) {
  const Component = (as ?? "p") as ElementType;
  return (
    <Component
      className={cn(
        "font-sans text-text",
        "text-[16px] leading-[1.6] md:text-[17px] md:leading-[1.65]",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function Small<T extends ElementType = "p">({
  as,
  className,
  children,
  ...rest
}: TypographyProps<T>) {
  const Component = (as ?? "p") as ElementType;
  return (
    <Component
      className={cn("font-sans text-[14px] leading-[1.5] text-text-subtle", className)}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function Mono<T extends ElementType = "span">({
  as,
  className,
  children,
  ...rest
}: TypographyProps<T>) {
  const Component = (as ?? "span") as ElementType;
  return (
    <Component
      className={cn(
        "font-mono text-[14px] leading-[1.5] tracking-tight text-text-subtle",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[12px] uppercase tracking-[0.12em] text-text-subtle",
        className,
      )}
    >
      {children}
    </p>
  );
}
