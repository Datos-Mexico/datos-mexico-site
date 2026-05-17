import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body, Small } from "@/components/typography";

function CitationBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-muted px-5 py-4 font-mono text-[13px] leading-[1.6] text-foreground md:text-[14px] whitespace-pre-wrap">
      {children}
    </pre>
  );
}

function ExampleNote({ children }: { children: React.ReactNode }) {
  return (
    <Small className="mt-3 text-[13px] italic">
      <span className="not-italic font-semibold text-foreground">
        Ejemplo:
      </span>{" "}
      {children}
    </Small>
  );
}

export function Citarnos() {
  return (
    <section id="citarnos" className="border-b border-border py-20 md:py-24">
      <SectionHeader
        eyebrow="Atribución"
        title="Cómo citarnos correctamente."
        lead="Para mantener la trazabilidad de los análisis del observatorio, te pedimos seguir estos lineamientos cuando uses nuestro trabajo en notas, reportes o publicaciones académicas."
      />

      <div className="mt-12 max-w-3xl space-y-12 md:space-y-14">
        <div>
          <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
            En notas periodísticas y reportes generales
          </h3>
          <Body className="mt-4">
            Para una mención breve en una nota o reporte, usar la siguiente
            atribución:
          </Body>
          <CitationBlock>Datos México (datosmexico.org)</CitationBlock>
          <ExampleNote>
            “Según datos procesados por el observatorio Datos México
            (datosmexico.org), el 88% de los servidores públicos de la CDMX gana
            menos de 20 mil pesos al mes.”
          </ExampleNote>
        </div>

        <div className="border-t border-border pt-10">
          <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
            En análisis comparativos o académicos
          </h3>
          <Body className="mt-4">
            Cuando la cifra es central en el análisis o se incluye en una
            publicación académica, te pedimos citar también la fuente original y
            el enlace al análisis del observatorio:
          </Body>
          <CitationBlock>{`Datos México (2026). Análisis sobre [tema], a partir de [fuente original, ej. INEGI ENIGH 2024 NS]. Disponible en: datosmexico.org/publicaciones/[slug]`}</CitationBlock>
          <ExampleNote>
            “Datos México (2026). Hogares CDMX vs nacional, a partir de INEGI
            ENIGH 2024 Nueva Serie. Disponible en:
            datosmexico.org/publicaciones/hogares-cdmx-vs-nacional”
          </ExampleNote>
        </div>

        <div className="border-t border-border pt-10">
          <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
            Formato APA (académico)
          </h3>
          <CitationBlock>{`Datos México. (2026). [Título del análisis]. Recuperado de https://datosmexico.org/publicaciones/[slug]`}</CitationBlock>
        </div>
      </div>

      <aside
        aria-label="Sobre el uso de cifras y gráficas"
        className="mt-14 rounded-lg bg-muted px-6 py-7 md:px-8 md:py-8"
      >
        <p className="font-sans text-[14px] leading-[1.65] text-text md:text-[15px]">
          <strong className="font-semibold text-foreground">
            Sobre el uso de cifras y gráficas.
          </strong>{" "}
          Todo nuestro contenido es público y citable libremente. Solo te
          pedimos atribución correcta y, cuando sea posible, enlace al análisis
          original. Si necesitas una versión específica de una gráfica
          (resolución imprenta, formato editorial, etc.), escríbenos a{" "}
          <a
            href="mailto:prensa@datosmexico.org"
            className="text-primary underline-offset-4 hover:underline"
          >
            prensa@datosmexico.org
          </a>{" "}
          y la generamos.
        </p>
      </aside>
    </section>
  );
}
