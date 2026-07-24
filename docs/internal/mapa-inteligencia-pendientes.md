# Mapa de inteligencia de la home — pendientes y mantenimiento programado

> Estado al cierre de F2 (coropletas con selector, 2026-07-24). El mapa vive
> en `components/sections/mapa/`; la geometría se regenera con
> `npx tsx scripts/build-mapa-estados.ts` y los datos de indicadores con
> `npx tsx scripts/build-mapa-indicadores.ts` (ambos con verificaciones
> duras: abortan si una fuente cambia de forma o un cruce nacional falla).

## Pendientes de producto

- **Navegación por teclado del mapa** — registrado desde F1. Se aborda
  cuando los estados tengan destino real (fase de datos con drill-down);
  hoy la interacción es solo hover y los paths no son focuseables a
  propósito (sin promesa de interacción que no existe).

## Mantenimiento programado de datos

- **26-ago-2026** — INEGI publica Pobreza Laboral 2T-2026 (pobreza laboral
  e ingreso laboral real, Cuadros 9 y 5) y la ENOE 2T-2026 (informalidad
  TIL1). Regenerar indicadores: el descubrimiento del tabulado PL y el
  `Periodo top 1` de PxWeb toman el trimestre nuevo solos; actualizar las
  anclas nacionales de validación en `build-mapa-indicadores.ts` con las
  cifras de los boletines nuevos antes de correr. El CSV del IMSS es
  mensual (constante `URL_IMSS_CSV` + ancla del comunicado).
- **22-sep-2026** — INEGI difunde la Encuesta Intercensal 2025. Revisar
  los denominadores CONAPO del pipeline (población total 2026, población
  15+ para la tasa IMSS, población 2024 para PIB per cápita): si la
  Intercensal detona conciliación demográfica o nueva base de proyecciones,
  migrar la fuente de población y documentar el cambio de serie en la
  cabecera generada.
