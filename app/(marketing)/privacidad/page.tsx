import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Body, Eyebrow, H1, H3, Lead, Small } from "@/components/typography";

/*
  BORRADOR — Aviso de Privacidad (LFPDPPP vigente desde 21-mar-2025).

  ESTA PÁGINA ES UN BORRADOR PARA REVISIÓN DEL CEO Y REVISIÓN LEGAL.
  NO ES EL AVISO OFICIAL Y NO ESTÁ VIGENTE.

  Estado:
   - No enlazada desde el formulario ni desde el footer (por diseño).
   - robots: noindex/nofollow mientras siga siendo borrador.
   - Marcadores [PENDIENTE — CEO] en cada campo que requiere decisión humana.

  Estructura cubre los seis elementos del art. 15 de la LFPDPPP (DOF 20-mar-2025)
  más los anexos prácticos sobre conservación, encargados, seguridad y autoridad.
  Fuente: Ley Federal de Protección de Datos Personales en Posesión de los
  Particulares, expedida por el Decreto publicado en el DOF el 20 de marzo de 2025
  (Edición Vespertina), pp. 88-99 — Artículos 2, 5-7, 14-17, 21-34, 38-39.

  Antes de publicar este aviso:
   1. CEO debe completar todos los marcadores [PENDIENTE — CEO].
   2. CEO debe definir el correo de contacto para ARCO.
   3. Revisión por persona con criterio jurídico (LFPDPPP es ley reciente —
      es la reforma de marzo 2025 que migró la autoridad del INAI a la
      Secretaría Anticorrupción y Buen Gobierno; conviene confirmar
      interpretaciones con un abogado antes de publicar).
   4. Cuando se elija proveedor de envío, sustituir el bloque "Encargados".
   5. Retirar el banner "BORRADOR" y quitar robots: noindex.
   6. Enlazar desde el footer y desde el formulario (modalidad simplificada
      en el punto de captura, conforme al art. 16 fracción II).
*/

export const metadata: Metadata = {
  title: "Aviso de privacidad (borrador)",
  description:
    "Borrador del aviso de privacidad del Observatorio Datos México. En revisión — no vigente.",
  alternates: { canonical: "/privacidad" },
  robots: { index: false, follow: false },
};

function Placeholder({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-sm bg-amber-100 px-1.5 py-0.5 font-mono text-[13px] text-amber-900 ring-1 ring-amber-300/60">
      [PENDIENTE — CEO: {children}]
    </span>
  );
}

function DraftBanner() {
  return (
    <div
      role="note"
      aria-label="Aviso a revisores"
      className="border-y-2 border-amber-400 bg-amber-50 py-6"
    >
      <Container>
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber-800">
            Borrador en revisión — no vigente
          </p>
          <p className="mt-2 font-sans text-[15px] leading-[1.55] text-amber-900">
            Este documento es un <strong>borrador</strong> redactado a partir
            de la LFPDPPP vigente (DOF 20-mar-2025). No ha sido aprobado por el
            CEO ni revisado por persona con criterio jurídico. No constituye
            asesoría legal ni es el aviso oficial del observatorio. Hasta que
            sea aprobado y publicado formalmente, este documento no genera
            obligaciones ni derechos. Los marcadores en amarillo señalan campos
            que el CEO debe completar antes de la revisión legal.
          </p>
        </div>
      </Container>
    </div>
  );
}

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-b border-border py-16 md:py-20">
      <SectionHeader eyebrow={number} title={title} />
      <div className="mt-8 max-w-3xl space-y-4">{children}</div>
    </section>
  );
}

export default function PrivacidadPage() {
  return (
    <>
      <DraftBanner />

      <Container>
        {/* Hero */}
        <section className="pt-16 pb-12 md:pt-20 md:pb-16">
          <div className="max-w-3xl">
            <Eyebrow className="mb-5 text-accent">Aviso de privacidad</Eyebrow>
            <H1>Cómo tratamos tu correo si te suscribes al boletín.</H1>
            <Lead className="mt-7">
              Solo recabamos tu correo electrónico, y solo para enviarte el
              boletín quincenal del observatorio. No vendemos ni compartimos
              datos. Este aviso describe con detalle qué hacemos, qué no, y
              cómo puedes ejercer tus derechos en cualquier momento.
            </Lead>
            <Small className="mt-8 block">
              Última actualización del borrador:{" "}
              <Placeholder>fecha de aprobación</Placeholder>. Documento
              redactado conforme a la Ley Federal de Protección de Datos
              Personales en Posesión de los Particulares (LFPDPPP), vigente
              desde el 21 de marzo de 2025.
            </Small>
          </div>
        </section>

        {/* § 1 — Identidad y domicilio del responsable (Art. 15 fracc. I) */}
        <Section id="responsable" number="§ 1" title="Quién es responsable de tus datos.">
          <Body>
            El responsable del tratamiento de los datos personales que se
            recaban a través del formulario de suscripción al boletín es{" "}
            <Placeholder>
              razón social o nombre legal completo del responsable; si es
              persona física, nombre completo; si es persona moral o el ITAM
              opera como responsable legal, confirmar con asesoría jurídica
            </Placeholder>
            , con domicilio en{" "}
            <Placeholder>
              domicilio completo para oír y recibir notificaciones (calle,
              número, colonia, alcaldía/municipio, código postal, ciudad,
              estado, país)
            </Placeholder>
            .
          </Body>
          <Body>
            Para cualquier asunto relacionado con este aviso de privacidad o
            con tus datos personales, puedes escribirnos a{" "}
            <Placeholder>
              correo de contacto para asuntos de privacidad — sugerencia
              técnica: privacidad@datosmexico.org o arco@datosmexico.org;
              decidir cuál y crear el alias en Cloudflare Email Routing
            </Placeholder>
            .
          </Body>
        </Section>

        {/* § 2 — Datos recabados (Art. 15 fracc. II) */}
        <Section id="datos" number="§ 2" title="Qué datos recabamos.">
          <Body>
            Solo recabamos un dato: <strong>tu dirección de correo electrónico</strong>.
          </Body>
          <Body>
            No recabamos nombre, apellidos, fecha de nacimiento, dirección
            postal, teléfono, ocupación, ni ningún otro dato. No recabamos
            datos personales sensibles en el sentido del artículo 2,
            fracción VI, de la LFPDPPP (origen racial o étnico, estado de
            salud, información genética, creencias religiosas o filosóficas,
            opiniones políticas, preferencia sexual, etcétera).
          </Body>
          <Body>
            Aplicamos el principio de minimización: pedimos únicamente lo
            estrictamente necesario para cumplir la finalidad descrita en la
            sección siguiente.
          </Body>
        </Section>

        {/* § 3 — Finalidades (Art. 15 fracc. III) */}
        <Section id="finalidades" number="§ 3" title="Para qué usamos tu correo.">
          <H3>Finalidad primaria (requiere tu consentimiento).</H3>
          <Body>
            Tu correo se utiliza con un único fin: <strong>enviarte el boletín
            quincenal del observatorio</strong>, que contiene el resumen de las
            dos semanas previas de actividad publicada en la agenda del sitio.
          </Body>
          <H3 className="mt-8">Finalidades secundarias.</H3>
          <Body>
            <strong>No tratamos tu correo para ningún fin secundario.</strong>
            {" "}En particular, no lo usamos para publicidad, perfilamiento,
            análisis de comportamiento, segmentación comercial, ni para
            enviarte comunicaciones distintas del boletín. Si en el futuro el
            observatorio decidiera incorporar alguna finalidad adicional, te
            lo notificaríamos previamente y solicitaríamos tu consentimiento
            de nuevo, conforme al artículo 11 de la LFPDPPP.
          </Body>
        </Section>

        {/* § 4 — Consentimiento y revocación (Art. 7 LFPDPPP) */}
        <Section id="consentimiento" number="§ 4" title="Cómo obtenemos tu consentimiento y cómo puedes revocarlo.">
          <Body>
            Al enviar el formulario de suscripción y, en su caso, confirmar
            tu suscripción a través del correo de verificación que recibirás,
            otorgas tu consentimiento expreso para que tratemos tu dirección
            de correo con la finalidad descrita en § 3.
          </Body>
          <Body>
            Puedes revocar tu consentimiento en cualquier momento, sin
            necesidad de justificar tu decisión, por cualquiera de estas vías:
          </Body>
          <ul className="ml-1 list-disc space-y-2 pl-5 font-sans text-[16px] leading-[1.6] text-text md:text-[17px] md:leading-[1.65]">
            <li>
              Haciendo clic en el enlace de baja (&ldquo;darme de baja&rdquo;) que
              aparece al pie de cada boletín que enviamos.
            </li>
            <li>
              Enviando un correo a <Placeholder>correo para ARCO/baja</Placeholder>{" "}
              con el asunto &ldquo;baja del boletín&rdquo;.
            </li>
          </ul>
          <Body>
            La revocación surte efectos a partir del momento en que la
            procesamos, sin efectos retroactivos sobre tratamientos previos
            (art. 7, último párrafo, de la LFPDPPP).
          </Body>
        </Section>

        {/* § 5 — Opciones para limitar uso o divulgación (Art. 15 fracc. IV) */}
        <Section id="limitar" number="§ 5" title="Cómo limitar el uso o divulgación de tu correo.">
          <Body>
            Tu correo nunca se divulga públicamente ni se comparte con
            terceros para fines distintos al envío del boletín. Aun así, la
            LFPDPPP te garantiza el derecho a limitar el uso de tus datos. Si
            quieres recibir el boletín pero limitar algún aspecto específico
            de su tratamiento — por ejemplo, solicitar que tu correo no sea
            incluido en estadísticas agregadas de apertura o clics —, puedes
            solicitarlo escribiendo a{" "}
            <Placeholder>correo para ARCO</Placeholder>. Atenderemos tu
            solicitud en los plazos descritos en § 9.
          </Body>
        </Section>

        {/* § 6 — Encargados (no transferencia, art. 2 fracc. XII) */}
        <Section id="encargados" number="§ 6" title="Quién más procesa tu correo en nuestro nombre.">
          <Body>
            Para el envío material del boletín, recurrimos a un proveedor
            tecnológico que actúa como <em>persona encargada</em> en el
            sentido del artículo 2, fracción XII, de la LFPDPPP — es decir,
            procesa tus datos exclusivamente por nuestra cuenta, siguiendo
            nuestras instrucciones, y sin facultad de tratarlos para sus
            propios fines. Esto no constituye una transferencia de datos a
            tercero.
          </Body>
          <Body>
            El proveedor encargado del envío es{" "}
            <Placeholder>
              nombre y país del proveedor de envío que se elija (ej. Resend
              Inc., Estados Unidos; Buttondown, LLC, Estados Unidos; etcétera)
            </Placeholder>
            . Mantenemos con dicho proveedor un acuerdo de tratamiento de
            datos que le obliga a aplicar medidas de seguridad equivalentes
            a las descritas en § 8 y a destruir o devolver los datos al
            término de la relación contractual.
          </Body>
          <Body>
            No vendemos, no rentamos, no compartimos ni cedemos tu correo a
            ningún otro tercero, salvo requerimiento fundado y motivado de
            autoridad competente conforme al artículo 9, fracción VII, de la
            LFPDPPP.
          </Body>
        </Section>

        {/* § 7 — Conservación y baja */}
        <Section id="conservacion" number="§ 7" title="Cuánto tiempo conservamos tu correo.">
          <Body>
            Tu correo se conserva en nuestra base de suscriptores mientras
            mantengas tu suscripción activa. Cuando te das de baja:
          </Body>
          <ul className="ml-1 list-disc space-y-2 pl-5 font-sans text-[16px] leading-[1.6] text-text md:text-[17px] md:leading-[1.65]">
            <li>
              Marcamos tu correo como dado de baja de inmediato y dejamos de
              enviarte el boletín.
            </li>
            <li>
              Mantenemos tu correo en estado de <em>bloqueo</em> — sin
              tratamiento adicional — durante el plazo de prescripción legal
              aplicable, con el único propósito de poder acreditar, si fuera
              necesario, que tu solicitud de baja fue atendida (art. 2 fracc.
              III y art. 24 de la LFPDPPP).
            </li>
            <li>
              Concluido ese plazo, suprimimos definitivamente tu correo de
              nuestros sistemas.
            </li>
          </ul>
          <Body>
            Si ejerces tu derecho de cancelación (§ 9), aplicamos el mismo
            procedimiento de bloqueo previo a la supresión.
          </Body>
        </Section>

        {/* § 8 — Medidas de seguridad (Art. 18 LFPDPPP) */}
        <Section id="seguridad" number="§ 8" title="Cómo protegemos tu correo.">
          <Body>
            Aplicamos medidas de seguridad administrativas, técnicas y
            físicas razonables para proteger tu correo contra pérdida, uso,
            divulgación o acceso no autorizados, conforme al artículo 18 de
            la LFPDPPP. En lo técnico, esto incluye: almacenamiento cifrado
            en reposo, transmisión cifrada en tránsito (TLS), control de
            acceso por rol, y registro de operaciones sobre la base de
            suscriptores.
          </Body>
          <Body>
            En el caso poco probable de una vulneración de seguridad que
            afecte de forma significativa tus derechos, te lo informaremos de
            forma inmediata para que puedas tomar medidas en defensa de tus
            intereses, conforme al artículo 19 de la LFPDPPP.
          </Body>
        </Section>

        {/* § 9 — Derechos ARCO (Art. 15 fracc. V, arts. 21-34) */}
        <Section id="arco" number="§ 9" title="Tus derechos ARCO y cómo ejercerlos.">
          <Body>
            En cualquier momento puedes ejercer tus derechos de{" "}
            <strong>acceso, rectificación, cancelación y oposición</strong>{" "}
            (ARCO), reconocidos por los artículos 22 a 26 de la LFPDPPP:
          </Body>
          <ul className="ml-1 list-disc space-y-2 pl-5 font-sans text-[16px] leading-[1.6] text-text md:text-[17px] md:leading-[1.65]">
            <li>
              <strong>Acceso</strong>: conocer qué datos tuyos tenemos y bajo
              qué condiciones los tratamos.
            </li>
            <li>
              <strong>Rectificación</strong>: corregir tu correo si está mal
              escrito o lo cambiaste.
            </li>
            <li>
              <strong>Cancelación</strong>: pedir que eliminemos tu correo
              (equivalente a darte de baja del boletín).
            </li>
            <li>
              <strong>Oposición</strong>: oponerte al tratamiento de tu
              correo por una causa legítima, aun si el tratamiento fuera
              lícito.
            </li>
          </ul>
          <H3 className="mt-8">Cómo lo ejerces.</H3>
          <Body>
            Envía tu solicitud al correo{" "}
            <Placeholder>correo para ARCO</Placeholder> con la siguiente
            información, conforme al artículo 28 de la LFPDPPP:
          </Body>
          <ul className="ml-1 list-disc space-y-2 pl-5 font-sans text-[16px] leading-[1.6] text-text md:text-[17px] md:leading-[1.65]">
            <li>Tu nombre y un medio para responderte (puede ser el mismo correo).</li>
            <li>
              Algún documento que acredite tu identidad (o, en su caso, la
              representación legal de quien actúa por ti).
            </li>
            <li>Descripción clara del derecho ARCO que quieres ejercer.</li>
            <li>El correo electrónico sobre el cual recae tu solicitud.</li>
          </ul>
          <Body>
            Te responderemos en un plazo máximo de <strong>20 días hábiles</strong>{" "}
            desde la recepción de tu solicitud y, si procede, haremos efectiva
            la determinación dentro de los <strong>15 días hábiles</strong>{" "}
            siguientes, conforme al artículo 31 de la LFPDPPP. El ejercicio
            de los derechos ARCO es gratuito (art. 34).
          </Body>
        </Section>

        {/* § 10 — Procedimiento de cambios al aviso (Art. 15 fracc. VI) */}
        <Section id="cambios" number="§ 10" title="Cómo te informamos de cambios a este aviso.">
          <Body>
            Si modificamos este aviso de privacidad, publicaremos la nueva
            versión en esta misma página, con la fecha de última
            actualización visible al inicio. Cuando los cambios sean
            sustanciales — por ejemplo, una nueva finalidad de tratamiento o
            un cambio en los encargados —, te lo notificaremos por correo
            electrónico antes de que la nueva versión surta efectos, para
            que puedas decidir si mantienes tu suscripción.
          </Body>
        </Section>

        {/* § 11 — Autoridad competente */}
        <Section id="autoridad" number="§ 11" title="Autoridad competente.">
          <Body>
            La autoridad encargada de vigilar el cumplimiento de la LFPDPPP
            es la <strong>Secretaría Anticorrupción y Buen Gobierno</strong>,
            conforme al artículo 38 de la propia ley y al Decreto de reforma
            publicado en el DOF el 20 de marzo de 2025. Si consideras que el
            tratamiento de tus datos no se ajusta a este aviso, puedes
            presentar una solicitud de protección de derechos ante dicha
            Secretaría, en los términos del artículo 40 y siguientes de la
            LFPDPPP.
          </Body>
        </Section>

        {/* § 12 — Fundamento legal */}
        <Section id="fundamento" number="§ 12" title="Fundamento legal y vigencia.">
          <Body>
            Este aviso de privacidad se emite en cumplimiento de los
            artículos 14, 15, 16 y 17 de la Ley Federal de Protección de
            Datos Personales en Posesión de los Particulares, publicada en
            el Diario Oficial de la Federación el 20 de marzo de 2025 y
            vigente a partir del 21 de marzo de 2025.
          </Body>
          <Body>
            Vigencia del presente aviso: a partir del{" "}
            <Placeholder>fecha de publicación oficial</Placeholder> y hasta
            que sea modificado conforme al procedimiento descrito en § 10.
          </Body>
        </Section>

        {/* Disclaimer de borrador, repetido al pie */}
        <section className="py-16">
          <div className="max-w-3xl rounded-md border-2 border-dashed border-amber-400 bg-amber-50/60 p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber-800">
              Recordatorio — borrador
            </p>
            <Small className="mt-2 block text-amber-900">
              Este documento es un borrador interno para revisión del CEO y
              revisión legal. No constituye asesoría legal ni representa el
              aviso oficial del observatorio. Hasta que sea aprobado y
              enlazado desde el formulario, no produce obligaciones ni
              derechos.
            </Small>
          </div>
        </section>
      </Container>
    </>
  );
}
