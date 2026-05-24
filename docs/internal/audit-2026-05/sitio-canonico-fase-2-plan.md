# FASE 2 sitio canónico — Plan de ejecución

**Frente:** sitio canónico (`datosmexico.org`)
**Repo:** `Datos-Mexico/datos-mexico-site`
**Fase:** FASE 2 — Integridad del contrato público.
**Branch:** `audit/sitio-canonico-fase-2-correcciones` (creada desde `main`).
**Rol del operador:** plan de ejecución de correcciones validadas, producido
por el equipo técnico del observatorio.

## Metadata

| Campo | Valor |
|---|---|
| Fecha/hora ISO | `2026-05-24T<execution>Z` |
| Commit hash de partida (`main`) | `0a72c6beb081436c20e2c705d43f9fcdbf113019` |
| Branch del plan | `audit/sitio-canonico-fase-2-correcciones` |
| Subject del commit base | `audit(sitio-canonico): inventario empírico exhaustivo del frente sitio canónico (#1)` |

## Resumen ejecutivo

Esta FASE 2 aplica 3 correcciones técnicas validadas empíricamente por la
micro-auditoría académica de los Hallazgos 2/4/5 categorizados como
publicidad falsa del producto. Las 4 deudas restantes (Hallazgos 1/3/6/7
+ subcaso 2 bis) se registran como deudas para futura fase, sin tocarse.

Sub-fase | Decisión | Archivos | Naturaleza del cambio
---|---|---|---
2.1 | Decisión 1 (H2) | `components/metodologia/AccesoProgramatico.tsx` | reemplazo de 4 palabras en prosa
2.2 | Decisión 3 (H4) | `components/boletin/Formatos.tsx`, `components/boletin/Preguntas.tsx` | reescritura de prosa + remoción de campo `cadencia`
2.3 | Decisión 4 (H5) | `components/sections/Publicaciones.tsx` | refactor de array hardcoded → async server component que consume `getAllPublications()`

`components/sections/Newsletter.tsx` **no se toca** (Decisión 3 declara
que la cadencia "quincenal" en el home es la correcta).

---

## Sub-fase 2.1 — Hallazgo 2: "78 endpoints" → "todos los endpoints públicos"

### Archivo

`components/metodologia/AccesoProgramatico.tsx`

### Confirmación empírica del estado actual

`AccesoProgramatico.tsx:10` (literal, single match para `"78"` en el archivo):

```tsx
lead="Publicamos un cliente Python oficial (datos-mexico) que da acceso a la lectura pública del API completa. El cliente cubre los 78 endpoints públicos con tipos validados, caché integrado y manejo robusto de errores."
```

### Cambio mínimo a aplicar

| Antes | Después |
|---|---|
| `El cliente cubre los 78 endpoints públicos` | `El cliente cubre todos los endpoints públicos` |

Cambio de 4 palabras (`los 78 endpoints públicos` → `todos los endpoints públicos`). Sin tocar el resto de la oración, sin tocar otros componentes de la página.

### Verificación post-cambio

```bash
grep -n "78" components/metodologia/AccesoProgramatico.tsx
# Esperado: cero matches
grep -n "todos los endpoints públicos" components/metodologia/AccesoProgramatico.tsx
# Esperado: 1 match en línea 10
```

### Commit

```
docs(metodologia): corregir publicidad falsa de '78 endpoints' a 'todos los endpoints públicos'
```

---

## Sub-fase 2.2 — Hallazgo 4: alinear cadencia del boletín a quincenal

### Decisión institucional (CEO)

Cadencia comprometida públicamente: **quincenal** (~26 envíos/año).
Compromiso conservador y sostenible; revisable cuando el equipo demuestre
capacidad de cadencia mayor con evidencia.

### Archivo intacto

`components/sections/Newsletter.tsx` — ya declara "Boletín quincenal con
los últimos análisis del observatorio. Sin spam, sin paywalls." Verificado
mediante `cat`. **Sin cambios**.

### Archivo 1 — `components/boletin/Formatos.tsx`

#### Estado actual

- Array `formatos` (líneas 6-37) con tres entradas, cada una con campos
  `icon`, `title`, `description`, **`cadencia`**, `lectura`.
- JSX renderiza por cada formato una `<article>` con `<dl>` que muestra
  dos pares: `Cadencia` (`{f.cadencia}`) y `Lectura` (`{f.lectura}`).
- Prosa de cierre (líneas 81-88):
  > "En conjunto, esto significa aproximadamente entre 3 y 5 envíos por
  > semana. Si prefieres recibir un solo resumen semanal, podrás
  > configurarlo en tus preferencias una vez nos hayas definido un proveedor
  > de boletín. [PENDIENTE: confirmar al elegir proveedor]"

#### Cambios a aplicar

1. **Eliminar el campo `cadencia` del tipo inline del array** y de cada
   una de las 3 entradas. El array queda con `icon`, `title`,
   `description`, `lectura`.
2. **Eliminar el `<div>` "Cadencia"** del `<dl>` dentro del map. La `<dl>`
   queda con un único par `Lectura` (estructuralmente válido).
3. **Reemplazar la prosa de cierre** (incluyendo el `[PENDIENTE]`) por:
   > "El boletín se envía con cadencia quincenal (aproximadamente dos
   > envíos al mes), agrupando los análisis publicados en ese periodo.
   > Sin spam, sin paywalls."

Las 3 entradas (`Análisis profundo`, `Notas breves`, `Comentarios de
coyuntura`) permanecen como **formatos editoriales válidos** del boletín
quincenal — el observatorio sigue publicando esos tres tipos de contenido,
pero ya no se compromete cadencia individual por formato; la cadencia es
agregada (quincenal).

### Archivo 2 — `components/boletin/Preguntas.tsx`

#### Estado actual (líneas 21-25)

```tsx
{
  question: "¿Cada cuánto envían correos?",
  answer:
    "Aproximadamente entre 3 y 5 envíos por semana, distribuidos entre análisis profundos, notas breves y comentarios de coyuntura. Si te parece mucho, podrás configurar un resumen semanal una vez activemos el proveedor.",
},
```

#### Cambio

Reemplazar el campo `answer` por:

```
"El boletín tiene cadencia quincenal: dos envíos al mes que agrupan los análisis publicados en ese periodo. Sin spam, sin paywalls."
```

La pregunta `"¿Cada cuánto envían correos?"` permanece.

### Verificación post-cambio (Sub-fase 2.2)

```bash
grep -rniE "quincenal|3-5 por semana|3 y 5 envíos" \
  --include="*.tsx" --include="*.ts" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git \
  --exclude-dir=docs
```

Esperado:
- `components/sections/Newsletter.tsx`: 1 match de `quincenal` (preexistente, intacto).
- `components/boletin/Formatos.tsx`: 1 match de `quincenal` (nuevo, en prosa de cierre).
- `components/boletin/Preguntas.tsx`: 1 match de `quincenal` (nuevo, en answer del FAQ).
- Cero matches de `3-5 por semana` o `3 y 5 envíos`.

### Commit

```
docs(boletin): alinear cadencia declarada a quincenal en Formatos y FAQ
```

---

## Sub-fase 2.3 — Hallazgo 5: auto-sincronizar Publicaciones.tsx

### Archivo

`components/sections/Publicaciones.tsx`

### Loader real confirmado empíricamente

| Item | Confirmación |
|---|---|
| Loader path | `@/lib/publicaciones/loader` |
| Función a importar | `getAllPublications()` (`async`, retorna `Promise<Publication[]>`) |
| Tipo de retorno | `Publication = PublicationFrontmatter & { filename, content }` |
| Helper de categoría | `getCategoryBySlug(slug: string): Category \| undefined` en `@/lib/publicaciones/categories` |
| Helper de formato de fecha | `formatDateShort(iso: string): string` en `@/lib/publicaciones/format` (devuelve por ej. `"4 mayo 2026"`) |
| Frontmatter MDX | incluye los campos requeridos: `title`, `slug`, `category` (slug), `publishedAt` (ISO), `excerpt`, `readingTime` (number), `dataSource[]`, `status`, opcionales `updatedAt`, `abstract`, `keywords` |
| Patrón usado en el repo | `app/(marketing)/publicaciones/page.tsx`, `app/feed.xml/route.ts`, `app/sitemap.ts`, `app/(marketing)/publicaciones/categoria/[slug]/page.tsx` — todos consumen `getAllPublications()` o `getPublicationsByCategory()` con `await` en async server component / route handler |

**Sin gaps**: todos los datos requeridos para las cards están en el
frontmatter de los 3 MDX existentes. Sin necesidad de fallback inventado,
sin necesidad de pausar al CEO por ambigüedad de shape.

### Mapeo de datos (frontmatter MDX → shape visual de la card)

| Campo de la card (componente actual) | Origen en frontmatter | Transformación |
|---|---|---|
| `category` (texto visible, e.g. "Mercado laboral") | `p.category` (slug, e.g. `"mercado-laboral"`) | `getCategoryBySlug(p.category)?.label ?? p.category` |
| `title` | `p.title` | passthrough |
| `excerpt` | `p.excerpt` | passthrough |
| `date` (texto visible, e.g. "4 mayo 2026") | `p.publishedAt` (ISO) | `formatDateShort(p.publishedAt)` |
| `readingTime` (texto visible, e.g. "8 min") | `p.readingTime` (number) | `` `${p.readingTime} min` `` (formato compacto, coherente con diseño actual del home; **no** se usa `formatReadingTime()` que devuelve "N min de lectura" — más verboso y rompería el layout actual de la card del home) |
| `href` | `/publicaciones/${p.slug}` | construido en mapeo |

### Refactor del componente

1. Convertir `Publicaciones` a `async function Publicaciones()` (Server Component asíncrono — el padre `HomePage` en `app/(marketing)/page.tsx` es Server Component, soporta children async automáticamente por Next.js App Router).
2. Importar `getAllPublications` desde `@/lib/publicaciones/loader`.
3. Importar `getCategoryBySlug` desde `@/lib/publicaciones/categories`.
4. Importar `formatDateShort` desde `@/lib/publicaciones/format`.
5. Eliminar el tipo `Publicacion` y el array hardcoded `publicaciones`.
6. Dentro del cuerpo del componente: `const all = await getAllPublications(); const items = all.slice(0, 3);` (loader ya retorna ordenadas por `publishedAt` desc).
7. Reemplazar `{publicaciones.map((pub) => ...)}` por `{items.map((pub) => ...)}` con el mapeo descrito arriba. Mantener exactamente el mismo JSX visual de cada card.
8. **Mantener intacto el JSX de presentación**: `<section>`, `<Container>`, header con `<H2>Publicaciones recientes.</H2>` + link "Ver todas las publicaciones", `<ul>` grid, link envolviendo cada card, mismo styling de `<Mono>`, `<H3>`, `<Body>`.
9. Si `items.length === 0` (caso degenerate de cero publicaciones publicadas), el `<ul>` queda vacío y el componente sigue renderizando el header. No se agregan estados de placeholder — el repo aún no tiene patrón para "lista vacía" en home, y agregar uno excedería el scope.

### Estado post-refactor (predicción empírica)

Con los 3 MDX vigentes en `content/publicaciones/`, la home mostrará:

| Card # | Slug | Título (de frontmatter) | Categoría visible | Fecha | href |
|---|---|---|---|---|---|
| 1 | `servidores-publicos-cdmx` | "Servidores públicos de la Ciudad de México: una primera lectura" | "Mercado laboral" | "4 mayo 2026" | `/publicaciones/servidores-publicos-cdmx` |
| 2 | `sar-recursos-administrados` | "El SAR mexicano administra más de diez billones de pesos: composición y AFOREs" | "Pensiones y ahorro para el retiro" | "4 mayo 2026" | `/publicaciones/sar-recursos-administrados` |
| 3 | `hogares-mexicanos-enigh-2024` | "Hogares mexicanos en 2024: ingreso, gasto y desigualdad por decil" | "Hogares y bienestar" | "4 mayo 2026" | `/publicaciones/hogares-mexicanos-enigh-2024` |

(Las 3 tienen el mismo `publishedAt: "2026-05-04"`. El `.sort()` del loader
es estable por implementación de V8/Node, así que el orden final depende
del orden en `registry.ts`, que es: servidores → sar → hogares. Ese será el
orden visible.)

### Verificación post-refactor

```bash
# Build verde local:
npm run build
# Esperado: completa sin errores TS ni runtime
```

Inspección del componente refactorizado:

```bash
grep -n "getAllPublications\|hardcoded\|Nuevo León" components/sections/Publicaciones.tsx
# Esperado: 1 match de getAllPublications (import), cero matches de "Nuevo León"
```

### Commit

```
feat(sections/Publicaciones): auto-sincronizar cards del home con getAllPublications
```

---

## Sub-fase 2.4 — Reporte de cierre + deudas

Archivo: `docs/internal/audit-2026-05/sitio-canonico-fase-2-cierre.md`

Cubrirá: 3 correcciones aplicadas + 5 deudas registradas (Hallazgos
1/3/6/7 + subcaso 2 bis del SDK) + verificaciones globales (build verde,
grep verificadores, smoke checks post-merge).

Commit:
```
docs(audit/fase-2-sitio): reporte de cierre + 5 deudas registradas
```

---

## Ambigüedades detectadas

**Una sola observación de bajo riesgo**, no requiere decisión adicional
del CEO antes de ejecutar:

- **`<dl>` con un solo par tras eliminar `cadencia`**: la `<dl>` de cada
  card en `Formatos.tsx` quedará con un único `<div>` (`Lectura`). Es
  HTML semánticamente válido (`<dl>` permite N pares `<dt>/<dd>` con
  N≥1) y CSS-Tailwind seguirá renderizando coherentemente. Si en
  revisión visual el CEO juzga que la `<dl>` de un solo par se ve
  pobre, la decisión de minimización adicional (eliminar la `<dl>`
  entera y dejar sólo `description`) excede esta fase y se trataría
  como deuda menor de UI. Procedo con la opción literalmente prescrita
  por la Decisión 3.

Cero ambigüedades técnicas reales. Cero gaps de shape de datos en
`getAllPublications()`. Loader confirmado funcional contra los 3 MDX
existentes.

---

## Estado post-merge esperado

- Las 3 publicaciones reales aparecen como cards en el home con títulos,
  fechas y categorías correctas.
- La card "Nuevo León supera a la CDMX en ingreso por hogar" (publicación
  inexistente) desaparece del home.
- La página `/metodologia` ya no compromete cifra exacta del SDK.
- La cadencia del boletín es coherente entre el home (`/`) y `/boletin`:
  quincenal.
- `/manifiesto` y `/equipo` siguen devolviendo 404 (deuda registrada, no
  atacada).
- README sigue desactualizado (deuda registrada, no atacada).
- Sin CI/CD ni tests (deuda registrada, no atacada).
- Tipos de `DashboardStats` siguen incompletos vs schema live (deuda
  registrada, no atacada).
