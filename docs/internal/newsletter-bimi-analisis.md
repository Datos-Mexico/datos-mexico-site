# BIMI — análisis para Datos México

> Pregunta: ¿qué necesitamos para que aparezca la marca del observatorio
> como avatar circular junto al remitente en Gmail, Apple Mail y Yahoo?
>
> Respuesta corta: BIMI (Brand Indicators for Message Identification). Es
> un estándar de la industria, pero su rendimiento real exige un VMC
> (Verified Mark Certificate) que cuesta entre **USD 1,200 y USD 1,800 al
> año** y requiere que el logo esté registrado como marca en una oficina
> reconocida (en México: IMPI).
>
> Recomendación: **anotarlo como deuda visual para Fase 5+, no
> implementarlo ahora.** Razonamiento abajo.

## Qué es BIMI

Estándar abierto que permite a un dominio publicar un logo SVG y asociarlo
a sus correos. Los clientes compatibles (Gmail, Apple Mail, Yahoo,
Fastmail, La Poste) consultan dos registros DNS al recibir un correo del
dominio:

1. **`_bimi.<dominio>` TXT** con `v=BIMI1; l=<URL del SVG>; a=<URL del VMC>`.
2. **Validación del VMC** (el certificado), que prueba que la marca está
   registrada legalmente y que el SVG corresponde a esa marca.

Si las dos cosas cuadran, el cliente muestra el avatar del logo junto al
remitente. Si falta el VMC o el VMC no es de un emisor reconocido, **Gmail
no muestra el avatar** — solo lo hace cuando hay VMC válido.

## Pre-requisitos técnicos que ya tenemos parcialmente

| Requisito | Estado en datosmexico.org |
|-----------|---------------------------|
| SPF en el dominio de envío | ✓ (`send.mail.datosmexico.org`) |
| DKIM en el dominio de envío | ✓ (`resend._domainkey.mail.datosmexico.org`) |
| DMARC con `p=quarantine` o `p=reject` y alineación | **✗ falta** (hoy no hay `_dmarc.mail.datosmexico.org` ni `_dmarc.datosmexico.org`) |
| Logo SVG en formato **SVG Tiny PS** (un perfil restringido del estándar SVG) | **✗ falta** (nuestro `logo.svg` actual es SVG completo, no SVG Tiny PS) |
| Logo registrado como marca (registro de marca) | **✗ falta** (observatorio en proceso de constituirse) |
| VMC emitido por una CA autorizada | **✗ no aplicable** sin marca registrada |

DMARC y SVG Tiny PS son gratis y los podríamos generar. El bloqueador real
es el **registro de marca + VMC**.

## El bloqueador: VMC y registro de marca

Para que Gmail muestre el avatar, el VMC tiene que estar emitido por una
de las CAs autorizadas (DigiCert o Entrust son las dos públicas en este
momento) y la marca tiene que estar **registrada legalmente** en una
oficina de marcas reconocida. En México eso es el IMPI (Instituto Mexicano
de la Propiedad Industrial).

### Costos reales

- **Registro de marca en México (IMPI)**: ~MXN 3,000–4,500 por clase, más
  honorarios si se contrata abogado. El trámite tarda entre 4 y 8 meses
  típicamente. Estamos en proceso de constituirnos legalmente (ver
  `docs/aviso-privacidad-revision-legal.md` y el aviso vigente en
  `/privacidad`); el registro de marca depende de tener la figura legal
  primero.
- **VMC anual** (DigiCert / Entrust): USD 1,200 – USD 1,800 por año,
  renovable. No es opcional para Gmail.
- **CMC (Common Mark Certificate)**: alternativa más barata (~USD 200–400)
  pensada para marcas no registradas — pero solo se acepta para mostrar el
  avatar en algunos clientes y **Gmail no lo respeta**. Lo descarto.

Total realista para Datos México el primer año (asumiendo trámites): IMPI
+ VMC ≈ USD 1,400 + abogado/gestor (variable) + 4-8 meses de espera.

## La lectura honesta para el observatorio

BIMI es marketing de identidad muy bien hecho — sube la tasa de apertura
~10% según los reportes de DigiCert y Valimail. Para una marca comercial
que envía millones de correos al mes es una inversión clara: 10% de
millones de aperturas paga el VMC ampliamente.

Para Datos México ahora mismo:

- Volumen previsto del boletín: bajo (decenas, en el mejor caso de
  arranque, cientos de suscriptores).
- Vehículo legal: aún no constituido; el registro de marca legal está
  bloqueado por esto.
- Objetivo de la primera fase: ganar autoridad académica y de prensa, no
  optimizar deliverability comercial.

El ROI no está en esta etapa.

## Recomendación

**No implementar BIMI ahora.** Anotar como deuda visual para Fase 5 o
posterior, cuando se cumplan a la vez:

1. El observatorio quede legalmente constituido.
2. El registro de marca en IMPI esté tramitado y vigente.
3. El boletín tenga volumen y prensa lo cite con regularidad (el
   reconocimiento del avatar sí ayuda cuando una persona recibe un correo
   del observatorio mezclado con muchos otros).

Mientras tanto, lo que sí podemos hacer **gratis** y mejora la percepción:

1. **Añadir DMARC en `_dmarc.mail.datosmexico.org`** con `p=none` para
   recolectar reportes durante un mes y luego subir a `p=quarantine`.
   Esto fortalece la autenticidad sin coste.
2. **Asegurar que el logo PNG del header de los correos** quede grabado
   en los clientes de correo después de varias entregas (Gmail aprende
   los remitentes que el usuario abre y muestra una "G" tipográfica con
   color de marca cuando no hay avatar — no es BIMI pero ayuda).
3. **Coherencia visual extrema**: el sistema de plantilla base aporta
   eso. Que el correo se vea idéntico al sitio refuerza identidad sin
   costar nada.

## Si en el futuro queremos avanzar

Pasos en orden, cuando estén las condiciones:

1. Constituir legalmente el observatorio (en curso).
2. Solicitar el registro de marca de "Datos México" + el isotipo en IMPI.
   Esperar a la resolución (4-8 meses).
3. Una vez registrada, contratar VMC con DigiCert o Entrust. Necesitarán:
   - Comprobante del registro de marca.
   - Logo en formato SVG Tiny PS (se puede generar a partir del SVG
     actual con `svgo` y restricciones de subset).
   - Validación de identidad de la organización.
4. Configurar DMARC con `p=quarantine` (requisito de BIMI).
5. Subir el logo SVG Tiny PS a una URL HTTPS del dominio (e.g.
   `https://datosmexico.org/brand/logo-bimi.svg`).
6. Añadir el registro `_bimi.mail.datosmexico.org TXT v=BIMI1; l=<URL>;
   a=<URL del VMC .pem>`.
7. Verificar con bimigroup.org/bimi-generator.

Ningún paso anterior es código que se mergee; todos son trámite +
configuración. Mantenemos esta nota como referencia para cuando
corresponda.
