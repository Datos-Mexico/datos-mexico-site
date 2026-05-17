import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

const buttonStyles = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans font-medium",
    "transition-colors duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary:
          "bg-foreground text-text-inverse hover:bg-text",
        outline:
          "border border-border bg-background text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        link:
          "text-primary underline-offset-4 hover:underline px-0 h-auto rounded-none",
        inverseOnDark:
          "bg-primary text-primary-foreground hover:bg-primary-hover",
      },
      size: {
        sm: "h-9 px-3 text-[14px]",
        md: "h-11 px-5 text-[15px]",
        lg: "h-12 px-6 text-[16px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonStyles>;

type CommonProps = ButtonVariantProps & {
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof CommonProps> & {
    href: string;
    external?: boolean;
  };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant, size, className, children, ...rest } = props;
  const classes = cn(buttonStyles({ variant, size }), className);

  if ("href" in rest && rest.href !== undefined) {
    const { href, external, ...anchorProps } = rest;
    if (external || /^https?:\/\//.test(href)) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as ComponentPropsWithoutRef<"button">;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
