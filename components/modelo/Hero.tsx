import { H1, Lead, Eyebrow } from "@/components/typography";

export function ModeloHero() {
  return (
    <section className="border-b border-border pt-24 pb-16 md:pt-32 md:pb-20">
      <div className="max-w-3xl">
        <Eyebrow className="mb-5 text-accent">Modelo institucional</Eyebrow>
        <H1>Cómo opera el observatorio, y bajo qué reglas.</H1>
        <Lead className="mt-7">
          Este documento articula públicamente qué hace el observatorio, cómo
          se sostiene y bajo qué reglas opera frente a quien lo financia o le
          encarga trabajo. Es complemento del Manifesto: aquél declara la
          doctrina académica; éste, el modelo institucional. Es público por
          construcción.
        </Lead>
      </div>
    </section>
  );
}
