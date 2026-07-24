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

## Ola 3 — Vista "Alcanza para vivir" (siguiente)

- **Composición registrada**: rey pobreza (multidimensional, PM 2024
  INEGI); satélites pobreza extrema, falta comida (carencia por acceso a
  la alimentación), lo que junta un hogar (ingreso corriente ENIGH) y
  desigualdad (Gini — el valor se lee del Cuadro 2.1 de `pm_ct_2024.xlsx`
  en su Fase A).
- **Fuentes**: `pm_ef_2024.xlsx` y ENIGH 2024, verificadas en el
  inventario de F4. Fichas finas + copy palabra por palabra en su Fase A.
- El pulso ya rota con 2 vistas; la tercera solo se suma a `VISTAS` con
  `activa: true` y el motor la toma (verificar tiempos dinámicos de su
  frase de rey).

## Ola 2 — Vista La Seguridad (COMPLETA)

- **Composición vigente**: rey homicidios; satélites sentirse inseguro,
  robo de coches (serie cerrada por dictamen: coche de 4 ruedas con y sin
  violencia, SIN motocicletas — el argumento del seguro es de coches),
  mujeres asesinadas (dictamen: feminicidio + homicidio doloso con
  víctima mujer por 100 mil mujeres; separarlos compararía tipificación
  de fiscalías — evidencia: % feminicidio estatal 3.1%–85.7%; matiz
  piso-no-techo por sexo no identificado en la cita técnica) y víctimas
  de delito (prevalencia ENVIPE por entidad de residencia, Cuadro 1.1).
- **Motor del pulso vivo**: rota solo entre vistas activas y con puntero
  fino; pausa por cursor o foco visible en el bloque de la vista o la
  columna completa del mapa; reanuda con reloj desde cero; reduced-motion
  lo apaga; la rotación entra pintando al rey. **Intervalo por dictamen:
  dinámico** — el pulso respira con el texto, `max(9s, 0.35s × palabras
  + 3s)` es el ritmo canónico; `?pulso=` queda como diagnóstico.
- **Doctrina de los dots** (dictamen Ola 2): hover-sin-clicks aplica a
  estados e items del selector porque no son destinos; las vistas SÍ son
  destinos. Dots de vistas activas = botones con teclado; dots de vistas
  sin ola = inertes y decorativos.
- **Anclaje de copy**: la cláusula "los más comunes" de la frase de
  víctimas de delito está anclada al top-3 nacional de incidencia
  (ENVIPE cuadro 1.13); el pipeline aborta si el top-3 cambia, para
  forzar revisión editorial antes de regenerar.
- El pipeline tiene ahora **18 cruces nacionales** (11 previos + 7 de la
  ola 2) más el anclaje del top-3.

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
  (incidencia delictiva). Los TRES indicadores RNID (homicidios, mujeres
  asesinadas, robo de coches) usan el año completo anterior; el refresh
  relevante es el de enero (cierra el año) y cualquier corrección
  retroactiva de la serie. Al refrescar, actualizar también las anclas de
  suma (2,818) y tasas (4.14 y 52.8) con la evidencia de la corrida
  nueva. Los share-links de SharePoint son estables pero el nombre del
  archivo interno cambia por mes: el pipeline resuelve la ruta vía
  redirect_url en cada corrida. Regla de ola vigente: los zips congelados
  en staging (`evidencia/f4-ola2/fuentes/`, con SHA-256) son la fuente de
  la Ola 2; un corte nuevo a mitad de ola NO se integra en caliente.
- **10-sep-2026** — ENVIPE 2026 (fecha anunciada en el calendario IIN del
  SNIEG). Refresh conjunto de los dos indicadores ENVIPE: percepción
  (`V_percepcion_seguridad_{año}_est.xlsx`, cuadro 5.13) y víctimas de
  delito (`I_nivel_victimizacion_{año}_est.xlsx`, cuadro 1.1, entidad de
  residencia). Actualizar año, anclas nacionales y extremos contra el
  comunicado nuevo, y revisar el anclaje del top-3 de incidencia (cuadro
  1.13): si el podio de delitos cambió, la frase de víctimas de delito se
  revisa editorialmente antes de regenerar.
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
