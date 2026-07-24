# Mapa de inteligencia de la home — pendientes y mantenimiento programado

> Estado al cierre de F2 (coropletas con selector, 2026-07-24). El mapa vive
> en `components/sections/mapa/`; la geometría se regenera con
> `npx tsx scripts/build-mapa-estados.ts` y los datos de indicadores con
> `npx tsx scripts/build-mapa-indicadores.ts` (ambos con verificaciones
> duras: abortan si una fuente cambia de forma o un cruce nacional falla).

## Candidatas registradas para la fase de drill-down

- **Pobreza multidimensional estatal (INEGI, serie CONEVAL continuada)** —
  candidata #1. Primera medición INEGI: PM 2024 (publicada 13-ago-2025,
  metodología CONEVAL preservada, serie 2016-2024). Tabulado estatal
  verificado: `https://www.inegi.org.mx/contenidos/desarrollosocial/pm/tabulados/pm_ef_2024.xlsx`
  (457 KB; también existe `pm_ct_2024.xlsx` con Gini y cohesión social).
  Bienal; próxima con datos 2026. Quedó fuera del canon del mapa para no
  duplicar "pobreza" en la capa humana junto a la pobreza laboral; es el
  mejor "¿alcanza para vivir?" para el drill-down por estado.

## Pendientes de producto

- **Navegación por teclado del mapa** — registrado desde F1. Se aborda
  cuando los estados tengan destino real (fase de datos con drill-down);
  hoy la interacción es solo hover y los paths no son focuseables a
  propósito (sin promesa de interacción que no existe).

## Mantenimiento programado de datos

- **25/26-ago-2026** — INEGI publica la ENOE 2T-2026 (25-ago, boletín 301/26:
  informalidad TIL1 y desocupación) y Pobreza Laboral 2T-2026 (26-ago:
  pobreza laboral e ingreso, Cuadros 9 y 5). Regenerar indicadores: el descubrimiento del tabulado PL y el
  `Periodo top 1` de PxWeb toman el trimestre nuevo solos; actualizar las
  anclas nacionales de validación en `build-mapa-indicadores.ts` con las
  cifras de los boletines nuevos antes de correr. El CSV del IMSS es
  mensual (constante `URL_IMSS_CSV` + ancla del comunicado).
- **~día 17 de cada mes** — SESNSP/CNI publica el corte mensual del RNID
  (incidencia delictiva). El indicador de homicidios usa el año completo
  anterior; el refresh relevante es el de enero (cierra el año) y cualquier
  corrección retroactiva de la serie. Los share-links de SharePoint son
  estables pero el nombre del archivo interno cambia por mes: el pipeline
  resuelve la ruta vía redirect_url en cada corrida.
- **~septiembre 2026** — ENVIPE 2026 (percepción de inseguridad estatal,
  levantamiento mar-abr 2026). Patrón estable
  `V_percepcion_seguridad_{año}_est.xlsx`; actualizar año y ancla nacional.
- **22-sep-2026** — INEGI difunde la Encuesta Intercensal 2025. Revisar
  los denominadores CONAPO del pipeline (población total 2026, población
  15+ para la tasa IMSS, población 2024 para PIB per cápita): si la
  Intercensal detona conciliación demográfica o nueva base de proyecciones,
  migrar la fuente de población y documentar el cambio de serie en la
  cabecera generada. La misma fecha renueva el grado promedio de
  escolaridad (hoy Censo 2020, BISE 1005000038): refrescar el indicador y
  su periodo declarado en la capa humana, y revisar el ancla editorial
  "apenas pasa de la secundaria terminada" del módulo de voz (cierta
  mientras el promedio ronde 9-10 años; secundaria = 9).
