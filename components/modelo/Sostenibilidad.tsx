import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body } from "@/components/typography";

export function Sostenibilidad() {
  return (
    <section id="sostenibilidad" className="border-b border-border py-20 md:py-24">
      <SectionHeader
        eyebrow="§5 · Cómo nos sostenemos"
        title="Transparencia sobre lo que cobramos y lo que recibimos."
      />

      <div className="mt-14 max-w-3xl space-y-12">
        <div>
          <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
            5.1 Estado financiero actual.
          </h3>
          <Body className="mt-4 text-[16px] leading-[1.7]">
            El observatorio opera hoy a pérdida. Los costos de
            infraestructura técnica, dominios, servicios y operación los
            cubre el equipo fundador. El equipo trabaja sin compensación
            monetaria por el trabajo realizado para el observatorio. Ningún
            integrante del observatorio recibe a la fecha ingreso del
            observatorio.
          </Body>
          <Body className="mt-4 text-[16px] leading-[1.7]">
            No hemos recibido financiamiento externo a la fecha de este
            documento.
          </Body>
          <Body className="mt-4 text-[16px] leading-[1.7]">
            Declarar esto públicamente es decisión deliberada. La fortaleza
            del observatorio en este momento es su honestidad sobre su
            propia condición: no se finge sostenibilidad que no se tiene, no
            se exagera capacidad que no existe, no se proyecta
            institucionalidad que aún está en construcción. La transparencia
            financiera es coherente con la transparencia metodológica que el
            observatorio exige a su propio trabajo.
          </Body>
        </div>

        <div>
          <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
            5.2 Hacia adelante: dos fuentes diferenciadas.
          </h3>
          <Body className="mt-4 text-[16px] leading-[1.7]">
            El observatorio se sostendrá por dos fuentes claramente
            diferenciadas.
          </Body>
          <ul className="mt-5 space-y-4">
            <li className="border-l-2 border-border pl-5">
              <p className="font-sans text-[16px] font-semibold leading-[1.4] text-foreground">
                Encargos profundos (capa 3.3).
              </p>
              <p className="mt-2 font-sans text-[15px] leading-[1.65] text-text-subtle">
                Trabajos pagados, bajo la regla de independencia del §4. Son
                la fuente prevista de ingreso operacional sostenido.
              </p>
            </li>
            <li className="border-l-2 border-border pl-5">
              <p className="font-sans text-[16px] font-semibold leading-[1.4] text-foreground">
                Apoyo filantrópico institucional.
              </p>
              <p className="mt-2 font-sans text-[15px] leading-[1.65] text-text-subtle">
                Apoyos de fundaciones dedicadas a la transparencia, el
                periodismo de investigación o la infraestructura cívica. Son
                la fuente prevista de capacidad operativa de fondo: lo que
                permite mantener equipo, infraestructura y la misión propia
                que no se financia por encargo.
              </p>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
            5.3 El rol de las fundaciones — distinción crítica.
          </h3>
          <Body className="mt-4 text-[16px] leading-[1.7]">
            Las fundaciones que apoyan al observatorio no son clientes. La
            distinción es estructural y se hace explícita en cualquier
            acuerdo que el observatorio firme.
          </Body>
          <Body className="mt-4 text-[16px] leading-[1.7]">
            Un cliente, bajo el régimen del §4, propone un tema y un
            alcance, y recibe el hallazgo —cualquier hallazgo— sobre ese
            tema acotado, publicado abiertamente.
          </Body>
          <Body className="mt-4 text-[16px] leading-[1.7]">
            Una fundación, en cambio, apoya la capacidad del observatorio de
            cumplir su misión propia. Sostiene la infraestructura, el
            equipo, la independencia operativa.{" "}
            <strong className="font-semibold text-foreground">
              No dirige el contenido.
            </strong>{" "}
            No elige qué publica el observatorio, ni sobre qué temas, ni con
            qué énfasis, ni en qué momento. El observatorio rinde cuentas
            sobre su trabajo —es académico, todo es público— pero no recibe
            encargos editoriales de la fundación.
          </Body>
          <Body className="mt-4 text-[16px] leading-[1.7]">
            La aceptación explícita de esta cláusula por parte de la
            fundación es condición de la relación. Sin esa aceptación por
            escrito, no hay relación de apoyo.
          </Body>
        </div>
      </div>
    </section>
  );
}
