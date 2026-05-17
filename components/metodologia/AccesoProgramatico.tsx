import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body, Small } from "@/components/typography";

export function AccesoProgramatico() {
  return (
    <section id="acceso" className="border-b border-border py-20 md:py-24">
      <SectionHeader
        eyebrow="Acceso programático"
        title="Trabaja con los datos desde tus propios scripts."
        lead="Publicamos un cliente Python oficial (datos-mexico) que da acceso a la lectura pública del API completa. El cliente cubre los 78 endpoints públicos con tipos validados, caché integrado y manejo robusto de errores."
      />

      <div className="mt-12 space-y-10">
        <div>
          <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
            Instalación
          </h3>
          <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-muted px-5 py-4 font-mono text-[13px] leading-[1.6] text-foreground md:text-[14px]">
{`pip install datos-mexico`}
          </pre>
        </div>

        <div>
          <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
            Ejemplo de uso
          </h3>
          <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-muted px-5 py-4 font-mono text-[13px] leading-[1.6] text-foreground md:text-[14px]">
{`from datos_mexico import DatosMexico

with DatosMexico() as client:
    stats = client.cdmx.dashboard_stats()
    print(f"{stats.total_servidores:,} servidores públicos en CDMX")

    composicion = client.consar.recursos_por_componente(fecha="2025-06-01")
    hogares = client.enigh.hogares_summary()
    ratio = client.comparativo.ingreso_cdmx_vs_nacional()`}
          </pre>
        </div>

        <Body className="text-[16px] leading-[1.7]">
          El cliente es código abierto bajo licencia MIT y vive en{" "}
          <a
            href="https://github.com/datos-mexico/datos-mexico-py"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            github.com/datos-mexico/datos-mexico-py
          </a>
          . El repositorio incluye notebooks ejecutables que demuestran flujos
          de análisis típicos sobre los datasets vigentes del observatorio. La
          documentación completa — quickstart, conceptos, tutoriales por
          dataset y reference auto-generado desde docstrings — vive en{" "}
          <a
            href="https://docs.datosmexico.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            docs.datosmexico.org
          </a>
          .
        </Body>

        <Small className="text-[14px] leading-[1.6]">
          La especificación completa del API está documentada en{" "}
          <a
            href="https://api.datos-itam.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Swagger
          </a>
          .
        </Small>
      </div>
    </section>
  );
}
