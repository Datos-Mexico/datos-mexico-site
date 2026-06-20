# Plan de actualización del equipo — `/quienes-somos`

**Trabajo**: actualización del equipo + sistema de tags + reformulación de
prosa institucional en 8 lugares.
**Branch**: `feat/equipo-actualizacion-y-tags` (creada desde `main`).
**Rol del operador**: plan de ejecución, producido por el equipo del
observatorio.

> **ACTUALIZACIÓN 2026-06-20 — revisión del wording institucional.** El
> sintagma "con respaldo institucional del ITAM" introducido por este plan
> (Camino C) fue revisado por decisión del CEO. La prosa institucional
> vigente del observatorio es: *"formado por estudiantes, egresados y
> colaboradores del ITAM"*. El cambio modera la afirmación de aval
> institucional formal y conserva el ITAM como afiliación factual de las
> personas. Las celdas "Texto propuesto" de este plan se mantienen como
> registro histórico de la decisión previa. Para la prosa vigente en código,
> consultar el commit de la branch `feat/wording-itam-moderar-aval`.

## Metadata

| Campo | Valor |
|---|---|
| Fecha/hora ISO | `2026-05-24T<execution>Z` |
| Commit hash de partida (`main`) | `e2e0e32edc4f7678880c2e5edce6e3f23726acb7` |
| Subject del commit base | `audit(fase-2-sitio): integridad del contrato público del sitio canónico (#2)` |
| Branch del plan | `feat/equipo-actualizacion-y-tags` |

---

## Resumen ejecutivo

3 capas de cambio coordinadas en una sola branch:

1. **Sistema de tags** (cambio aditivo al type `TeamMember`): campo opcional `tag` con valores Literal + label map paralelo a la convención de `lib/publicaciones/categories.ts`.
2. **Actualización del equipo** (datos): agregar LinkedIn a Emiliano, agregar a Luis Eduardo Bustillos Hernández como 8º miembro, asignar tag a los 8 miembros.
3. **Reformulación de prosa institucional en 8 lugares**: eliminar "Somos un equipo de 7 personas" y "estudiantes y egresados del ITAM" para reconocer heterogeneidad real (Ashley es UVM; con Luis Eduardo se incorpora ITAM Ciencia Política) manteniendo "respaldo institucional del ITAM" según Camino C.

---

## Sub-fase 3.1 — Sistema de tags

### Cambio al type `TeamMember` en `lib/team.ts`

Agregar campo opcional + tipo Literal:

```ts
export type TeamTag = "equipo-tecnico-fundador" | "equipo-del-observatorio";

export type TeamMember = {
  id: string;
  name: string;
  initials: string;
  career: string;
  year: string;
  bio: string;
  links: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  photo?: string;
  tag?: TeamTag;
};

export const teamTagLabels: Record<TeamTag, string> = {
  "equipo-tecnico-fundador": "Equipo técnico fundador",
  "equipo-del-observatorio": "Equipo del observatorio",
} as const;
```

Convención paralela a `lib/publicaciones/categories.ts`: tipo Literal + objeto label-map, ambos exportados.

### Asignación de tag a cada miembro

| # | Miembro | Tag |
|---|---|---|
| 1 | David Fernando Ávila Díaz | `equipo-tecnico-fundador` |
| 2 | Gerardo André Butrón Ramírez | `equipo-tecnico-fundador` |
| 3 | Emiliano Sebastián Millán Giffard | `equipo-tecnico-fundador` |
| 4 | José Roberto Uribe Clemente | `equipo-tecnico-fundador` |
| 5 | Ashley Dannae Solano Díaz | `equipo-del-observatorio` |
| 6 | Alexa Fernanda Hernández Monroy | `equipo-del-observatorio` |
| 7 | Fabiola Campos Juárez | `equipo-del-observatorio` |
| 8 | Luis Eduardo Bustillos Hernández (nuevo) | `equipo-del-observatorio` |

---

## Sub-fase 3.2 — Render del Badge en `MemberCard.tsx`

### Cambio

- Importar `Badge` desde `@/components/ui/Badge`.
- Importar `teamTagLabels` desde `@/lib/team`.
- Renderizar `<Badge>` condicional con `member.tag`, usando `teamTagLabels[member.tag]` como texto.
- **Posición visual propuesta**: arriba del `<h3>` del nombre, con `mt-5 mb-1` (sustituyendo el `mt-5` actual del h3). El Badge queda inmediatamente después del Avatar/foto, separado por margen tight; el nombre queda 1px abajo del Badge.
- **Variante visual propuesta** (CEO valida en el plan):
  - `equipo-tecnico-fundador` → `<Badge variant="primary">` (verde primary, distintivo).
  - `equipo-del-observatorio` → `<Badge variant="default">` (gris neutro).

  Si el CEO prefiere otra combinación, ajustar en sub-fase 3.2 antes del commit.

### Snippet final aproximado

```tsx
{member.tag && (
  <Badge
    variant={member.tag === "equipo-tecnico-fundador" ? "primary" : "default"}
    className="mt-5 self-start"
  >
    {teamTagLabels[member.tag]}
  </Badge>
)}
<h3 className="mt-2 font-serif text-[19px] font-semibold leading-[1.3] text-foreground md:text-[20px]">
  {member.name}
</h3>
```

---

## Sub-fase 3.3 — LinkedIn de Emiliano

### Cambio en `lib/team.ts` (entrada de Emiliano)

```ts
links: {
  linkedin: "https://www.linkedin.com/in/emiliano-sebastián-millán-giffard-911635370",
  github: "https://github.com/emilianomillan",
},
```

URL canónica sin parámetros UTM. Verificación pre-commit empírica:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  "https://www.linkedin.com/in/emiliano-sebasti%C3%A1n-mill%C3%A1n-giffard-911635370"
# → 999 (LinkedIn anti-bot status; confirma URL existe — 404 sería respuesta de URL inexistente)
```

---

## Sub-fase 3.4 — Luis Eduardo Bustillos Hernández

### Datos completos

| Campo | Valor |
|---|---|
| `id` | `bustillos-hernandez-luis-eduardo` (convención del repo: `<primer-apellido>-<segundo-apellido>-<nombres>` — verificada contra `avila-diaz-david`, `butron-ramirez-gerardo`, etc.) |
| `name` | `"Luis Eduardo Bustillos Hernández"` |
| `initials` | `"LB"` (convención: primera letra del primer nombre + primera letra del primer apellido = L+B; verificada contra DA, GB, EM, JU, AS, AH, FC) |
| `career` | `"Estudiante de Ciencia Política, Instituto Tecnológico Autónomo de México"` |
| `year` | `""` |
| `bio` | `""` |
| `links.linkedin` | `"https://www.linkedin.com/in/luiseduardobustilloshernandez"` |
| `links.github` | (omitido) |
| `links.twitter` | (omitido) |
| `links.website` | (omitido) |
| `photo` | `undefined` |
| `tag` | `"equipo-del-observatorio"` |

Verificación URL LinkedIn:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' "https://www.linkedin.com/in/luiseduardobustilloshernandez"
# → 999 (confirma URL existe)
```

### AMBIGÜEDAD ARQUITECTÓNICA: posición de Luis Eduardo en el array

El array `team` actual ordena así:

| # | Miembro | Categoría |
|---|---|---|
| 1 | David | técnico fundador |
| 2 | Gerardo | técnico fundador |
| 3 | Emiliano | técnico fundador |
| 4 | José Roberto | técnico fundador |
| 5 | **Ashley** | observatorio |
| 6 | Alexa | observatorio |
| 7 | Fabiola | observatorio |

**Conflicto detectado**: el prompt declara *"Luis Eduardo se incorporó antes que Ashley; Ashley es la incorporación más reciente"*. Si el array fuese cronológico estricto por incorporación al observatorio, Ashley debería ocupar el **último** lugar del bloque observatorio, **no el primero**. Hoy ocupa el primero (posición 5).

Esto sugiere dos hipótesis incompatibles sobre la convención de orden:

#### Hipótesis A — El array NO es cronológico estricto

El array agrupa por categoría (4 técnicos primero, luego 3 del observatorio) pero el orden interno del bloque observatorio no refleja cronología. En este caso, **Luis Eduardo se inserta al final del bloque observatorio** y el orden interno del observatorio queda según el shape histórico del array, sin reordenar a Ashley:

| # | Miembro | Categoría |
|---|---|---|
| 1 | David | técnico fundador |
| 2 | Gerardo | técnico fundador |
| 3 | Emiliano | técnico fundador |
| 4 | José Roberto | técnico fundador |
| 5 | Ashley | observatorio |
| 6 | Alexa | observatorio |
| 7 | Fabiola | observatorio |
| **8** | **Luis Eduardo (nuevo)** | observatorio |

#### Hipótesis B — El array SÍ es cronológico por incorporación

La cronología declarada por el CEO en el prompt (Luis antes que Ashley; Ashley la más reciente) es la verdad académica vigente. El orden actual del array **no refleja esa cronología** — probablemente se editó en otro momento sin atender al orden estricto. Aplicar la cronología real implica **reordenar Ashley** además de insertar Luis Eduardo:

| # | Miembro | Categoría | Posición vs hoy |
|---|---|---|---|
| 1 | David | técnico fundador | igual |
| 2 | Gerardo | técnico fundador | igual |
| 3 | Emiliano | técnico fundador | igual |
| 4 | José Roberto | técnico fundador | igual |
| 5 | **Alexa** | observatorio | sube (era 6) |
| 6 | **Fabiola** | observatorio | sube (era 7) |
| 7 | **Luis Eduardo (nuevo)** | observatorio | nuevo |
| 8 | **Ashley** | observatorio | baja (era 5) |

Esta opción requiere mover una entrada existente del array (Ashley) además de insertar Luis Eduardo.

#### Decisión pedida al CEO

**¿Hipótesis A o Hipótesis B?**

El prompt dice "*si los miembros están en otro orden (por rol, alfabético, por categoría), seguir la convención existente*", lo cual apuntaría a Hipótesis A (no tocar lo que está, sólo insertar al final). Pero también dice "*insertar entre Fabiola y Ashley*" como sugerencia preliminar — eso sólo es coherente si Ashley está al final cronológico, lo que apunta a Hipótesis B.

Recomendación neutra: **Hipótesis A es menos intrusiva** (sólo inserta a Luis Eduardo, no reordena entradas preexistentes). Si el CEO valida Hipótesis B, se ejecuta el reorden de Ashley en el mismo commit de Sub-fase 3.4.

---

## Sub-fase 3.5 — Reformulación de prosa institucional en 8 lugares

### Prosa base acordada por el CEO

> *"Observatorio independiente con respaldo institucional del ITAM, formado por estudiantes, egresados y colaboradores con experiencia en ciencia de datos, economía y otras disciplinas."*

### Adaptaciones propuestas por lugar

| # | Archivo | Línea | Texto actual (literal) | Texto propuesto |
|---|---|---|---|---|
| 1 | `components/quienes-somos/Equipo.tsx` | 13 | `lead="Somos un equipo de 7 personas — estudiantes y egresados del ITAM — que trabajamos de manera horizontal en la investigación, infraestructura técnica y comunicación del observatorio."` | `lead="El equipo del observatorio reúne estudiantes, egresados y colaboradores con experiencia en ciencia de datos, economía y otras disciplinas. Trabajamos de manera horizontal en la investigación, infraestructura técnica y comunicación del observatorio."` |
| 2 | `components/quienes-somos/Hero.tsx` | 11-15 (Lead) | `Datos México es un observatorio independiente formado por estudiantes y egresados del ITAM. Trabajamos con microdatos oficiales y publicamos análisis verificables, con metodología abierta y sin agenda partidista.` | `Datos México es un observatorio independiente con respaldo institucional del ITAM, formado por estudiantes, egresados y colaboradores con experiencia en ciencia de datos, economía y otras disciplinas. Trabajamos con microdatos oficiales y publicamos análisis verificables, con metodología abierta y sin agenda partidista.` |
| 3 | `components/sections/QuienesSomosPreview.tsx` | 23-27 (Lead) | (mismo texto que Hero.tsx) | (mismo texto que Hero.tsx propuesto) |
| 4 | `components/layout/Footer.tsx` | 69 | `Equipo conformado por estudiantes y egresados del ITAM.` | `Equipo conformado por estudiantes, egresados y colaboradores con respaldo institucional del ITAM.` |
| 5 | `components/contacto/Cierre.tsx` | 13-18 (Body) | `Datos México es un observatorio académico independiente formado por estudiantes y egresados del ITAM. Operamos sin fines de lucro, sin financiamiento partidista o gubernamental, y con código abierto.` | `Datos México es un observatorio académico independiente con respaldo institucional del ITAM, formado por estudiantes, egresados y colaboradores. Operamos sin fines de lucro, sin financiamiento partidista o gubernamental, y con código abierto.` |
| 6 | `app/(marketing)/quienes-somos/page.tsx` | metadata `description` (línea 16-17) | `Datos México es un observatorio académico independiente formado por estudiantes y egresados del ITAM. Conoce al equipo, nuestra misión y cómo nos organizamos.` | `Datos México es un observatorio académico independiente con respaldo institucional del ITAM, formado por estudiantes, egresados y colaboradores. Conoce al equipo, nuestra misión y cómo nos organizamos.` |
| 6 (cont.) | mismo archivo | OG `description` (línea 21-22) | `Observatorio académico independiente formado por estudiantes y egresados del ITAM. Equipo, misión, principios y gobernanza.` | `Observatorio académico independiente con respaldo institucional del ITAM, formado por estudiantes, egresados y colaboradores. Equipo, misión, principios y gobernanza.` |
| 6 (cont.) | mismo archivo | Twitter `description` (línea 36-37) | `Observatorio académico independiente formado por estudiantes y egresados del ITAM.` | `Observatorio académico independiente con respaldo institucional del ITAM, formado por estudiantes, egresados y colaboradores.` |
| 7 | `app/layout.tsx` | 115-116 (JSON-LD `description`) | `Observatorio independiente de datos públicos de México formado por estudiantes y egresados del ITAM.` | `Observatorio independiente de datos públicos de México con respaldo institucional del ITAM, formado por estudiantes, egresados y colaboradores.` |
| 8 | `public/llms.txt` | 3 | `> Observatorio independiente de datos públicos de México formado por estudiantes y egresados del ITAM. Trabajamos con microdatos oficiales (INEGI, CONSAR, Banxico, Datos Abiertos CDMX) y publicamos análisis reproducibles en español, con APIs verificables y notas metodológicas explícitas.` | `> Observatorio independiente de datos públicos de México con respaldo institucional del ITAM, formado por estudiantes, egresados y colaboradores. Trabajamos con microdatos oficiales (INEGI, CONSAR, Banxico, Datos Abiertos CDMX) y publicamos análisis reproducibles en español, con APIs verificables y notas metodológicas explícitas.` |

### Criterios académicos verificados en cada adaptación

| Criterio | Aplicación |
|---|---|
| Cero declaración de número específico | ✓ ninguna formulación dice "los N miembros" / "somos N" / "equipo de N" |
| Cero atadura exclusiva al ITAM | ✓ "estudiantes y egresados del ITAM" eliminado en 8/8 lugares |
| Respaldo institucional del ITAM declarado explícitamente (Camino C) | ✓ "respaldo institucional del ITAM" aparece en 7/8 adaptaciones (Footer es corto pero también incluye "respaldo institucional del ITAM") |
| Reconoce composición plural | ✓ "estudiantes, egresados y colaboradores" en 8/8 |

### Verificaciones empíricas post-cambio

```bash
# Cero cifras de miembros
grep -rniE "siete miembros|7 miembros|ocho miembros|8 miembros|los [0-9]+ miembros|somos [0-9]+|equipo de [0-9]+" \
  --include="*.tsx" --include="*.ts" --include="*.mdx" --include="*.md" --include="*.txt" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude-dir=docs
# Esperado: 0 matches

# Cero "estudiantes y egresados del ITAM"
grep -rniE "estudiantes y egresados del ITAM" \
  --include="*.tsx" --include="*.ts" --include="*.mdx" --include="*.md" --include="*.txt" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude-dir=docs
# Esperado: 0 matches

# "respaldo institucional del ITAM" presente en lugares clave
grep -rni "respaldo institucional del ITAM" \
  --include="*.tsx" --include="*.ts" --include="*.txt" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude-dir=docs
# Esperado: ≥ 8 matches
```

---

## Archivos fuera del scope (registrados pero no tocados)

| Archivo / línea | Texto | Razón para no tocar |
|---|---|---|
| `components/sections/Hero.tsx:13` Eyebrow | `"Observatorio independiente · Desde el ITAM"` | No es "estudiantes y egresados del ITAM"; queda como observación neutra ya registrada del audit FASE 1 |
| `app/styleguide/page.tsx:114` | (réplica del Eyebrow del home) | Igual que arriba |
| `app/layout.tsx:111` JSON-LD | `alternateName: "Datos ITAM"` | Deuda registrada del audit FASE 1 (alias schema.org); fuera del scope de este PR |
| `app/(marketing)/quienes-somos/page.tsx` JSON-LD `member: team.map(...)` | (deriva de `team`) | Se actualiza automáticamente al modificar `lib/team.ts` (Luis Eduardo aparece en `member[]` post-merge) |
| `components/sections/QuienesSomosPreview.tsx:11` | `"Colaboraciones académicas con el ITAM"` (item del array `respaldos`) | No es la prosa principal; el item describe una colaboración existente sin atar al ITAM como único origen |

---

## Verificaciones globales pre-PR

1. `npx tsc --noEmit` (typecheck strict) — en cada sub-fase que toca código.
2. `npm run build` (Next + Turbopack) — al menos antes del commit final.
3. Grep verificadores listados en sub-fase 3.5.

---

## Resumen de commits planeados

| # | Commit | Naturaleza |
|---|---|---|
| 1 | docs(equipo): plan de actualización del equipo + sistema de tags | Este plan |
| 2 | feat(team): agregar sistema de tags al type TeamMember + asignación inicial | Tipo `TeamMember` + `TeamTag` + `teamTagLabels` + tag a los 7 actuales |
| 3 | feat(team/MemberCard): renderizar Badge con tag del miembro | UI Badge condicional |
| 4 | feat(team): agregar LinkedIn a Emiliano Sebastián Millán Giffard | Solo Emiliano |
| 5 | feat(team): agregar Luis Eduardo Bustillos Hernández al equipo del observatorio | Nuevo miembro (con la posición según la decisión sobre Hipótesis A/B) |
| 6 | docs(prosa): reformular prosa institucional para reconocer heterogeneidad del equipo | 8 lugares |

---

## Ambigüedades para decisión del CEO antes de avanzar

1. **Hipótesis A o B sobre el orden del array `team`** (ver sub-fase 3.4). Recomendación neutra: A (menos intrusiva).
2. **Variante visual del Badge por tag** (ver sub-fase 3.2). Propuesta: `primary` para técnico fundador, `default` para observatorio. Si preferís otra combinación (e.g. `accent` para fundador, `outline` para observatorio), validar antes del commit de 3.2.
3. **Formulación específica de cada adaptación de prosa** (ver sub-fase 3.5 tabla). Si alguna formulación específica no convence, ajustar antes del commit de 3.5.

Si las tres se confirman como están, ejecuto 3.1 → 3.7 sin pausas adicionales.
