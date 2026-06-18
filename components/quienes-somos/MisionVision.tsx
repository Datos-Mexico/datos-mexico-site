import { Container } from "@/components/layout/Container";
import { Eyebrow, H2, Body } from "@/components/typography";

export function MisionVision() {
  return (
    <section id="mision" className="border-b border-border py-20 md:py-24">
      <Container>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <Eyebrow className="mb-4 text-accent">Misión</Eyebrow>
            <H2>Por qué existimos.</H2>
            <Body className="mt-6 max-w-xl text-[17px] leading-[1.7]">
              Procesar, validar y poner al alcance de todos los datos públicos de
              México, con rigor académico y claridad expositiva, para que ciudadanía,
              prensa, academia y gobierno tomen decisiones informadas.
            </Body>
          </div>
          <div>
            <Eyebrow className="mb-4 text-accent">Visión</Eyebrow>
            <H2>Hacia dónde vamos.</H2>
            <Body className="mt-6 max-w-xl text-[17px] leading-[1.7]">
              Ser el observatorio de datos de referencia en México: el lugar donde
              cualquier persona puede consultar, reproducir y entender los números
              que describen al país.
            </Body>
          </div>
        </div>
      </Container>
    </section>
  );
}
