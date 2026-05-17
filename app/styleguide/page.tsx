import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import {
  Display,
  H1,
  H2,
  H3,
  Lead,
  Body,
  Small,
  Mono,
  Eyebrow,
} from "@/components/typography";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataStrip } from "@/components/sections/DataStrip";
import { colors } from "@/lib/design-tokens";

export const metadata: Metadata = {
  title: "Styleguide",
  description: "Design system de Datos México — paleta, tipografía y componentes.",
  robots: { index: false, follow: false },
};

const swatches: { name: string; token: string; value: string }[] = [
  { name: "Background", token: "background", value: colors.background },
  { name: "Foreground", token: "foreground", value: colors.foreground },
  { name: "Muted", token: "muted", value: colors.muted },
  { name: "Muted Foreground", token: "muted-foreground", value: colors.mutedForeground },
  { name: "Border", token: "border", value: colors.border },
  { name: "Text", token: "text", value: colors.text },
  { name: "Text Subtle", token: "text-subtle", value: colors.textSubtle },
  { name: "Text Inverse", token: "text-inverse", value: colors.textInverse },
  { name: "Primary", token: "primary", value: colors.primary },
  { name: "Primary Hover", token: "primary-hover", value: colors.primaryHover },
  { name: "Primary Foreground", token: "primary-foreground", value: colors.primaryForeground },
  { name: "Accent", token: "accent", value: colors.accent },
  { name: "Accent Foreground", token: "accent-foreground", value: colors.accentForeground },
  { name: "Success", token: "success", value: colors.success },
  { name: "Warning", token: "warning", value: colors.warning },
  { name: "Danger", token: "danger", value: colors.danger },
  { name: "Info", token: "info", value: colors.info },
];

export default function StyleguidePage() {
  return (
    <div className="bg-background py-16 md:py-20">
      <Container>
        <header className="mb-16 border-b border-border pb-10">
          <Mono className="mb-3">Datos México · Internal</Mono>
          <H1>Styleguide</H1>
          <Lead className="mt-4 max-w-2xl">
            Tokens, tipografía y componentes del design system. Esta página no está
            enlazada en la navegación.
          </Lead>
        </header>

        <Section id="paleta" title="Paleta">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {swatches.map((s) => (
              <div
                key={s.token}
                className="flex flex-col rounded-lg border border-border overflow-hidden"
              >
                <div
                  className="h-20 w-full"
                  style={{ backgroundColor: s.value }}
                />
                <div className="p-3">
                  <Body className="text-[14px] font-medium">{s.name}</Body>
                  <Mono className="mt-1 block text-[12px]">--color-{s.token}</Mono>
                  <Mono className="block text-[12px]">{s.value}</Mono>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="tipografia" title="Tipografía">
          <div className="space-y-10">
            <SpecimenRow label="Display · Source Serif 4 · 36→64">
              <Display>Del microdato a la conversación pública.</Display>
            </SpecimenRow>
            <SpecimenRow label="H1 · Source Serif 4 · 32→48">
              <H1>Título de página principal</H1>
            </SpecimenRow>
            <SpecimenRow label="H2 · Source Serif 4 · 26→36">
              <H2>Encabezado de sección</H2>
            </SpecimenRow>
            <SpecimenRow label="H3 · Source Serif 4 · 22→24">
              <H3>Subsección o tarjeta</H3>
            </SpecimenRow>
            <SpecimenRow label="Lead · Inter · 18→20">
              <Lead>
                Párrafo introductorio que establece el contexto de la sección con
                claridad y sin marketing.
              </Lead>
            </SpecimenRow>
            <SpecimenRow label="Body · Inter · 16→17">
              <Body>
                Cuerpo de texto principal. Procesamos microdatos oficiales y los
                cruzamos contra publicaciones existentes. Validamos al peso, en serio.
              </Body>
            </SpecimenRow>
            <SpecimenRow label="Small · Inter · 14">
              <Small>Texto secundario, captions, fechas, atribución.</Small>
            </SpecimenRow>
            <SpecimenRow label="Mono · JetBrains Mono · 14">
              <Mono>$10.13 bill MXN · 246,831 hogares · 2024-12-31</Mono>
            </SpecimenRow>
            <SpecimenRow label="Eyebrow · JetBrains Mono · 12 uppercase">
              <Eyebrow>Observatorio independiente · Desde el ITAM</Eyebrow>
            </SpecimenRow>
          </div>
        </Section>

        <Section id="botones" title="Botones">
          <div className="space-y-6">
            <Row label="Variants">
              <Button variant="primary">Primario</Button>
              <Button variant="secondary">Secundario</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </Row>
            <Row label="Tamaños">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </Row>
            <Row label="Estados">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
              <Button href="https://datos-itam.org" external variant="outline">
                Como link externo
              </Button>
            </Row>
          </div>
        </Section>

        <Section id="inputs" title="Inputs">
          <div className="max-w-md space-y-4">
            <Input placeholder="Correo electrónico" type="email" />
            <Input placeholder="Disabled" disabled />
            <Input placeholder="Con focus visible" autoFocus />
          </div>
        </Section>

        <Section id="badges" title="Badges">
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="accent">Mercado laboral</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </Section>

        <Section id="cards" title="Tarjetas">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Mono className="text-accent">Mercado laboral</Mono>
                <H3 className="text-[20px]">
                  Servidores públicos CDMX: el 88% gana menos de 20 mil pesos al mes
                </H3>
              </CardHeader>
              <CardContent>
                <Body className="text-[15px]">
                  Procesamos las nóminas de 246,831 servidores públicos para describir
                  la distribución real del gasto en remuneraciones.
                </Body>
              </CardContent>
              <CardFooter>
                <Mono className="text-[12px]">22 abr 2026</Mono>
                <Mono className="text-[12px]">8 min</Mono>
              </CardFooter>
            </Card>
            <Card className="bg-muted/40">
              <CardHeader>
                <H3 className="text-[20px]">Respaldo institucional</H3>
              </CardHeader>
              <CardContent>
                <Body className="text-[15px]">
                  Tarjeta secundaria, fondo `muted` para uso destacado dentro del
                  cuerpo del sitio.
                </Body>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section id="data-strip" title="Data Strip">
          <div className="-mx-6 md:mx-0">
            <DataStrip />
          </div>
        </Section>

        <Section id="principio" title="Principio (componente propio)">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            <article>
              <span className="font-serif text-[44px] font-semibold leading-none text-accent tabular-nums">
                01
              </span>
              <H3 className="mt-5">Reproducibilidad al peso.</H3>
              <Body className="mt-3">
                Cada cifra que publicamos puede ser reconstruida desde el microdato
                oficial. Validamos contra publicaciones de INEGI, Banxico, CONSAR y
                otras fuentes.
              </Body>
            </article>
            <article>
              <span className="font-serif text-[44px] font-semibold leading-none text-accent tabular-nums">
                02
              </span>
              <H3 className="mt-5">Transparencia metodológica.</H3>
              <Body className="mt-3">
                Toda gráfica viene con su nota de método, su fuente y su fecha de
                validación.
              </Body>
            </article>
          </div>
        </Section>
      </Container>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-t border-border py-12 first:border-t-0 first:pt-0">
      <H2 className="mb-8 text-[26px] md:text-[28px]">{title}</H2>
      {children}
    </section>
  );
}

function SpecimenRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-border pb-8 md:grid-cols-[200px_1fr] md:gap-8">
      <Mono className="text-[12px] uppercase">{label}</Mono>
      <div>{children}</div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[160px_1fr] md:items-center md:gap-6">
      <Mono className="text-[12px] uppercase">{label}</Mono>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
