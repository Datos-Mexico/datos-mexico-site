import { SectionHeader } from "@/components/ui/SectionHeader";
import { Small } from "@/components/typography";

const cambios = [
  {
    fecha: "Mayo 2026",
    cambio: "Publicación inicial de la metodología documentada",
    motivo: "Lanzamiento del sitio público de Datos México",
    datasets: "Todos los datasets vigentes",
  },
];

export function Cambios() {
  return (
    <section id="cambios" className="border-b border-border py-20 md:py-24">
      <SectionHeader
        eyebrow="Registro de cambios"
        title="Cuando el método cambia, lo documentamos."
        lead="Los métodos evolucionan. Cuando cambiamos algo en cómo procesamos o reportamos los datos, queda registrado aquí. Esto permite que análisis hechos en distintos momentos sigan siendo comparables."
      />

      <div className="mt-12 overflow-x-auto">
        <table className="w-full border-collapse text-left font-sans">
          <thead>
            <tr className="border-b border-border">
              <th
                scope="col"
                className="py-3 pr-4 font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-text-subtle"
              >
                Fecha
              </th>
              <th
                scope="col"
                className="py-3 pr-4 font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-text-subtle"
              >
                Cambio
              </th>
              <th
                scope="col"
                className="py-3 pr-4 font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-text-subtle"
              >
                Motivo
              </th>
              <th
                scope="col"
                className="py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-text-subtle"
              >
                Datasets afectados
              </th>
            </tr>
          </thead>
          <tbody>
            {cambios.map((c, i) => (
              <tr key={i} className="border-b border-border align-top">
                <td className="py-4 pr-4 font-mono text-[14px] text-text-subtle">
                  {c.fecha}
                </td>
                <td className="py-4 pr-4 text-[15px] leading-[1.55] text-foreground">
                  {c.cambio}
                </td>
                <td className="py-4 pr-4 text-[15px] leading-[1.55] text-text-subtle">
                  {c.motivo}
                </td>
                <td className="py-4 text-[15px] leading-[1.55] text-text-subtle">
                  {c.datasets}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Small className="mt-6 max-w-3xl text-[14px] leading-[1.6]">
        Esta tabla se irá llenando conforme el observatorio evolucione su
        práctica metodológica. Los cambios sustantivos llevarán además una nota
        explicativa en las publicaciones afectadas.
      </Small>
    </section>
  );
}
