# FASE 2 sitio canónico — Reporte de cierre

**Frente:** sitio canónico (`datosmexico.org`)
**Repo:** `Datos-Mexico/datos-mexico-site`
**Fase:** FASE 2 — Integridad del contrato público (cierre).
**Branch:** `audit/sitio-canonico-fase-2-correcciones`.
**Rol del operador:** reporte de cierre de FASE 2 del sitio canónico,
producido por el equipo técnico del observatorio.

## Metadata

| Campo | Valor |
|---|---|
| Fecha/hora ISO de cierre | `2026-05-24T<close>Z` |
| Commit hash de partida (`main`) | `0a72c6beb081436c20e2c705d43f9fcdbf113019` |
| Commit hash final de la branch (pre-cierre) | `f17520e18b90bdbcfbc12d1ebeffb57b1e235a31` |
| Subject del commit base | `audit(sitio-canonico): inventario empírico exhaustivo del frente sitio canónico (#1)` |
| Plan de ejecución (commit en branch) | `51ee951b8bab70a163e46ac0032835686a286fb4` |

## Resumen ejecutivo

Esta FASE 2 aplicó **3 correcciones de integridad del contrato público
del sitio canónico** (Hallazgos 2, 4 y 5 del inventario de FASE 1,
categorizados como publicidad falsa del producto post razonamiento
empírico) y **registró 5 deudas explícitas** para futuras fases
(Hallazgos 1, 3, 6, 7 + subcaso 2 bis del SDK). Cero deudas nuevas
emergieron durante la ejecución. Build verde post-cambios.

**Comportamiento esperado del sitio post-merge**:

- `/metodologia` deja de comprometer cifra exacta del SDK ("78 endpoints"
  → "todos los endpoints públicos").
- `/boletin` declara cadencia quincenal de manera coherente con la home,
  eliminando contradicciones internas (3-5 envíos/semana eliminado).
- `/` (home) muestra las 3 publicaciones reales del registry, con
  títulos, categorías, fechas y slugs correctos. La card prometida pero
  inexistente "Nuevo León supera a la CDMX en ingreso por hogar"
  desaparece. La auto-sincronización con `getAllPublications()` elimina
  la posibilidad de drift recurrente entre el home y el contenido real
  publicado.

---

## Sección 1 — Decisiones académicas resueltas

### Decisión 1 — Hallazgo 2 (CEO: corregir prosa de "78 endpoints")

Resolución textual del CEO:

> "Cambiar `los 78 endpoints públicos` por `todos los endpoints públicos`
> en `components/metodologia/AccesoProgramatico.tsx:10`. El observatorio
> crece — los endpoints siguen aumentando con cada fase del audit y con
> cada dataset nuevo. Comprometerse a cifra exacta crea deuda recurrente.
> Para un investigador externo, la promesa de cobertura es más importante
> que el número exacto."

Estado: **aplicada** (commit `20c0889`).

### Decisión 2 — Hallazgo 2 bis (CEO: NO actuar sobre cobertura SDK)

Resolución textual del CEO:

> "Registrar como deuda explícita. Origen del 78 cerrado conceptualmente
> con la corrección de Decisión 1 — la cifra se elimina del sitio
> canónico, ya no importa cuánto cubre el SDK exactamente en términos
> de prosa pública del sitio."

Estado: **registrada como Deuda 2** en Sección 3.

### Decisión 3 — Hallazgo 4 (CEO: alinear cadencia del boletín a quincenal)

Resolución textual del CEO:

> "El boletín del observatorio se compromete públicamente como
> **quincenal** (~26 envíos/año), compromiso conservador y sostenible.
> Si en el futuro el equipo demuestra capacidad de cadencia más
> ambiciosa, se revisará la decisión entonces con evidencia."

Resolución textual aplicada:

- `components/sections/Newsletter.tsx`: intacto (ya declaraba "Boletín
  quincenal").
- `components/boletin/Formatos.tsx`: campo `cadencia` eliminado del array
  y de la `<dl>` de cada card; prosa de cierre reescrita a quincenal;
  flag `[PENDIENTE: confirmar al elegir proveedor]` eliminado.
- `components/boletin/Preguntas.tsx`: respuesta del FAQ "¿Cada cuánto
  envían correos?" reescrita a quincenal; pregunta intacta.

Estado: **aplicada** (commit `2a82b3f`).

### Decisión 4 — Hallazgo 5 (CEO: auto-sincronizar Publicaciones.tsx)

Resolución textual del CEO:

> "Refactorizar `components/sections/Publicaciones.tsx` para que consuma
> `getAllPublications()` de `@/lib/publicaciones/loader`. Tomar las 3
> publicaciones más recientes. Mapear cada publicación al shape de la
> card. Eliminar el array hardcoded. Mantener intacto el JSX de
> presentación. Sin inventar shape de datos. Sin cambiar diseño visual."

Estado: **aplicada** (commit `f17520e`). Build verde.

---

## Sección 2 — Cambios aplicados

### Cambio 1 — Hallazgo 2 (commit `20c0889`)

**Archivo**: `components/metodologia/AccesoProgramatico.tsx`

**Diff**:

```diff
-        lead="Publicamos un cliente Python oficial (datos-mexico) que da acceso a la lectura pública del API completa. El cliente cubre los 78 endpoints públicos con tipos validados, caché integrado y manejo robusto de errores."
+        lead="Publicamos un cliente Python oficial (datos-mexico) que da acceso a la lectura pública del API completa. El cliente cubre todos los endpoints públicos con tipos validados, caché integrado y manejo robusto de errores."
```

**Verificación post-cambio**:

```bash
grep -n "78" components/metodologia/AccesoProgramatico.tsx
# → EXIT 1 (cero matches)
grep -n "todos los endpoints públicos" components/metodologia/AccesoProgramatico.tsx
# → 1 match en línea 10
```

### Cambio 2 — Hallazgo 4 (commit `2a82b3f`)

**Archivos**: `components/boletin/Formatos.tsx`, `components/boletin/Preguntas.tsx`.

**Diff resumido — `Formatos.tsx`** (4 modificaciones, +4 / -18 líneas):

1. Tipo inline del array `formatos`: campo `cadencia: string` eliminado.
2. Tres entradas del array: campo `cadencia` removido (`"Mensual"`,
   `"Semanal"`, `"Cuando publica la fuente"`).
3. JSX del `<dl>` de cada card: bloque `<div>` con par "Cadencia /
   {f.cadencia}" eliminado; queda sólo el par "Lectura / {f.lectura}".
4. Prosa de cierre (`<Small>`) reemplazada:
   ```diff
   -        En conjunto, esto significa aproximadamente entre 3 y 5 envíos por
   -        semana. Si prefieres recibir un solo resumen semanal, podrás
   -        configurarlo en tus preferencias una vez nos hayas definido un proveedor
   -        de boletín.{" "}
   -        <span className="text-text-subtle/80">
   -          [PENDIENTE: confirmar al elegir proveedor]
   -        </span>
   +        El boletín se envía con cadencia quincenal (aproximadamente dos
   +        envíos al mes), agrupando los análisis publicados en ese periodo.
   +        Sin spam, sin paywalls.
   ```

**Diff resumido — `Preguntas.tsx`** (1 modificación, +1 / -1 línea):

```diff
-      "Aproximadamente entre 3 y 5 envíos por semana, distribuidos entre análisis profundos, notas breves y comentarios de coyuntura. Si te parece mucho, podrás configurar un resumen semanal una vez activemos el proveedor.",
+      "El boletín tiene cadencia quincenal: dos envíos al mes que agrupan los análisis publicados en ese periodo. Sin spam, sin paywalls.",
```

**`components/sections/Newsletter.tsx`**: confirmado intacto por
`git status` post-commit (no aparece en archivos modificados; la
declaración "Boletín quincenal" en línea 18 es preexistente).

**Verificación post-cambio**:

```bash
grep -rniE "quincenal|3-5 por semana|3 y 5 envíos" \
  --include="*.tsx" --include="*.ts" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git \
  --exclude-dir=docs
# → exactamente 3 matches de "quincenal":
#   - components/sections/Newsletter.tsx:18 (preexistente)
#   - components/boletin/Formatos.tsx:72 (nuevo)
#   - components/boletin/Preguntas.tsx:24 (nuevo)
# → cero matches de "3-5 por semana" o "3 y 5 envíos"
```

### Cambio 3 — Hallazgo 5 (commit `f17520e`)

**Archivo**: `components/sections/Publicaciones.tsx`.

**Naturaleza**: refactor. -66 / +36 líneas netas. El JSX visual
(header, grid de cards, link envolviendo cada card, styling) se
mantiene idéntico; solo cambia la fuente de datos y el mapeo.

**Cambios estructurales**:

- Tipo local `Publicacion` eliminado (los datos ahora vienen del tipo
  `Publication` del loader).
- Array hardcoded `const publicaciones: Publicacion[]` (incluyendo la
  card inexistente "Nuevo León supera a la CDMX") eliminado.
- Imports nuevos: `getAllPublications` (`@/lib/publicaciones/loader`),
  `getCategoryBySlug` (`@/lib/publicaciones/categories`),
  `formatDateShort` (`@/lib/publicaciones/format`).
- Componente convertido de `export function Publicaciones()` a
  `export async function Publicaciones()`.
- Body del componente arranca con: `const all = await getAllPublications();
  const items = all.slice(0, 3);` (el loader ya retorna ordenadas por
  `publishedAt` desc).
- Mapeo dentro del `<ul>` consume `items` (no `publicaciones`); cada
  card resuelve `categoryLabel` vía `getCategoryBySlug(pub.category)?.label ?? pub.category`, `href` vía `` `/publicaciones/${pub.slug}` ``,
  fecha vía `formatDateShort(pub.publishedAt)`, reading time vía
  `` `${pub.readingTime} min` ``.

**Estado post-refactor predicho** (las 3 cards que el home renderizará):

| # | Slug | Título | Categoría visible | Fecha | href |
|---|---|---|---|---|---|
| 1 | `servidores-publicos-cdmx` | "Servidores públicos de la Ciudad de México: una primera lectura" | "Mercado laboral" | "4 mayo 2026" | `/publicaciones/servidores-publicos-cdmx` |
| 2 | `sar-recursos-administrados` | "El SAR mexicano administra más de diez billones de pesos: composición y AFOREs" | "Pensiones y ahorro para el retiro" | "4 mayo 2026" | `/publicaciones/sar-recursos-administrados` |
| 3 | `hogares-mexicanos-enigh-2024` | "Hogares mexicanos en 2024: ingreso, gasto y desigualdad por decil" | "Hogares y bienestar" | "4 mayo 2026" | `/publicaciones/hogares-mexicanos-enigh-2024` |

(Las 3 tienen el mismo `publishedAt: "2026-05-04"`; el orden final
depende del orden estable del registry — servidores → sar → hogares.)

**Verificación post-cambio**:

```bash
grep -n "getAllPublications\|Nuevo León" components/sections/Publicaciones.tsx
# → 1 match de getAllPublications (import + uso); cero matches de "Nuevo León"

npm run build
# → ✓ Compiled successfully in 2.9s
# → ✓ Finished TypeScript in 3.4s
# → ✓ Generating static pages using 9 workers (20/20) in 251ms
# → Home `/` sigue siendo `○ (Static)` — getAllPublications() resuelve
#   en build-time, prerenderizado correctamente.
```

---

## Sección 3 — Deudas registradas (sin actuar en esta fase)

### Deuda 1 — `/manifiesto` y `/equipo` 404

**Estado**: las rutas `/manifiesto` y `/equipo` devuelven 404 en
producción. El inventario de FASE 1 + la micro-auditoría empírica
verificaron que **no están promocionadas**: cero links activos en
código (`grep` cero matches sobre `href="/manifiesto"`, `href="/equipo"`),
cero hrefs en el HTML servido por el home, cero entradas en
`/sitemap.xml`. La única ocurrencia del literal `"manifiesto"` en el
código es en `components/metodologia/Hero.tsx:11` como **negación
retórica** ("No es un manifiesto: es la especificación operativa…"),
no como link. La palabra `equipo` aparece como label y anchor
`#equipo` dentro de `/quienes-somos`, no como ruta.

**Urgencia académica**: baja. El sitio no promete rutas que no
entrega.

**Cleanup opcional futuro**: o (a) crear las rutas con contenido
coherente con Camino C, o (b) no hacer nada (las rutas son
inalcanzables desde el sitio, sólo aparecerían si alguien tipeara la
URL directamente).

### Deuda 2 — Auditoría de cobertura SDK vs backend

**Origen**: el "78 endpoints" original del sitio era cifra correcta en
el momento de escritura. El backend creció a **114 operaciones** con
FASE 2 del backend (commit `d1c5012` en `DabtcAvila/datos-itam`). La
cifra exacta de cobertura actual del SDK Python (¿cuántas de las 114
operaciones expone el SDK?) **no se verificó empíricamente** en esta
fase por restricción ("no clonar otros repos del observatorio
localmente").

**Estado**: cerrada operativamente en este frente — la reescritura de
prosa a "todos los endpoints públicos" elimina la dependencia del sitio
canónico sobre la cifra exacta. El sitio ya no comete promesa numérica.

**Trabajo futuro opcional**: si en algún momento el observatorio quiere
comprometer cifra exacta de cobertura (por ejemplo, para una nota
metodológica o un kit de prensa que mencione "el SDK cubre N de M
endpoints públicos"), corresponde verificar empíricamente en una
sesión sobre `Datos-Mexico/datos-mexico-py` cuál es la cifra correcta.

### Deuda 3 — `DashboardStats` 22 campos vs 31 reales del schema live

**Origen**: el inventario de FASE 1 detectó que `lib/api/types.ts`
declara `DashboardStats` con 22 campos, mientras que el schema live
del backend (`/openapi.json` de `api.datos-itam.org`) exige 31. Faltan
9 campos: `genderGapBySector`, `topPositions`, `seniorityDistribution`,
`salaryBySeniority`, `avgSeniority`, `avgNetSalary`, `avgDeduction`,
`avgDeductionPercent`, `brutoNetoByRange`.

**Estado**: no rompe runtime — el sitio sólo consume el subset de los
22 campos declarados; TypeScript no exige los 9 faltantes porque la
declaración manual del tipo es subset válido. Los componentes del
sitio (`components/publicaciones/Visualization.tsx`,
`components/sections/pulso/PulsoHero.tsx`, etc.) leen sólo campos
declarados.

**Trabajo futuro opcional**: si en el futuro se decide consumir alguno
de los 9 campos del API post-FASE-2 (por ejemplo, `seniorityDistribution`
podría alimentar una visualización nueva en la publicación de
servidores CDMX), corresponde o (a) actualizar manualmente el tipo en
`lib/api/types.ts`, o (b) adoptar generación automática de tipos desde
OpenAPI (e.g. `openapi-typescript`, `orval`, generación custom). La
opción (b) es disciplina académica equivalente al snapshot del SDK
Python.

### Deuda 4 — README del repo desactualizado

**Origen**: el `README.md` declara como 404 cuatro rutas que **hoy
responden 200**:
- `/quienes-somos` (responde 200; `page.tsx` completa con 9 componentes)
- `/publicaciones` (responde 200; paginación funcional)
- `/metodologia` (responde 200; 7 secciones renderizadas)
- `/contacto` (responde 200; 5 componentes)

El bloque del README dice literal: *"Páginas: `/quienes-somos`,
`/publicaciones`, `/metodologia`, `/contacto` — devuelven 404 (links
en nav, sin implementar)"*. La sección "Lo que NO está hecho
(intencionalmente)" repite la lista.

**Estado**: deuda menor de documentación. El README es accesible a
nivel repo (público) y a contribuidores potenciales, no es contenido
del sitio servido al usuario final.

**Cleanup futuro trivial**: actualizar el README para reflejar que
las 4 rutas existen y describir brevemente qué contiene cada una.

### Deuda 5 — Sin CI/CD ni tests automatizados

**Origen**: el repo no tiene `.github/` (cero workflows de GitHub
Actions). El único typecheck implícito es el que `next build` ejecuta
con `strict: true` antes de cada deploy de Cloudflare Workers Builds.
No hay tests (`*.test.*`, `*.spec.*`), ni configuración de Jest /
Vitest / Playwright. No hay script `test` en `package.json`.

**Disciplina equivalente**: análoga a "pytest sin CI" del backend
(que sí tiene tests pero no los corre automáticamente en cada push).

**Trabajo futuro opcional para fase de disciplina operacional**:
- Workflow de typecheck (`tsc --noEmit`) en cada PR.
- Workflow de lint (`eslint`) en cada PR.
- Workflow de build verification (`next build` o
  `opennextjs-cloudflare build`) en cada PR.
- Tests E2E mínimos sobre las rutas críticas (`/`, `/publicaciones`,
  `/metodologia`, `/quienes-somos`) — Playwright sería suficiente.
- Workflow de drift detection contra el API backend: descargar
  `/openapi.json`, comparar contra los types declarados en
  `lib/api/types.ts`, fallar el PR si hay divergencia no documentada.

---

## Sección 4 — Verificaciones globales

### 4.1 Build verde

```bash
npm run build
# → ✓ Compiled successfully in 2.9s
# → ✓ Finished TypeScript in 3.4s
# → ✓ Generating static pages using 9 workers (20/20) in 251ms
```

Rutas generadas (20 totales):

- 12× `○ (Static)` prerenderizadas: `/`, `/_not-found`, `/boletin`,
  `/contacto`, `/dash-mapa01`, `/metodologia`, `/prensa`,
  `/quienes-somos`, `/robots.txt`, `/sitemap.xml`, `/styleguide`,
  `/feed.xml`.
- 6× `● (SSG)` prerenderizadas con `generateStaticParams`: las 3
  publicaciones individuales (`/publicaciones/servidores-publicos-cdmx`,
  `/publicaciones/sar-recursos-administrados`,
  `/publicaciones/hogares-mexicanos-enigh-2024`) + las 3 páginas de
  categoría (`/publicaciones/categoria/mercado-laboral`,
  `/publicaciones/categoria/pensiones`,
  `/publicaciones/categoria/hogares-bienestar`).
- 1× `ƒ (Dynamic)`: `/publicaciones` (paginación via `searchParams`).

El home `/` permanece estático tras el refactor del componente
`Publicaciones` a async server component — `getAllPublications()`
resuelve en build-time desde el registry estático, sin generar
demanda runtime.

### 4.2 Grep verificadores

**H2 — sin cifra "78"** en el componente corregido:

```bash
grep -n "78" components/metodologia/AccesoProgramatico.tsx
# → EXIT 1 (cero matches)
```

**H4 — cadencia "quincenal" coherente, sin restos de "3-5 por semana"**:

```bash
grep -rniE "quincenal|3-5 por semana|3 y 5 envíos" \
  --include="*.tsx" --include="*.ts" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git \
  --exclude-dir=docs
# → 3 matches de "quincenal" (Newsletter.tsx:18, Formatos.tsx:72, Preguntas.tsx:24)
# → cero matches de "3-5 por semana" o "3 y 5 envíos"
```

**H5 — sin restos del array hardcoded ni de "Nuevo León"**:

```bash
grep -n "Nuevo León\|publicaciones: Publicacion" components/sections/Publicaciones.tsx
# → EXIT 1 (cero matches)
grep -n "getAllPublications" components/sections/Publicaciones.tsx
# → 2 matches: import en línea 5, uso en línea 10
```

### 4.3 Smoke checks contra producción (Sub-fase 2.7, post-merge)

A ejecutar tras el merge del PR y completar el redeploy de Cloudflare
Workers Builds (~60–90 segundos):

```bash
# /metodologia: prosa nueva
curl -sS https://datosmexico.org/metodologia | grep -oE "todos los endpoints públicos|los 78 endpoints públicos"
# Esperado: "todos los endpoints públicos"; NO "los 78 endpoints públicos"

# /boletin: cadencia quincenal en FAQ
curl -sS https://datosmexico.org/boletin | grep -oE "cadencia quincenal|3 y 5 envíos por semana"
# Esperado: "cadencia quincenal"; NO "3 y 5 envíos por semana"

# / (home): título real de publicación
curl -sS https://datosmexico.org/ | grep -oE "Servidores públicos de la Ciudad de México"
# Esperado: match (no inventado)

# Confirmar que no aparece la card de Nuevo León
curl -sS https://datosmexico.org/ | grep -i "Nuevo León"
# Esperado: cero matches en sección Publicaciones
```

---

## Commits de esta fase

| # | Commit | Subject |
|---|---|---|
| 1 | `51ee951` | docs(audit/fase-2-sitio): plan de ejecución de correcciones validadas |
| 2 | `20c0889` | docs(metodologia): corregir publicidad falsa de '78 endpoints' a 'todos los endpoints públicos' |
| 3 | `2a82b3f` | docs(boletin): alinear cadencia declarada a quincenal en Formatos y FAQ |
| 4 | `f17520e` | feat(sections/Publicaciones): auto-sincronizar cards del home con getAllPublications |
| 5 | (este reporte) | docs(audit/fase-2-sitio): reporte de cierre + 5 deudas registradas |
