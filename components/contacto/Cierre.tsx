import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Body, Small } from "@/components/typography";

export function ContactoCierre() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-3xl rounded-lg bg-muted px-6 py-10 md:px-10 md:py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
          <div>
            <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
              Sobre la organización
            </h3>
            <Body className="mt-4 text-[15px] leading-[1.65]">
              Datos México es un observatorio académico independiente formado
              por estudiantes y egresados del ITAM. Operamos sin fines de lucro,
              sin financiamiento partidista o gubernamental, y con código
              abierto.
            </Body>
            <Link
              href="/quienes-somos"
              className="mt-5 inline-flex items-center gap-1.5 font-sans text-[14px] font-medium text-primary hover:gap-2.5 transition-[gap]"
            >
              Conoce al equipo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div>
            <h3 className="font-serif text-[20px] font-semibold leading-[1.3] text-foreground md:text-[22px]">
              Ubicación
            </h3>
            <Body className="mt-4 text-[15px] leading-[1.65]">
              Equipo distribuido. Sede operativa: Ciudad de México.
            </Body>
            <Small className="mt-4 text-[13px] leading-[1.6]">
              Para correspondencia formal, escribir primero a{" "}
              <a
                href="mailto:contacto@datosmexico.org"
                className="text-primary underline-offset-4 hover:underline"
              >
                contacto@datosmexico.org
              </a>{" "}
              para coordinar.
            </Small>
          </div>
        </div>
      </div>
    </section>
  );
}
