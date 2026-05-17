import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoVariant = "default" | "mono-white" | "mono-black";
type LogoSize = "sm" | "md" | "lg";

const VARIANT_SRC: Record<LogoVariant, string> = {
  default: "/brand/logo.svg",
  "mono-white": "/brand/logo-mono-white.svg",
  "mono-black": "/brand/logo-mono-black.svg",
};

// Isotype heights (4:3 aspect ratio, so width is 4/3 of height)
const SIZE_PX: Record<LogoSize, { h: number; w: number; text: string }> = {
  sm: { h: 24, w: 32, text: "text-[16px]" },
  md: { h: 40, w: 53, text: "text-[20px] md:text-[22px]" },
  lg: { h: 64, w: 85, text: "text-[28px]" },
};

export function Logo({
  variant = "default",
  withWordmark = true,
  size = "md",
  className,
}: {
  variant?: LogoVariant;
  withWordmark?: boolean;
  size?: LogoSize;
  className?: string;
}) {
  const dims = SIZE_PX[size];
  const wordmarkColor =
    variant === "mono-white" ? "text-text-inverse" : "text-foreground";

  return (
    <Link
      href="/"
      aria-label="Datos México — ir al inicio"
      className={cn(
        "inline-flex items-center gap-3 hover:opacity-80 transition-opacity",
        className,
      )}
    >
      <img
        src={VARIANT_SRC[variant]}
        alt=""
        aria-hidden="true"
        width={dims.w}
        height={dims.h}
        style={{ height: `${dims.h}px`, width: "auto" }}
        className="block shrink-0"
      />
      {withWordmark && (
        <span
          className={cn(
            "font-serif font-bold leading-none tracking-tight",
            dims.text,
            wordmarkColor,
          )}
        >
          Datos México
        </span>
      )}
    </Link>
  );
}
