import { Badge } from "@/components/ui/Badge";
import type { TipoTemporal } from "@/lib/preguntas/types";

const labels: Record<TipoTemporal, string> = {
  snapshot: "Snapshot",
  puente: "Puente",
};

export function TipoTemporalBadge({ tipo }: { tipo: TipoTemporal }) {
  return <Badge variant="default">{labels[tipo]}</Badge>;
}
