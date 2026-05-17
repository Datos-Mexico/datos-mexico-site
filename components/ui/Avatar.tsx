import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-10 w-10 text-[14px]",
  md: "h-16 w-16 text-[22px]",
  lg: "h-40 w-40 text-[56px]",
};

export function Avatar({
  initials,
  size = "md",
  className,
}: {
  initials: string;
  size?: AvatarSize;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Avatar de ${initials}`}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-muted text-foreground",
        "font-serif font-semibold leading-none tracking-tight select-none",
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}
