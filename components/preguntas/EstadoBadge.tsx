import { Badge } from "@/components/ui/Badge";
import type { EstadoArticulo } from "@/lib/preguntas/types";

const labels: Record<EstadoArticulo, string> = {
  "pre-firma": "Pre-firma",
  firmada: "Firmada",
  "en-re-revision": "En re-revisión",
  "en-reclasificacion": "En reclasificación",
  "errata-vigente": "Errata vigente",
};

const variants: Record<
  EstadoArticulo,
  "default" | "primary" | "accent" | "outline"
> = {
  "pre-firma": "outline",
  firmada: "primary",
  "en-re-revision": "accent",
  "en-reclasificacion": "accent",
  "errata-vigente": "accent",
};

export function EstadoBadge({ estado }: { estado: EstadoArticulo }) {
  return <Badge variant={variants[estado]}>{labels[estado]}</Badge>;
}
