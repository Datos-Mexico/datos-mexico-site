import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";

/**
 * Avatar editorial. Cuadrado con esquinas suaves (no círculo), serif del
 * sistema, fondo cálido neutral. Está diseñado como elección tipográfica, no
 * como fallback de "falta la foto" — funciona como retrato tipográfico cuando
 * el equipo aún no tiene retratos individuales.
 */
type AvatarProps = {
  initials: string;
  size?: AvatarSize;
  className?: string;
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-10 w-10 text-[14px] rounded",
  md: "h-16 w-16 text-[22px] rounded-md",
  lg: "h-40 w-40 text-[56px] rounded-lg",
};

export function Avatar({ initials, size = "md", className }: AvatarProps) {
  return (
    <div
      role="img"
      aria-label={`Avatar de ${initials}`}
      className={cn(
        // Cuadrado editorial: borde fino + fondo cálido suave del sistema.
        "inline-flex items-center justify-center border border-border bg-muted text-foreground",
        // Serif del sistema, tracking ligeramente abierto para iniciales legibles.
        "font-serif font-medium leading-none tracking-[0.02em] select-none",
        sizeClasses[size],
        className,
      )}
    >
      <span aria-hidden="true">{initials}</span>
    </div>
  );
}
