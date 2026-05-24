# Sitio canónico — inventario empírico exhaustivo

**Frente:** sitio canónico (`datosmexico.org`)
**Repo:** `Datos-Mexico/datos-mexico-site`
**Fase:** FASE 1 del frente sitio canónico (Dimensión 14 pendiente desde FASE 1
del backend, mergeada como `19f6a20` en `DabtcAvila/datos-itam` el día previo).
**Rol del operador:** inventario empírico del frente sitio canónico, producido
por el equipo técnico del observatorio.

## Metadata

| Campo | Valor |
|---|---|
| Fecha/hora ISO | `2026-05-23T23:57:09Z` |
| Commit hash de partida (`main`) | `20cfbb6e8052a75bc2eb9c7dabdc37b0e86e3ba6` |
| Branch del reporte | `audit/sitio-canonico-inventario` |
| Node en uso | `v24.4.1` |
| Next.js declarada en `package.json` | `16.2.4` |
| React declarada | `19.2.4` |
| OpenNext adapter declarado | `@opennextjs/cloudflare ^1.19.5` |
| Wrangler en uso | `4.40.3` (update disponible 4.94.0) |
| OS | `Darwin 25.2.0` (macOS) |
| Modo | solo lectura |

Comandos:

```bash
git rev-parse HEAD
# 20cfbb6e8052a75bc2eb9c7dabdc37b0e86e3ba6
node --version    # v24.4.1
date -u +"%Y-%m-%dT%H:%M:%SZ"
```

---

## Resumen ejecutivo

El sitio canónico (`datosmexico.org`) está vivo y todas las rutas reales que
sirve responden `200`. La aplicación corre como **Cloudflare Worker** vía
`@opennextjs/cloudflare`, con `routes.custom_domain = true` apuntando a
`datosmexico.org` y `www.datosmexico.org`. El último deploy registrado en
Cloudflare es del `2026-05-18T16:33:43Z` (alineado con el último commit
`20cfbb6`, "fix(favicon): regenerar con tamaños múltiplos de 48 + cache-bust
v2").

**Sin hallazgos de seguridad bloqueantes.** No se detectaron secrets en el
repo, ni `.env` versionado en historia, ni tokens hardcodeados con los
patrones estándar (`eyJ…`, `sk_live_`, `ghp_`, `AKIA…`, `xoxb-`); el código
del sitio no usa `process.env.*` en absoluto.

**Sin violaciones graves de Camino C en prosa pública.** Toda referencia a
ITAM en el sitio describe (a) la membresía del equipo ("estudiantes y
egresados del ITAM"), (b) acompañamiento académico de profesores del ITAM, o
(c) la historia del observatorio (origen como "Datos ITAM"). No se encontró
ninguna referencia a "ITAM Bases de Datos 2026", "semestre 2026" ni a una
clase o programa específico. La página `/quienes-somos` declara
explícitamente la transición de "Datos ITAM" a "Datos México" y nombra al
observatorio como "independiente" en seis lugares distintos. Sí hay
**observaciones neutras** (D5 §3) sobre algunas formulaciones recurrentes
("Desde el ITAM", `alternateName: "Datos ITAM"` en JSON-LD).

**Hallazgos de coherencia que vale la pena leer**:

1. **Dos rutas anunciadas pero inexistentes (`/manifiesto`, `/equipo`).**
   Ambas responden `404` en producción. Ninguna existe como `page.tsx`
   bajo `app/(marketing)/` y ninguna está en el `sitemap.xml`. La sección
   "Equipo" vive como componente dentro de `/quienes-somos#equipo`. La
   prosa institucional del prompt asumía su existencia.
2. **Drift numérico entre prosa pública del sitio y la realidad del API
   live**: la sección "Acceso programático" de `/metodologia` declara que el
   SDK "cubre los **78 endpoints públicos** con tipos validados", mientras
   que `/openapi.json` expone hoy **114 operaciones** (`get`/`post`/`put`/
   `delete`/`patch`) en 106 paths.
3. **Drift entre tipos manuales (`lib/api/types.ts`) y el schema live de
   `DashboardStats`**: el sitio declara 22 campos; la spec live declara 31
   (faltan 9: `genderGapBySector`, `topPositions`, `seniorityDistribution`,
   `salaryBySeniority`, `avgSeniority`, `avgNetSalary`, `avgDeduction`,
   `avgDeductionPercent`, `brutoNetoByRange`). Como TS no exige los campos
   ausentes y el sitio sólo lee un subconjunto, no rompe runtime — pero la
   superficie tipada queda corta vs el contrato real.
4. **Tres contradicciones sobre cadencia del boletín dentro del propio
   sitio**: `components/sections/Newsletter.tsx` dice "Boletín
   **quincenal**"; `components/boletin/Preguntas.tsx` dice "**3 y 5 envíos
   por semana**"; `components/boletin/Formatos.tsx` dice cadencia "Mensual /
   Semanal / Cuando publica la fuente". Una sola pieza editorial vista con
   tres ritmos distintos.
5. **`components/sections/Publicaciones.tsx` (preview del home) está
   desincronizado con `content/publicaciones/`.** Muestra 3 cards
   hardcodeadas con (a) títulos distintos a los de los `.mdx` reales, (b)
   `href` apuntando todas a `/publicaciones` (no a los slugs) y (c) una
   tercera publicación ("Nuevo León supera a la CDMX…") que **no existe** en
   `content/publicaciones/`.
6. **No hay CI/CD ni tests en este repo.** No existe `.github/`; no hay
   `*.test.*` ni `*.spec.*`, ni configuración de Jest/Vitest/Playwright.
   El auto-deploy declarado en el README es ejecutado por Cloudflare
   Workers Builds, fuera del repo.
7. **Deuda README ya registrada en memoria del observatorio** ("Deuda
   README desactualizado"): el `README.md` lista
   `/quienes-somos /publicaciones /metodologia /contacto` como rutas que
   "devuelven 404 (links en nav, sin implementar)". Las cuatro responden
   `200` hoy, con su `page.tsx` correspondiente y sus componentes
   completos. La sección "Lo que NO está hecho (intencionalmente)" del
   mismo `README.md` repite la lista.

**Cifras macro citadas en el sitio vs cifras del backend** (D14):
las 4 cifras del `DataStrip` del home (38.8M hogares, 246,831 servidores
CDMX, $10.13 bill MXN SAR, 13/13 validaciones INEGI) coinciden con el
inventario backend FASE 1+2 (commits `19f6a20` y `d1c5012` en
`DabtcAvila/datos-itam`). La cifra "78 endpoints" en `/metodologia` no
coincide con el API live.

---

## Dimensión 1 — Repo (estructura)

### Hallazgos

- **Branch local `main`** está sincronizada con `origin/main`:
  `On branch main / Your branch is up to date with 'origin/main' /
  nothing to commit, working tree clean`.
- **Branches existentes**:
  - locales: `main`, `fix/favicon-v2-google-indexing`
  - remotas: `origin/main`, `origin/fix/favicon-v2-google-indexing`
- **Submódulos**: ninguno.
- **Historia de commits**: el repo tiene exactamente **3 commits** desde
  bootstrap:
  - `20cfbb6` — fix(favicon): regenerar con tamaños múltiplos de 48 + cache-bust v2 (2026-05-18T16:26:29Z, autor `df.avila.diaz@gmail.com`)
  - `99a40bc` — docs(readme): documentar auto-deploy desde GitHub a Cloudflare
  - `4d7e2b1` — chore: bootstrap del sitio canónico de datosmexico.org
- **Tamaño total del checkout**: `1.2 GB` (con `node_modules`).
  Excluyendo dependencias e intermedios (`node_modules`, `.next`,
  `.open-next`, `.wrangler`, `.git`): **~1.21 MB** de código fuente +
  contenido. Por subcarpeta: `app=80K`, `components=356K`, `content=24K`,
  `lib=56K`, `public=736K`, `scripts=12K`.
- **`.gitignore`** (530 B) excluye `node_modules`, `.next`, `.open-next`,
  `.wrangler`, `.env*`, `.DS_Store`, `*.tsbuildinfo`, `next-env.d.ts`,
  `coverage`, `build`, `out`, `.vercel`, logs de npm/yarn/pnpm.
- **Árbol a 3 niveles**: 179 entradas (`find … -maxdepth 3`).
  Estructura:
  - `app/` — App Router con grupo de rutas `(marketing)` + rutas raíz
    (`feed.xml`, `robots.ts`, `sitemap.ts`, `styleguide/`, `layout.tsx`,
    `globals.css`).
  - `components/` — 81 archivos `.tsx` agrupados en 12 carpetas
    (boletin, contacto, layout, metodologia, newsletter, prensa,
    publicaciones, quienes-somos, sections, sections/pulso, typography,
    ui).
  - `content/publicaciones/` — 3 archivos `.mdx`.
  - `lib/` — utilidades, fetcher API, datos tipados (team, asesores,
    academicos), módulo de publicaciones, design tokens, hooks.
  - `public/` — branding (logo + variantes en SVG, favicons v1 y v2,
    Open Graph PNGs, `manifest.json`, `llms.txt`, `browserconfig.xml`).
  - `scripts/generate-brand-assets.ts` — 340 líneas, genera derivados
    desde el logo source.
- **Archivos en raíz** (sin contar carpetas): 12. Configs:
  `next.config.ts`, `wrangler.jsonc`, `open-next.config.ts`,
  `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`,
  `mdx-components.tsx`, `next-env.d.ts`, `package.json`,
  `package-lock.json`, `README.md`. Más `tsconfig.tsbuildinfo` (345K,
  artefacto local) y `.DS_Store`.

### Comandos / queries ejecutados

```bash
git fetch origin
git status
git rev-parse HEAD
git log -1 --format=fuller
git log --oneline -20
git submodule status
git branch -a
ls -lah
cat .gitignore
du -sh public/ app/ components/ content/ lib/ scripts/
find . -maxdepth 3 \( -path ./node_modules -o -path ./.next -o -path ./.git \
  -o -path ./out -o -path ./dist -o -path ./.open-next \
  -o -path ./.wrangler \) -prune -o -print | wc -l
# → 179
```

### Observaciones neutras

- Sólo 3 commits totales. El bootstrap (`4d7e2b1`) y el commit "docs(readme):
  documentar auto-deploy" (`99a40bc`) son los únicos previos al último.
  Sugiere o bien squash agresivo o bien que la mayor parte del desarrollo
  ocurrió pre-repo (transferido como bootstrap).
- `tsconfig.tsbuildinfo` (345 KB) está commiteado en el árbol de trabajo
  como producto del último `tsc --noEmit` o `next build` — el `.gitignore`
  lo excluye con `*.tsbuildinfo`, así que no entra en futuras subidas pero
  sigue en disco.
- Existe una branch local + remota `fix/favicon-v2-google-indexing` cuyo
  commit final (`20cfbb6`) ya está en `main`. La branch podría
  considerarse merged y eliminable, pero no se actúa: solo se registra.

---

## Dimensión 2 — Stack técnico (Next.js + Cloudflare Workers via OpenNext)

### Hallazgos

- **Framework**: Next.js `16.2.4` con **App Router** (existe `app/`, no
  `pages/`). `pageExtensions: ["ts","tsx","md","mdx"]` configurado en
  `next.config.ts`.
- **React**: `19.2.4`. TypeScript: `^5`. ESLint: `^9` con
  `eslint-config-next` v16.2.4 (`core-web-vitals` + `typescript` presets).
- **Tailwind**: `^4` (CSS-only config — no hay `tailwind.config.{js,ts}`;
  la configuración vive como `@theme inline { … }` dentro de
  `app/globals.css`). PostCSS plugin: `@tailwindcss/postcss`.
- **MDX**: `@next/mdx ^16.2.4` + `@mdx-js/{loader,react} ^3.1.1`.
- **Cargas tipográficas**: `next/font/google` con `Source_Serif_4`,
  `Inter` y `JetBrains_Mono` (`display: "swap"`). Paquetes
  `@fontsource/*` también declarados en devDependencies pero no
  importados en código (`grep -r "from \"@fontsource"` → 0 hits).
- **Lockfile**: `package-lock.json` (572,916 B, 16,127 líneas, fecha
  `2026-05-04 21:41`). No hay `pnpm-lock.yaml` ni `yarn.lock`. El script
  `deploy` de `package.json` usa npm/npx implícito.
- **Node**: no hay `.nvmrc`, `.node-version`, ni `engines.node` en
  `package.json`. La versión activa en la sesión es `v24.4.1`.
- **Deploy adapter**: `@opennextjs/cloudflare ^1.19.5`. `open-next.config.ts`
  es minimal: `defineCloudflareConfig({})`. `wrangler.jsonc` declara:
  - `main: ".open-next/worker.js"`
  - `name: "datosmexico"`
  - `compatibility_date: "2026-04-01"`
  - `compatibility_flags: ["nodejs_compat", "global_fetch_strictly_public"]`
  - `assets: { directory: ".open-next/assets", binding: "ASSETS" }`
  - `observability: { enabled: true }`
  - `routes` con `custom_domain: true` para `datosmexico.org` y
    `www.datosmexico.org`
- **Comandos de build/deploy en `package.json`**:
  - `dev`: `next dev`
  - `build`: `next build`
  - `lint`: `eslint`
  - `generate:brand`: `tsx scripts/generate-brand-assets.ts`
  - `deploy`: `opennextjs-cloudflare build && opennextjs-cloudflare deploy`
- **tsconfig**: `target ES2017`, `strict: true`, `moduleResolution:
  "bundler"`, `jsx: react-jsx`, alias `@/*` → raíz del proyecto,
  `plugins: [{ "name": "next" }]`. `noEmit: true`.

### Comandos / queries

```bash
cat package.json
cat next.config.ts wrangler.jsonc open-next.config.ts tsconfig.json \
    eslint.config.mjs postcss.config.mjs mdx-components.tsx
ls -la .nvmrc .node-version 2>&1 | grep -v "No such"   # → vacío
ls -la package-lock.json pnpm-lock.yaml yarn.lock 2>&1 | grep -v "No such"
wc -l package-lock.json
node --version    # v24.4.1
```

### Observaciones neutras

- No hay especificación de versión de Node ni para humanos (`.nvmrc`) ni
  para CI (`engines.node`). El auto-deploy de Cloudflare Workers Builds
  (declarado en `README.md`) usa su propio default, no documentado en el
  repo.
- Tailwind v4 con `@theme inline` es la convención esperada para v4, pero
  el patrón "tokens en `:root` + CSS variables + `@theme inline`
  espejando" no aparece en convenciones internas escritas: vive sólo en
  `app/globals.css`.
- Existe `tsconfig.tsbuildinfo` en disco (345 KB) pero está en
  `.gitignore`.

---

## Dimensión 3 — Páginas / rutas servidas

### Hallazgos

- **Rutas (App Router)**:

  | Path URL | Archivo de origen | Tipo | Fetches API |
  |---|---|---|---|
  | `/` | `app/(marketing)/page.tsx` | Server Component | sí, indirecto (via `<Visualization>` etc) |
  | `/boletin` | `app/(marketing)/boletin/page.tsx` | Server Component | no |
  | `/contacto` | `app/(marketing)/contacto/page.tsx` | Server Component | no |
  | `/dash-mapa01` | `app/(marketing)/dash-mapa01/page.tsx` | Server Component (con `<Suspense>`) | sí (4 endpoints) |
  | `/metodologia` | `app/(marketing)/metodologia/page.tsx` | Server Component | no |
  | `/prensa` | `app/(marketing)/prensa/page.tsx` | Server Component | no |
  | `/publicaciones` | `app/(marketing)/publicaciones/page.tsx` | Server Component | no (lee `lib/publicaciones/loader.ts`) |
  | `/publicaciones/[slug]` | `app/(marketing)/publicaciones/[slug]/page.tsx` | SSG via `generateStaticParams` | sí (vía `<Visualization>` por publicación) |
  | `/publicaciones/categoria/[slug]` | `app/(marketing)/publicaciones/categoria/[slug]/page.tsx` | Server Component | no |
  | `/quienes-somos` | `app/(marketing)/quienes-somos/page.tsx` | Server Component | no |
  | `/styleguide` | `app/styleguide/page.tsx` | Server Component (con `robots: { index:false, follow:false }`) | no |
  | `/feed.xml` | `app/feed.xml/route.ts` | `export const dynamic = "force-static"; revalidate = 3600;` | no (lee `lib/publicaciones/loader.ts`) |
  | `/robots.txt` | `app/robots.ts` | `MetadataRoute.Robots` static | n/a |
  | `/sitemap.xml` | `app/sitemap.ts` | `MetadataRoute.Sitemap` async | no (lee `lib/publicaciones/loader.ts`) |
  | `/manifest.webmanifest` | `public/manifest.json` (estático) | static | n/a |

- **Smoke checks producción (HTTPS, `curl -L`)**:

  ```
  200  https://datosmexico.org/
  200  https://datosmexico.org/quienes-somos
  404  https://datosmexico.org/manifiesto       ← no existe como ruta
  404  https://datosmexico.org/equipo           ← no existe como ruta
  200  https://datosmexico.org/publicaciones
  200  https://datosmexico.org/contacto
  200  https://datosmexico.org/prensa
  200  https://datosmexico.org/boletin
  200  https://datosmexico.org/metodologia
  200  https://datosmexico.org/dash-mapa01
  200  https://datosmexico.org/styleguide
  200  https://datosmexico.org/feed.xml
  200  https://datosmexico.org/sitemap.xml
  200  https://datosmexico.org/robots.txt
  200  https://datosmexico.org/llms.txt
  200  https://www.datosmexico.org/
  ```

  Slugs dinámicos:

  ```
  200  /publicaciones/servidores-publicos-cdmx
  200  /publicaciones/sar-recursos-administrados
  200  /publicaciones/hogares-mexicanos-enigh-2024
  200  /publicaciones/categoria/mercado-laboral
  200  /publicaciones/categoria/pensiones
  200  /publicaciones/categoria/hogares-bienestar
  ```

- **Headers de la respuesta del home** (`curl -sSI https://datosmexico.org/`):

  ```
  HTTP/2 200
  content-type: text/html; charset=utf-8
  cache-control: s-maxage=31536000
  x-nextjs-cache: MISS
  x-nextjs-prerender: 1
  x-nextjs-stale-time: 300
  x-opennext: 1
  x-powered-by: Next.js
  strict-transport-security: max-age=31536000
  server: cloudflare
  ```

  `x-nextjs-prerender: 1` y `x-opennext: 1` confirman: Next-on-OpenNext
  sirviendo SSG cacheado por Cloudflare.

### Comandos / queries

```bash
find app -type f \( -name "page.tsx" -o -name "route.ts" -o -name "layout.tsx" \) | sort
for url in /  /quienes-somos /manifiesto /equipo /publicaciones /contacto \
            /prensa /boletin /metodologia /dash-mapa01 /styleguide \
            /feed.xml /sitemap.xml /robots.txt /llms.txt ; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 12 -L \
    "https://datosmexico.org$url")
  echo "$code  https://datosmexico.org$url"
done
curl -sSI --max-time 10 https://datosmexico.org/
```

### Observaciones neutras

- **`/manifiesto` y `/equipo` responden 404** y no existen en `app/`. La
  página `/quienes-somos` incluye una sección `<Equipo />` (anchor
  `#equipo`); la idea de "manifiesto" parece estar fusionada con
  `/metodologia` (que se autodescribe: *"No es un manifiesto: es la
  especificación operativa que aplicamos a cada análisis"*).
- El `sitemap.xml` está construido por `app/sitemap.ts` y enumera 7
  estáticas + 3 categorías + N publicaciones (hoy N=3). No incluye
  `/dash-mapa01`, `/boletin`, `/prensa` ni `/styleguide` (esperado:
  `/styleguide` está disallow en `robots.txt`).
- `/styleguide` está marcado `noindex,nofollow` por metadata y disallow en
  `/robots.txt`, pero responde `200` y es navegable directamente.
- `lastModified` del sitemap está hardcodeado a `new Date("2026-05-07")`
  para todas las páginas estáticas y categorías; sólo las publicaciones
  usan `updatedAt ?? publishedAt`.

---

## Dimensión 4 — Consumo del API backend (`api.datos-itam.org`)

### Hallazgos

#### Archivos involucrados

- **`lib/api/types.ts`** — 1 archivo, ~135 líneas. Declara **14 types
  manuales**: `DistributionItem`, `SalaryByAgeItem`, `SectorTopItem`,
  `SarSeriePunto`, `SarSerieTotales`, `SarAforeRow`, `SarPorAfore`,
  `SarComponenteRow`, `SarPorComponente`, `SarImssVsIsssteRow`,
  `SarImssVsIssste`, `EnighSummary`, `EnighDecilRow`, `EnighRubroRow`,
  `EnighGastoRubro`, `DashboardStats`. (Sin importación generadora de
  OpenAPI — todo escrito a mano.)
- **`lib/api/fetcher.ts`** — define `API_BASE = "https://api.datos-itam.org"`,
  expone `fetchApiData<T>(endpoint)` que llama `fetch` con
  `next: { revalidate: false }`, header `User-Agent: datosmexico.org/build`
  y un `ApiError` propio que captura `endpoint`, `status` y origen
  (network/parse/non-ok). No hay timeout configurado.

#### Endpoints del backend consumidos por el sitio

Inventario por `grep`:

```
GET /api/v1/dashboard/stats                                      → DashboardStats
GET /api/v1/consar/recursos/totales                              → SarSerieTotales
GET /api/v1/consar/recursos/por-afore?fecha=2025-06-01           → SarPorAfore
GET /api/v1/consar/recursos/por-componente?fecha=2025-06-01      → SarPorComponente
GET /api/v1/consar/recursos/imss-vs-issste                       → SarImssVsIssste
GET /api/v1/enigh/hogares/summary                                → EnighSummary
GET /api/v1/enigh/hogares/by-decil                               → EnighDecilRow[]
GET /api/v1/enigh/gastos/by-rubro                                → EnighGastoRubro
```

**Total: 8 endpoints únicos** consumidos en runtime/build-time.

Backend live: `jq '[.paths[] | to_entries[] | select(.key | test("^(get|post|put|delete|patch|options|head)$"))] | length' /tmp/openapi-live.json` → **114 operaciones** en **106 paths**. Cobertura del sitio
sobre el backend: 8 / 114 ≈ **7.0 %**. (No es un objetivo: el sitio sólo
necesita lo que pinta en pantalla.)

Endpoints adicionales referidos en prosa pública del sitio:

- `pip install datos-mexico` (cliente SDK que cubre el API completa)
- `https://api.datos-itam.org/docs` — link al Swagger (Footer, prensa
  Recursos, metodología AccesoProgramatico, metodología Auditoria)

#### Drift detection contra `/openapi.json` live

`curl -sS https://api.datos-itam.org/openapi.json -o /tmp/openapi-live.json
 # 277,181 B, 106 paths, 205 schemas`.

| Type en `lib/api/types.ts` (sitio) | Schema correspondiente en spec live | Hallazgo |
|---|---|---|
| `DashboardStats` | `DashboardStats` | **DRIFT — campos faltantes.** Site declara 22 props; spec live exige 31. Faltan: `genderGapBySector`, `topPositions`, `seniorityDistribution`, `salaryBySeniority`, `avgSeniority`, `avgNetSalary`, `avgDeduction`, `avgDeductionPercent`, `brutoNetoByRange`. Adicionalmente `allSectors` está `?` (optional) en site pero `required` en spec. |
| `EnighSummary` | **`HogaresSummary`** | Nombre distinto, mismos 8 campos (`n_hogares_muestra`, `n_hogares_expandido`, `mean_ing_cor_trim`, `mean_ing_cor_mensual`, `mean_gasto_mon_trim`, `mean_gasto_mon_mensual`, `edition`, `source`). Site cumple. |
| `EnighDecilRow` | **`DecilRow`** | Nombre distinto, mismos 7 campos (`decil`, `n_hogares_muestra`, `n_hogares_expandido`, `mean_ing_cor_trim`, `mean_ing_cor_mensual`, `mean_gasto_mon_trim`, `share_factor_pct`). Site cumple. |
| `SarSerieTotales` | `TotalesSarResponse` | Nombre distinto. Site declara `unit`, `n_puntos`, `fecha_min`, `fecha_max`, `serie` y `caveats?`. Spec live: idénticos. |
| `SarPorAfore` | (no schema único; respuesta de `/api/v1/consar/recursos/por-afore`) | No verificado al detalle. La existencia del endpoint sí está confirmada en `keys[]`. |
| `SarPorComponente` | (idem `/por-componente`) | Sin verificación schema-por-schema. |
| `SarImssVsIssste` | (idem `/imss-vs-issste`) | Sin verificación schema-por-schema. |
| `EnighGastoRubro` | (idem `/enigh/gastos/by-rubro`) | Sin verificación schema-por-schema. |

Naming gap: 6 de los 14 types del sitio usan nombres distintos a los
schemas de la spec live (`EnighSummary`→`HogaresSummary`,
`EnighDecilRow`→`DecilRow`, `SarSerieTotales`→`TotalesSarResponse`,
etc.). El sitio escribió los types a mano, no los importó/generó.

#### Estrategia de fetch

- `lib/api/fetcher.ts` usa `fetch(url, { next: { revalidate: false }, … })`.
  En Next.js App Router con Server Components esto significa **build-time
  caching indefinido** (el fetch se cachea para siempre hasta el próximo
  build, no se revalida en runtime).
- Todos los componentes que consumen el API son `async function`
  declaradas como Server Components (no hay `"use client"` + `useEffect`
  en ningún punto de consumo).
- `/dash-mapa01` envuelve sus componentes asíncronos con
  `<Suspense fallback={…}>` y, además, su `PulsoHero` usa
  `Promise.allSettled` para tolerar fallos parciales: si un endpoint falla
  devuelve `null` y la KPI cell muestra `0`. Es la única página con
  manejo explícito de falla del API.
- `<Visualization>` (en publicaciones MDX) no envuelve en `<Suspense>` ni
  en try/catch — un fallo del API aborta el render del componente.

### Comandos / queries

```bash
grep -rn "fetchApiData\|api\.datos-itam\.org\|/api/v1/" --include="*.ts" \
  --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next .
cat lib/api/types.ts lib/api/fetcher.ts
curl -sS https://api.datos-itam.org/openapi.json -o /tmp/openapi-live.json
jq '[.paths[] | to_entries[] | select(.key | test("^(get|post|put|delete|patch|options|head)$"))] | length' /tmp/openapi-live.json
# → 114
jq '.paths | keys | length' /tmp/openapi-live.json   # → 106
jq '.components.schemas | keys | length' /tmp/openapi-live.json   # → 205
jq '.components.schemas.DashboardStats' /tmp/openapi-live.json
jq '.components.schemas.HogaresSummary' /tmp/openapi-live.json
jq '.components.schemas.DecilRow' /tmp/openapi-live.json
jq '.components.schemas.TotalesSarResponse' /tmp/openapi-live.json
```

### Observaciones neutras

- El backend FASE 2 (mergeada como `d1c5012` el día previo) cambió
  metadata pero no parece haber roto la forma de las respuestas:
  los 8 endpoints consumidos por el sitio siguen respondiendo `200` desde
  el sitio en producción.
- `revalidate: false` significa que un cambio en cifras del backend no
  llega al sitio hasta el siguiente `opennextjs-cloudflare build && deploy`.
  El último build/deploy fue el `2026-05-18`. Cualquier dato del API
  publicado entre esa fecha y hoy (`2026-05-23`) no se refleja en cifras
  que vivan en HTML (sólo en cifras renderizadas client-side, y no hay).
- El `ApiError` propio captura `status` pero el sitio nunca lo lee — los
  consumidores envuelven con `try/catch` para resolver `data | null` (en
  `PulsoHero` y `IngresoPorDecil`) o dejan propagar la excepción
  (Visualization, SarHistorico).

---

## Dimensión 5 — Prosa institucional (Camino C compliance)

### 5.1 Búsqueda de patrones prohibidos

Comando ejecutado:

```bash
grep -rniE "ITAM Bases de Datos|Bases de Datos 2026|semestre 2026|programa de|proyecto académico|el autor" \
  --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" \
  --include="*.mdx" --include="*.md" --include="*.json" --include="*.yml" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git \
  --exclude-dir=out --exclude-dir=dist --exclude-dir=.open-next \
  --exclude-dir=.wrangler .
```

Matches (6 ocurrencias):

| Archivo:línea | Patrón | Texto |
|---|---|---|
| `components/quienes-somos/Gobernanza.tsx:27` | `proyecto académico` | "Datos México es un **proyecto académico independiente**. No recibimos…" |
| `components/quienes-somos/Historia.tsx:15` | `proyecto académico` | "Datos México nació en Primavera 2026 como un **proyecto académico** dentro del ITAM, originalmente bajo el nombre de **Datos ITAM**." |
| `components/quienes-somos/Historia.tsx:47` | `proyecto académico` | "dejamos de ser un **proyecto académico privado** y pasamos a posicionarnos como lo que somos — un observatorio público de datos sobre México…" |
| `components/prensa/Preguntas.tsx:48` | `proyecto académico` | "No. Somos un **proyecto académico independiente sin fines de lucro**. Toda atención a medios es gratuita." |
| `components/boletin/Preguntas.tsx:9` | `proyecto académico` | "El boletín y todo el contenido del observatorio son gratuitos. … Es un **proyecto académico independiente**." |
| `lib/academicos.ts:18` | `programa de` | `role: "Director del Programa de Ingeniería en Inteligencia Artificial"` — esto es el cargo formal del Dr. Marco Antonio Morales Aguirre; no posiciona al observatorio. |

**Cero matches** para: `ITAM Bases de Datos`, `Bases de Datos 2026`,
`semestre 2026`, `el autor`.

### 5.2 Lectura de `/quienes-somos`

- **Archivo**: `app/(marketing)/quienes-somos/page.tsx`. Composición:

  ```tsx
  <QuienesSomosHero />   // hero institucional
  <MisionVision />       // misión + visión + 4 principios
  <Historia />           // transición Datos ITAM → Datos México
  <Equipo />             // 7 MemberCard via lib/team.ts
  <Asesoria />           // 1 asesor: Dr. Vásquez Beltrán (ITAM)
  <Acompanamiento />     // 2 académicos: Dr. Esponda, Dr. Morales (ITAM)
                         // + link al EpicLab ITAM
  <Areas />              // 3 áreas: Investigación, Datos e ingeniería,
                         //          Comunicación
  <Gobernanza />         // 6 compromisos + estado actual del proyecto
  <Contacto />           // 3 emails (general/prensa/academia)
                         // + 3 redes sociales
  ```

- **Metadata** (líneas 13-37 de `page.tsx`):
  > "Datos México es un observatorio académico independiente formado por
  > estudiantes y egresados del ITAM. Conoce al equipo, nuestra misión y
  > cómo nos organizamos."

  Estructura JSON-LD: `Organization` con `member: team.map(...)` (7
  miembros). No declara `parentOrganization` ni `affiliation` con ITAM.

- **Sección "Historia"** (componente `Historia.tsx`, lectura completa):
  - "Datos México nació en Primavera 2026 como un proyecto académico
    dentro del ITAM, originalmente bajo el nombre de **Datos ITAM**."
  - "En abril 2026, para evitar riesgos asociados al uso del nombre
    institucional, el proyecto pasó a llamarse **Datos México**."
  - **"El equipo sigue siendo, casi en su totalidad, gente del ITAM. Pero
    la organización ya no es del ITAM, ni representa al ITAM. Somos un
    observatorio independiente."**
  - Esta última frase explicita la separación entre membresía y
    respaldo institucional, alineada con Camino C.

- **Sección "Asesoría académica"**: nombra al Dr. Marco Augusto Vásquez
  Beltrán como "Profesor del ITAM que asesora al equipo".
- **Sección "Acompañamiento académico"**: nombra al Dr. Carlos Fernando
  Esponda Darlington y al Dr. Marco Antonio Morales Aguirre como
  "Académicos del ITAM que están al pendiente del proyecto", e incrusta
  un logo enlazado a `https://epiclab.itam.mx/`.
- **Sección "Gobernanza"** — declaración literal:
  > "Datos México es un proyecto académico independiente. No recibimos
  > financiamiento de partidos políticos ni de gobiernos. Nuestro código
  > y nuestra metodología son públicos."

  Y un aside marcado *"Estado actual del proyecto"*:
  > "Datos México opera de manera informal mientras evaluamos su
  > constitución como Asociación Civil. **[PENDIENTE: actualizar cuando
  > haya figura legal definida]**. No hemos recibido financiamiento
  > externo a la fecha. Los costos de infraestructura los cubre el
  > equipo fundador."

- **Longitud aproximada** de la página renderizada:
  - `Hero.tsx` 23 líneas, `MisionVision.tsx` 72 líneas,
    `Historia.tsx` 59 líneas, `Equipo.tsx` 26 líneas,
    `Asesoria.tsx` 35 líneas, `Acompanamiento.tsx` 53 líneas,
    `Areas.tsx` 56 líneas, `Gobernanza.tsx` 68 líneas,
    `Contacto.tsx` 74 líneas. Total: ~466 líneas TSX.
  - Texto institucional puro (sin prop-drilling, sin imports): el
    componente más denso en prosa es `Historia.tsx` (4 párrafos largos).

### 5.3 Resto de páginas con prosa institucional

| Página | Mención a ITAM | Camino C? |
|---|---|---|
| `app/layout.tsx` (global) | `keywords` incluye `"ITAM"`; JSON-LD `Organization` con `alternateName: "Datos ITAM"`, `description: "Observatorio independiente de datos públicos de México formado por estudiantes y egresados del ITAM"`, `sameAs: ["https://datos-itam.org"]` | **Observación neutra**: el `alternateName: "Datos ITAM"` mantiene el nombre histórico como alias schema.org. Coherente con Historia, pero observable. |
| `app/(marketing)/page.tsx` (home) | Vía `<Hero />` ("Observatorio independiente · Desde el ITAM") y `<QuienesSomosPreview />` ("Colaboraciones académicas con el ITAM"). | **Observación neutra**: "Desde el ITAM" como tagline del Eyebrow del Hero podría leerse como subordinación; el texto siguiente ("Observatorio independiente · Desde el ITAM") usa la conjunción para indicar origen. |
| `app/(marketing)/contacto/page.tsx` + `components/contacto/Cierre.tsx` | "Datos México es un observatorio académico independiente formado por estudiantes y egresados del ITAM. Operamos sin fines de lucro…" | Coherente con Camino C. |
| `app/(marketing)/prensa/page.tsx` + `components/prensa/Preguntas.tsx` | "No. Somos un proyecto académico independiente sin fines de lucro." | Coherente. |
| `app/(marketing)/metodologia/page.tsx` | No menciona ITAM en metadata; sus componentes no posicionan al observatorio como tarea de clase. | Coherente. |
| `app/(marketing)/boletin/page.tsx` + `components/boletin/Preguntas.tsx` | "El boletín y todo el contenido del observatorio son gratuitos. … Es un proyecto académico independiente." | Coherente. |
| `app/styleguide/page.tsx` | "Observatorio independiente · Desde el ITAM" (réplica del Hero del home) y un Button con `href="https://datos-itam.org"`. | Página marcada `noindex`. Misma observación neutra que Hero del home. |
| `public/llms.txt` | "Observatorio independiente de datos públicos de México formado por estudiantes y egresados del ITAM…". Sección "El observatorio" lista `/quienes-somos: equipo, motivación y vínculo con el ITAM`. | Coherente. |
| `README.md` | "Sitio público institucional de Datos México, observatorio independiente de datos públicos de México formado por estudiantes y egresados del ITAM." | Coherente (README es interno; igual aparece en repo público). |
| `public/manifest.json` | No menciona ITAM. | n/a |

### 5.4 Claims superlativas o auto-elogiosas

Búsqueda neutra de patrones "primer", "única", "primera":

```bash
grep -rniE "primer observatorio|primera plataforma|el primer|única plataforma|único observatorio" \
  --include="*.tsx" --include="*.ts" --include="*.mdx" --include="*.md" \
  --exclude-dir=node_modules --exclude-dir=.next .
```

Resultado: **0 matches**. El sitio no se posiciona como "primer/único X".

`components/quienes-somos/MisionVision.tsx` sí declara visión:

> "Ser el **observatorio de datos de referencia en México**: el lugar
> donde cualquier persona puede consultar, reproducir y entender los
> números que describen al país."

Es declaración de aspiración ("ser"), no claim de hecho actual.

### Observaciones neutras

- **No se detectaron violaciones de Camino C que requieran corrección
  bloqueante.** Las 6 ocurrencias del término "proyecto académico" describen
  la naturaleza del observatorio (académico = riguroso, no comercial), no
  lo atan a una clase ni a un semestre.
- **Observación menor sobre `alternateName: "Datos ITAM"` en JSON-LD**
  (`app/layout.tsx:111`). Es coherente con `Historia.tsx` (que documenta
  la transición), pero un crawler de schema.org tomará "Datos ITAM" como
  alias válido y oficial del observatorio. Si la posición es que el
  nombre `Datos ITAM` ya no representa al observatorio (Historia dice:
  "la organización ya no es del ITAM, ni representa al ITAM"), conservar
  el alias en metadata estructurada es contradictorio con esa posición.
  Registrado, no diagnosticado.
- **Observación sobre Eyebrow del Hero** (`components/sections/Hero.tsx:13`
  y `app/styleguide/page.tsx:114`): la cadena
  `"Observatorio independiente · Desde el ITAM"` aparece dos veces
  hardcodeada. Es el único punto donde la posición "Desde el ITAM" se
  presenta sin la frase explicativa de Historia. Si "Desde el ITAM" debe
  leerse como "origen" y no "subordinación", el contexto inmediato no lo
  desambigua.
- **`/quienes-somos` no declara explícitamente que es la fuente única de
  verdad** para la prosa institucional. El prompt asume que sí lo es y
  que otros artefactos deben linkear a esta página; la página no hace
  ese papel autodeclarativo, sólo se describe.

---

## Dimensión 6 — Publicaciones MDX

### Hallazgos

Carpeta: `content/publicaciones/`. **3 archivos `.mdx` publicados** (cero
draft, cero archivos con prefijo `_`).

| Slug | Título (frontmatter) | Categoría | publishedAt | Líneas | Palabras | dataSource[0].name | Consume API |
|---|---|---|---|---|---|---|---|
| `servidores-publicos-cdmx` | "Servidores públicos de la Ciudad de México: una primera lectura" | `mercado-laboral` | `2026-05-04` | 64 | 592 | Datos Abiertos CDMX | sí (`/api/v1/dashboard/stats` vía `<Visualization id="cdmx-*">`) |
| `sar-recursos-administrados` | "El SAR mexicano administra más de diez billones de pesos: composición y AFOREs" | `pensiones` | `2026-05-04` | 74 | 576 | CONSAR | sí (`/api/v1/consar/recursos/{totales,por-afore,por-componente,imss-vs-issste}`) |
| `hogares-mexicanos-enigh-2024` | "Hogares mexicanos en 2024: ingreso, gasto y desigualdad por decil" | `hogares-bienestar` | `2026-05-04` | 65 | 623 | INEGI ENIGH 2024 NS | sí (`/api/v1/enigh/hogares/{summary,by-decil}`, `/api/v1/enigh/gastos/by-rubro`) |

- **Las 3 publicaciones se publicaron el mismo día** (`2026-05-04`). Es la
  primera (y única) cohorte de publicaciones del observatorio.
- Cada publicación declara `readingTime` manual (7, 8, 7 min).
- Autor: no hay campo `author` en el frontmatter; el `PublicationFooter`
  no se inspeccionó al detalle pero el OpenGraph del slug declara
  `authors: ["Equipo de Datos México"]` (fijo, no por publicación).
- **Mención de ITAM en MDX**: cero matches por `grep -niE "ITAM" content/publicaciones/`. El cuerpo editorial de las publicaciones es estrictamente sobre los datos, no sobre la institución.
- Cada publicación termina con una sección "Reproducibilidad" que lista
  los endpoints exactos consumidos y la fecha de fetch (`4 de mayo de
  2026`).
- Cada publicación incluye 2 bloques `<Caveat>` (uno "Lo que estos datos
  SÍ muestran", otro "NO muestran") + componentes
  `<Visualization id="…">`.

### Comandos / queries

```bash
ls -la content/publicaciones/
for f in content/publicaciones/*.mdx; do
  echo "$f"; wc -l "$f"; wc -w "$f"; head -16 "$f"
done
grep -ni "ITAM" content/publicaciones/*.mdx   # → 0 matches
```

### Observaciones neutras

- **`lib/publicaciones/registry.ts` declara explícitamente las 3
  publicaciones por import estático** (`import * as servidoresPublicosCdmx from "@/content/publicaciones/servidores-publicos-cdmx.mdx"; …`). Esto significa que **agregar una nueva publicación requiere editar `registry.ts`** además del archivo `.mdx`; el loader no escanea la carpeta. El `loader.ts` valida un frontmatter mínimo (`title`, `slug`, `category`, `publishedAt`, `excerpt`, `readingTime`, `dataSource[]`, `status`) y aborta el build si falta.
- Las 3 publicaciones no usan ninguno de los endpoints de **ENOE** que el
  backend expone (10 endpoints `/api/v1/enoe/*` en spec live). El sitio
  hoy no toca ENOE en absoluto.
- La pieza preview del home (`components/sections/Publicaciones.tsx`)
  muestra 3 cards distintas — ver D14 §"Coherencia interna".

---

## Dimensión 7 — Equipo y miembros

### Hallazgos

- **Fuente de verdad**: `lib/team.ts` exporta `team: TeamMember[]` con
  **7 miembros**. Cada miembro tiene: `id`, `name`, `initials`, `career`,
  `year` (vacío en todos), `bio` (vacío en todos), `links` (subset de
  linkedin/twitter/github/website), `photo` (todos `undefined`).
- Lista completa (7 personas):

  1. David Fernando Ávila Díaz — Estudiante de Ciencia de Datos, ITAM (linkedin + github)
  2. Gerardo André Butrón Ramírez — Estudiante de Ciencia de Datos, ITAM (linkedin + github)
  3. Emiliano Sebastián Millán Giffard — Estudiante de Ciencia de Datos, ITAM (github)
  4. José Roberto Uribe Clemente — Estudiante de Ciencia de Datos, ITAM (github)
  5. Ashley Dannae Solano Díaz — **Estudiante de Psicología, Universidad del Valle de México** (linkedin)
  6. Alexa Fernanda Hernández Monroy — Egresada de Economía, ITAM (linkedin)
  7. Fabiola Campos Juárez — Estudiante de Economía, ITAM (linkedin)

  6 de 7 son del ITAM, 1 es de la UVM. La prosa del Hero / Footer /
  llms.txt dice "estudiantes y egresados del ITAM" — afirmación válida
  para 6/7 pero no para Solano Díaz.

- **Asesores académicos**: `lib/asesores.ts` — 1 entrada (Dr. Marco
  Augusto Vásquez Beltrán, ITAM).
- **Acompañamiento académico**: `lib/academicos.ts` — 2 entradas (Dr.
  Carlos Fernando Esponda Darlington — Director Lic. Ciencia de Datos,
  ITAM; Dr. Marco Antonio Morales Aguirre — Director Programa Ingeniería
  en IA, ITAM).
- **EpicLab — ITAM** aparece como logo enlazado al final de la sección
  Acompañamiento (`href="https://epiclab.itam.mx/"`), sin texto que lo
  posicione como respaldo institucional formal (sólo como
  acompañamiento académico vía sus directores).
- **Componente `MemberCard`** (76 líneas): renderiza Avatar (porque
  `photo === undefined` en todos los miembros), nombre (font-serif),
  carrera (texto-sutil), links (LinkedIn/Twitter/GitHub/website según
  disponibles). Como `bio === ""` no se renderiza párrafo de bio.

### Comandos / queries

```bash
cat lib/team.ts lib/asesores.ts lib/academicos.ts
cat components/quienes-somos/Equipo.tsx components/quienes-somos/MemberCard.tsx
cat components/quienes-somos/Asesoria.tsx components/quienes-somos/Acompanamiento.tsx
```

### Observaciones neutras

- **El texto del Hero de `Equipo` dice**: "Somos un equipo de **7
  personas** — estudiantes y egresados del ITAM …". El conteo coincide
  con `team.length`, pero la frase no contempla a la miembro UVM.
- **`year` y `bio` están vacíos en los 7 registros**; el `MemberCard`
  esconde elegantemente esos campos. Si en el futuro se rellenan los
  bios, la grilla cambiará de altura por miembro.
- No hay menciones de Solano Díaz en prosa del sitio que la describan
  como UVM; sólo la card del equipo refleja su afiliación correctamente.
- La carpeta `public/brand/` contiene `epiclab.avif` pero no contiene
  fotos del equipo (consistente con `photo: undefined` para todos).

---

## Dimensión 8 — Componentes UI compartidos

### Hallazgos

- **Conteo total**: `find components -type f -name "*.tsx" | wc -l` →
  **81 componentes**.
- **Carpetas de componentes** (12) y conteo aproximado por carpeta:

  | Carpeta | Archivos | Rol |
  |---|---|---|
  | `layout/` | 4 | Header (sticky con mobile menu, `"use client"`), Footer (footer institucional con 4 columnas), Container (max-w-6xl wrapper), Logo (variantes default/mono-white/mono-black, sizes sm/md/lg, wordmark opcional) |
  | `sections/` | 7 | Hero, DataStrip (4 KPI hardcoded), QuienesSomosPreview, Principios (4 principios hardcoded), Publicaciones (3 cards hardcoded), Metodologia (CTA), Newsletter |
  | `sections/pulso/` | 7 | Componentes de `/dash-mapa01`: AreaSeriesViz, BigCounter (animated count `"use client"`), IngresoPorDecil, PulseDot, PulsoFooter, PulsoHero, SarHistorico |
  | `typography/` | 1 | Index con `Display`, `H1`, `H2`, `H3`, `Lead`, `Body`, `Small`, `Mono`, `Eyebrow` polimórficos (prop `as`) |
  | `ui/` | 9 | Avatar (34l), Badge (27l), Button (91l, cva variants/sizes, polimórfico button/anchor/Link), Card (43l), ExternalLinkIcon (11l), FAQ (43l), Input (24l), SectionHeader (35l), SocialIcons (57l, Linkedin/Twitter/Github/Youtube) |
  | `quienes-somos/` | 11 | Hero, MisionVision, Historia, Equipo, MemberCard, Asesoria, Acompanamiento, Areas, AreaCard, Gobernanza, Contacto |
  | `metodologia/` | 10 | Hero, Principios, Pipeline, PipelineStep, Editorial, Auditoria, AccesoProgramatico, Cambios, Cierre, MetodologiaTOC (`"use client"`, IntersectionObserver vía `useActiveSection`) |
  | `publicaciones/` | 8 + 4 charts | CategoryBadge, Caveat, KeyFigure, PublicationCard, PublicationFooter, PublicationHeader, PublicationMeta, Visualization (12 IDs case-switch), mdx-components, + charts/{BarChartViz, DonutChartViz, KpiGrid, LineChartViz} |
  | `boletin/` | 6 | Hero (con `<NewsletterForm size="lg">`), Formatos (3 formatos hardcoded), Compromisos (5+5 si/no), Archivo (placeholder con `TODO` para futuros boletines), Preguntas (7 FAQs), CtaFinal |
  | `contacto/` | 6 | Hero, Canales (5 emails), ContactChannelCard, Preguntas, Redes (4 plataformas), Cierre |
  | `prensa/` | 6 | Hero (email visible), Voceros, Citarnos (3 formatos de cita), Recursos (3 cards, 2 con badge "Próximamente"), Preguntas (7 FAQs), CtaFinal |
  | `newsletter/` | 1 | NewsletterForm (`"use client"`, validación email regex, status idle/loading/success/error, defaults a `defaultSimulatedSubmit` de `lib/newsletter.ts`) |

- **`Header.tsx`** y **`Footer.tsx`** consumen `navigation` de
  `lib/design-tokens.ts` (6 items: Observatorio→datos-itam.org,
  Publicaciones, Metodología, Prensa, Quiénes Somos, Contacto). El
  Footer añade una columna "Recursos" con 4 links: Boletín,
  Repositorio público (github.com/datos-mexico/datos-mexico-py), Docs SDK
  (docs.datosmexico.org), API documentación (api.datos-itam.org/docs).
- **Componentes que hacen fetch** al backend: 4 archivos en `sections/pulso/*`
  (`IngresoPorDecil`, `SarHistorico`, `PulsoHero`) + `publicaciones/Visualization`.
  Todos los demás son presentacionales puros.
- **Componentes con `"use client"`**: Header, NewsletterForm,
  MetodologiaTOC, BigCounter, AreaSeriesViz. Cinco en total. El resto son
  Server Components.

### Comandos / queries

```bash
find components -type f -name "*.tsx" | wc -l   # → 81
find components -type f -name "*.tsx" | sort
grep -rln "^\"use client\"" components/   # → 5 archivos
cat components/layout/{Header,Footer,Container,Logo}.tsx
wc -l components/ui/*.tsx
```

### Observaciones neutras

- **Tres `Preguntas.tsx` independientes** (boletin/prensa/contacto), cada
  uno con su propio array de FAQs. Reutilizan el componente
  `<FAQ items={…}>` de `ui/`, pero los datos están hardcodeados en cada
  página.
- **`components/sections/Publicaciones.tsx`** es lo que detalla D14:
  preview del home con datos hardcoded, fuera de sincronía con la fuente
  de verdad (`content/publicaciones/`).
- **`Header.tsx` setea `document.body.style.overflow = "hidden"`** cuando
  el menú móvil está abierto. Comportamiento estándar.
- **`Logo.tsx` usa `<img>` directo** con `eslint-disable` implícito por
  manejarse SVG estático; no usa `next/image`.

---

## Dimensión 9 — Estilos y branding visual

### Hallazgos

- **Tailwind v4 — sin `tailwind.config.{js,ts}`**. Configuración
  vive en `app/globals.css` mediante:
  - `:root { --background, --foreground, --muted, --primary, --accent, … }`
  - `@theme inline { --color-background: var(--background); … --font-serif: var(--font-source-serif), …; }`
- **PostCSS**: `postcss.config.mjs` con `{ "@tailwindcss/postcss": {} }`.
- **Paleta** (`globals.css` + duplicado tipado en `lib/design-tokens.ts`):
  - background `#FAFAF9`, foreground `#0A0A0A`, muted `#F5F5F4`,
    muted-foreground `#57534E`, border `#E7E5E4`
  - text `#1F2937`, text-subtle `#4B5563`, text-inverse `#FAFAF9`
  - primary `#15803D` (verde), primary-hover `#166534`,
    primary-foreground `#FAFAF9`
  - accent `#B45309` (ámbar), accent-foreground `#FAFAF9`
  - success `#15803D`, warning `#CA8A04`, danger `#B91C1C`, info `#1E40AF`
- **Tipografías** (`app/layout.tsx`):
  - `Source_Serif_4` (`--font-source-serif`, weights 400/600/700)
  - `Inter` (`--font-inter`, weights 400/500/600/700)
  - `JetBrains_Mono` (`--font-jetbrains-mono`, weights 400/500)
  - Todas con `display: "swap"`.
  - Fallbacks (`globals.css`): `Georgia, "Times New Roman", serif`
    (serif); `system-ui, -apple-system, "Segoe UI", sans-serif` (sans);
    `ui-monospace, "SFMono-Regular", monospace` (mono).
  - `@fontsource/inter` y `@fontsource/source-serif-4` declaradas en
    devDependencies pero **no usadas** (sólo carga via `next/font/google`).
- **Logo principal**: `public/brand/logo.svg` (7.4 KB, viewBox `0 0 1000
  750`, ratio 4:3). Variantes:
  - `logo.svg` (default, color)
  - `logo-mono-black.svg` (7.4 KB)
  - `logo-mono-white.svg` (7.4 KB)
  - `logo-square.svg` (7.5 KB)
  - `logo-source.svg` / `logo-source-original.svg` (7.4 KB cada uno,
    probablemente intermedios del script de generación)
  - `epiclab.avif` (3.4 KB)
- **Favicons** (todos en `public/`, suffix `-v2` corresponden al fix
  reciente):
  - `.ico`: `favicon.ico` (14.5 KB) + `favicon-v2.ico` (139 KB,
    multi-tamaño 16/32/48/96/144)
  - PNGs `-v2`: `favicon-16x16-v2.png`, `favicon-32x32-v2.png`,
    `favicon-48x48-v2.png`, `favicon-96x96-v2.png`,
    `favicon-144x144-v2.png`, `android-chrome-192x192-v2.png`,
    `android-chrome-512x512-v2.png`, `apple-touch-icon-v2.png`
  - PNGs canónicos (sin `-v2`): coexisten en `public/` por compatibilidad.
  - `mstile-150x150.png` (8.3 KB)
  - El `app/layout.tsx` referencia exclusivamente las versiones `-v2`.
- **OG images**: 6 PNGs en `public/og/` (default, boletin, contacto,
  metodologia, prensa, quienes-somos). Tamaño ~54–60 KB cada una.
  Dimensión declarada en metadata: 1200×630. **Generadas estáticamente**
  por `scripts/generate-brand-assets.ts` usando `@vercel/og`
  (`ImageResponse`); no hay route `/og` dinámica.
- **manifest.json** declara:
  - `theme_color: "#15803D"` (primary), `background_color: "#FAFAF9"`
  - icons: 2 entradas (`android-chrome-192x192-v2.png` y
    `android-chrome-512x512-v2.png` con `purpose: "any maskable"`)
  - `display: "standalone"`, `start_url: "/"`
- **browserconfig.xml** declara tile MS de 150x150 con TileColor `#FAFAF9`.

### Comandos / queries

```bash
cat app/globals.css postcss.config.mjs lib/design-tokens.ts public/manifest.json
ls -la public/brand/ public/og/
cat public/browserconfig.xml
du -sh public/brand/ public/og/
head -3 public/brand/logo.svg
```

### Observaciones neutras

- Paleta dual: `lib/design-tokens.ts` declara las mismas constantes que
  `globals.css` con `mutedForeground`/`primaryHover`/etc en
  camelCase. Si una cambia y la otra no, queda inconsistente. Sin
  validación cruzada.
- **`logo.svg` es ilustrativo**: un gráfico de barras con gradiente
  azul→verde→amarillo→rojo + algunos detalles rojos/verdes/negros que
  recuerdan la bandera mexicana. No declara texto del wordmark — el
  wordmark se compone tipográficamente en `Logo.tsx` con Source Serif.
- Los favicons sin sufijo `-v2` siguen en disco; el `app/layout.tsx`
  apunta sólo a `-v2`. El commit `20cfbb6` documenta esa decisión y la
  deuda menor (script de generación que aún produce sólo los canónicos).
- **`@fontsource/inter` y `@fontsource/source-serif-4`** están en
  `devDependencies` pero no se importan desde código:
  `grep -r "@fontsource" .` (excluyendo `node_modules`/lockfile) → 0
  hits. Posible deuda de dependencias.

---

## Dimensión 10 — Build y deploy (Cloudflare Workers via OpenNext)

### Hallazgos

- **Tipo de deploy**: Cloudflare **Worker** (no Pages). El comando
  `wrangler pages project list` lista 10 proyectos en la cuenta —
  `datosmexico` **no aparece** entre ellos.
  El sitio se despliega como **Worker** a través de `@opennextjs/cloudflare`.
- **Comando de deploy**: `npm run deploy` →
  `opennextjs-cloudflare build && opennextjs-cloudflare deploy`. Esto
  ejecuta `next build` internamente y empaqueta a `.open-next/`.
- **Custom domains** (`wrangler.jsonc`):
  - `datosmexico.org` (`custom_domain: true`)
  - `www.datosmexico.org` (`custom_domain: true`)
- **Compatibility flags**: `nodejs_compat`, `global_fetch_strictly_public`.
- **Asset binding**: `.open-next/assets` → `ASSETS`.
- **Observability**: habilitada (`observability.enabled: true`).
- **Output directory esperado**: `.open-next/` (entry worker:
  `.open-next/worker.js`; assets: `.open-next/assets/`).
- **Env vars requeridas en build**: ninguna en código del sitio
  (`grep -rn "process\.env\." …` → 0 matches). El backend tiene URL
  hardcodeada en `lib/api/fetcher.ts`.
- **Deploys recientes** (`wrangler deployments list --name datosmexico`):

  | Created (UTC) | Version ID |
  |---|---|
  | 2026-05-08T22:57:10Z | f5a048f5-… |
  | 2026-05-08T23:09:00Z | aeae00de-… |
  | 2026-05-08T23:18:47Z | 7f1ccbeb-… |
  | 2026-05-08T23:28:34Z | 37aada0b-… |
  | 2026-05-10T04:34:39Z | 635170c5-… |
  | 2026-05-11T05:48:34Z | b2e83e1c-… |
  | 2026-05-13T17:17:23Z | 8e5c8147-… |
  | 2026-05-14T06:24:26Z | cb2fcee9-… |
  | 2026-05-17T12:08:08Z | afd3100f-… |
  | **2026-05-18T16:33:43Z** | **cfd30578-…** (más reciente; corresponde al commit `20cfbb6` "fix(favicon) v2") |

  Diez deploys visibles. El más reciente (~2026-05-18) es ~7 min después
  del commit (`16:26:29Z` → `16:33:43Z`), consistente con
  auto-deploy via Cloudflare Workers Builds (declarado en `README.md`).
- **Branch que dispara deploy**: `main` (según `README.md`).
- **Smoke check producción** (`curl -sSI https://datosmexico.org/`):
  - `HTTP/2 200`
  - `server: cloudflare`
  - `x-powered-by: Next.js`
  - `x-opennext: 1`
  - `x-nextjs-cache: MISS` (en ese request específico — varía por
    edge/PoP)
  - `cache-control: s-maxage=31536000`
  - `strict-transport-security: max-age=31536000`
  - `x-content-type-options: nosniff`

- **WhoAmI** (cuenta usada para el inventario):
  `davidfernando@dafel.com.mx`, account ID `1f0e02cff3791c3ffbb95cd155fc4305`,
  scopes incluyen `workers (write)`, `workers_scripts (write)`,
  `workers_routes (write)`, `workers_tail (read)`, `d1 (write)`,
  `workers_kv (write)`.

### Comandos / queries

```bash
wrangler whoami
wrangler pages project list           # datosmexico NO aparece
wrangler deployments list --name datosmexico   # 10 entradas visibles
curl -sSI --max-time 10 https://datosmexico.org/
```

### Observaciones neutras

- El listado de `wrangler deployments list` muestra `Author:
  davidfernando@dafel.com.mx` y `Source: Unknown (deployment)` para
  cada entrada — el backend de Cloudflare Workers Builds no expone la
  fuente como "GitHub" en esta API, sino que aparece como deploy genérico.
- `compatibility_date: "2026-04-01"` es ~2 meses anterior al día actual.
  No es bloqueante; se observa para registro.
- `routes` declara `custom_domain: true` sin path patterns — captura
  todo el tráfico hacia los dominios.
- El binding `ASSETS` está declarado pero el código del sitio no lo lee
  directamente (lo usa OpenNext internamente para servir assets
  estáticos).

---

## Dimensión 11 — CI/CD (GitHub Actions)

### Hallazgos

- **No existe `.github/` en el repo**:
  ```
  $ ls -la .github
  ls: .github: No such file or directory
  ```
- No hay workflows de typecheck, lint, tests, ni build verification.
- El **auto-deploy** del README está implementado por **Cloudflare
  Workers Builds** (no por GitHub Actions). La integración Git vive del
  lado de Cloudflare, no en este repo.
- No hay workflow de drift detection contra el backend API.

### Comandos / queries

```bash
ls -la .github 2>&1                                # → No such file
find .github -type f 2>&1                          # → No such file
gh run list --limit 5 2>&1 || true                 # (no aplicable, no hay workflows)
```

### Observaciones neutras

- El typecheck previo a deploy queda implícito en `opennextjs-cloudflare
  build` (que llama `next build`, que falla si `tsc` falla con
  `strict: true`). Linting, formateo, tests no se ejecutan en pipeline.
- Si el auto-deploy en Cloudflare Workers Builds falla, no hay un GitHub
  status check sobre el commit ni un PR comment automatizado — la
  visibilidad del fallo vive fuera de GitHub.

---

## Dimensión 12 — Tests

### Hallazgos

- **No hay carpetas de tests**:
  ```bash
  find . -type d \( -name __tests__ -o -name tests -o -name e2e -o -name test \) \
    -not -path "*/node_modules/*" -not -path "*/.next/*"
  # → vacío
  ```
- **No hay archivos `*.test.*` ni `*.spec.*`** en el repo (excluyendo
  `node_modules`).
- **No hay configuración** de Jest, Vitest ni Playwright:
  `ls vitest.config* jest.config* playwright.config* 2>&1 | grep -v "No such"`
  → vacío.
- **No hay script `test` en `package.json`** — sólo `dev`, `build`,
  `start`, `lint`, `generate:brand`, `deploy`.

### Comandos / queries

```bash
find . -type d \( -name __tests__ -o -name tests -o -name e2e -o -name test \) \
       -not -path "*/node_modules/*" -not -path "*/.next/*"
find . -type f \( -name "*.test.*" -o -name "*.spec.*" \) \
       -not -path "*/node_modules/*" -not -path "*/.next/*"
ls vitest.config* jest.config* playwright.config* 2>&1 | grep -v "No such"
jq -r '.scripts | keys[]' package.json
```

### Observaciones neutras

- La única validación automatizada del sitio hoy es el `tsc` que ocurre
  dentro de `next build` (`strict: true`, `noEmit: true`). No hay tests
  unitarios de `lib/api/fetcher.ts`, ni snapshot tests de páginas
  renderizadas, ni tests E2E de las rutas que servimos.
- No hay tests que detecten el drift entre `lib/api/types.ts` y el
  schema live (ver D4 §"Drift detection") — es exactamente el tipo de
  test que podría descubrirlo automáticamente.

---

## Dimensión 13 — Seguridad

### Hallazgos

- **Secrets en patrones comunes**:
  ```bash
  git grep -inE "password\s*=|secret\s*=|api[_-]?key\s*=|token\s*=" \
    -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.json' '*.yml' '*.toml'
  # → vacío
  ```
- **`.env` en historia git**:
  ```bash
  git log --all --diff-filter=A --name-only --pretty=format: \
    | grep -E "\.env(\.[a-z]+)?$" | sort -u
  # → vacío (ningún .env ha sido versionado)
  ```
- **Tokens hardcodeados (patrones típicos)**:
  ```bash
  git grep -E "(eyJ[A-Za-z0-9_-]{20,}|sk_live_|sk_test_|ghp_|gho_|github_pat_|AKIA[A-Z0-9]{16}|xoxb-)" \
    -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.json' '*.yml' '*.toml' '*.md' '*.mdx'
  # → 1 falso positivo en package-lock.json:
  #   "integrity": "sha512-V7Qr52IhZmdKPVr+Vtw8o+WLsQJYCTd8loIfpDaMRWGUZfBOYEJeyJIkqGIDMZPwPx24pUMfwSxxI8phr/MbOA=="
  # (es un hash SHA-512 de integridad de un paquete npm — no es un token).
  ```
- **`process.env.*` en código del sitio**: cero usos.
  ```bash
  grep -rn "process\.env\." --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.open-next --exclude-dir=.wrangler .
  # → vacío
  ```
- **`.gitignore`** excluye `.env*` (línea 30: `.env*`).
- **Variables de entorno declaradas** en build/deploy: ninguna requerida
  por el código del sitio (el backend URL está hardcodeado en
  `lib/api/fetcher.ts:1` como `https://api.datos-itam.org`).

### Comandos / queries

(Ver bloques arriba — todos reproducibles.)

### Observaciones neutras

- **Sin hallazgos de seguridad bloqueantes.**
- El backend del observatorio (`api.datos-itam.org`) es público y no
  requiere tokens para los endpoints de lectura que el sitio consume —
  por eso el sitio no necesita env vars. Si el backend en el futuro
  exigiera autenticación para endpoints de lectura, el sitio
  necesitaría introducir un secret y un mecanismo de inyección.
- El header `User-Agent: datosmexico.org/build` que el sitio envía es
  identificable. No transporta secret, sólo identifica al cliente.

---

## Dimensión 14 — Coherencia cross-frente del observatorio

### 14.1 Coherencia de prosa institucional (sitio vs backend post-FASE 2)

- **Backend live** (`info.description`, descarga via
  `curl -sS https://api.datos-itam.org/openapi.json | jq -r '.info.description'`):

  > "Respaldo institucional: Iniciativa de investigación con respaldo
  > institucional del ITAM. **Posicionamiento completo en
  > [datosmexico.org/quienes-somos](https://datosmexico.org/quienes-somos)**."

  Confirmado: la spec live del backend linkea explícitamente al sitio
  canónico como fuente de posicionamiento. Esto es coherente con la
  cláusula constitucional "Camino C".

- **Sitio `/quienes-somos`** (`page.tsx` metadata + componentes
  `Hero`/`Historia`/`Gobernanza`): se autodescribe como "observatorio
  académico independiente formado por estudiantes y egresados del ITAM"
  + relato histórico de la transición Datos ITAM → Datos México.

- **Coherencia**: ambos lados usan formulaciones compatibles. El backend
  no contradice al sitio, y el sitio no contradice al backend.

### 14.2 Coherencia de identidad visual (sitio canónico vs laboratorio
`datos-itam.org`)

No se inspeccionó el código del laboratorio en esta sesión (vive en otro
repo, `DabtcAvila/datos-itam`). Verificación parcial via smoke check:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' --max-time 10 https://datos-itam.org/
# → no ejecutado en esta sesión (no requerido para inventario del sitio canónico)
```

**No verificable en esta sesión** sin clonar/leer el repo del backend.

### 14.3 Coherencia de cifras citadas

Cifras citadas explícitamente por el sitio:

| Cifra (sitio) | Lugar | Cifra equivalente (backend FASE 1+2) | Coincide |
|---|---|---|---|
| 38.8M hogares analizados | `DataStrip` (home) + ENIGH MDX | "38.8M hogares nacional" (ENIGH) | ✓ |
| 91,414 hogares muestra | ENIGH MDX | 91,414 hogares muestra | ✓ |
| 246,831 servidores CDMX | `DataStrip` + Visualization CDMX KPI + CDMX MDX | "246K registros de servidores públicos CDMX" | ✓ |
| $10.13 billones SAR | `DataStrip` + SAR MDX + PulsoHero | "10.13 billones de pesos" (junio 2025) | ✓ |
| 13/13 validaciones INEGI passing | `DataStrip` + Pipeline metodologia + caveat ENIGH MDX | "13 bounds oficiales INEGI reproducidos al peso (Δ máx 0.078%)" | ✓ |
| 326 meses CONSAR | (no citado en sitio) | 326 meses (1998-05 a 2025-06) | n/a |
| 35,617 filas CONSAR | (no citado en sitio) | 35,617 filas | n/a |
| 101.5M filas ENOE | (no citado en sitio) | 101.5M filas (microdatos ENOE) | n/a — el sitio **no consume ENOE** hoy |
| **"78 endpoints públicos"** | `components/metodologia/AccesoProgramatico.tsx:11` (sección "Acceso programático") | **114 operaciones** en spec live (`jq '[.paths[] \| to_entries[] \| select(.key \| test("^(get\|post\|put\|delete\|patch\|options\|head)$"))] \| length' /tmp/openapi-live.json`) | **✗ DRIFT** |
| 11 AFOREs activas | SAR MDX | (consistente con spec live: `data.afores` array) | ✓ |
| 75 sectores CDMX | CDMX MDX (KPI deriva de `dashboardStats.totalSectors`) | 75 (consistente con runtime) | ✓ |

**Drift único detectado**: el sitio dice que el SDK cubre **78
endpoints**; la realidad live es **114 operaciones**. La cifra "78"
podría corresponder a una versión anterior del SDK o a una cuenta
distinta (e.g. excluyendo `/admin/*`, `/auth/*`, endpoints de write —
pero no se confirmó).

### 14.4 Coherencia de links cross-frente

Verificación de presencia (`grep -n`) y status HTTP de cada destino:

| Link declarado en sitio | Presencia en código | Smoke check |
|---|---|---|
| `https://datos-itam.org` (laboratorio) | `components/sections/Hero.tsx:26` (Button "Explora el observatorio"), `components/quienes-somos/Historia.tsx:32`, `lib/design-tokens.ts:43` (nav item "Observatorio"), `app/layout.tsx:121` (`sameAs` JSON-LD), `app/styleguide/page.tsx:136` | no ejecutado smoke (fuera de scope inventario sitio canónico) |
| `https://api.datos-itam.org/docs` | `components/layout/Footer.tsx:11`, `components/prensa/Recursos.tsx:45`, `components/metodologia/AccesoProgramatico.tsx:68`, `components/metodologia/Auditoria.tsx:33` | (no smoke en este pass; la URL base sí responde — `curl /openapi.json` funcionó) |
| `pip install datos-mexico` (SDK PyPI) | `components/metodologia/AccesoProgramatico.tsx:24` | n/a (texto de instrucción) |
| `https://github.com/datos-mexico/datos-mexico-py` | `components/layout/Footer.tsx:10`, `components/metodologia/AccesoProgramatico.tsx:48`, `components/metodologia/Auditoria.tsx:28`, `public/llms.txt`, `README.md`, `components/quienes-somos/Contacto.tsx` (GitHub social) | no smoke; URL minúsculas es válida (GitHub case-insensitive). Org real es `Datos-Mexico`. |
| `https://docs.datosmexico.org` | `components/layout/Footer.tsx:13`, `components/metodologia/AccesoProgramatico.tsx:59` | **200** (verificado: `curl -sS -o /dev/null -w '%{http_code}\n' https://docs.datosmexico.org/`) |

### 14.5 Coherencia con la constitución del observatorio

La constitución pide que el sitio canónico declare:

| Cláusula | Declaración del sitio | Cumple |
|---|---|---|
| Es el **canónico** | El dominio del sitio (`datosmexico.org`) y los `canonical: "/…"` en metadata lo declaran implícitamente. No hay frase explícita "este es el sitio canónico del observatorio". | Implícito |
| ITAM = **respaldo institucional**, no dueño | `components/quienes-somos/Historia.tsx:53-55`: "Pero la organización ya no es del ITAM, ni representa al ITAM. Somos un observatorio independiente." | Explícito ✓ |
| Observatorio **portable** | No hay declaración explícita de portabilidad ("si la relación con ITAM cambia en el futuro, el observatorio sobrevive"). La Historia declara que ya pasó de ser "proyecto académico privado" a "observatorio público de datos sobre México, con alcance nacional y vocación de servicio". | Parcial |

### 14.6 Coherencia interna del sitio (cifras y contenidos)

Tres inconsistencias internas detectadas (cero entre frentes, todas
dentro del propio sitio):

1. **Cadencia del boletín — tres ritmos distintos**:
   - `components/sections/Newsletter.tsx:13`: "Boletín **quincenal** con
     los últimos análisis del observatorio."
   - `components/boletin/Preguntas.tsx:23`: "Aproximadamente **entre 3 y 5
     envíos por semana**".
   - `components/boletin/Formatos.tsx`: Análisis profundo (cadencia
     **Mensual**), Notas breves (**Semanal**), Comentarios de coyuntura
     (**Cuando publica la fuente**).
2. **Preview de publicaciones en el home vs registry real**
   (`components/sections/Publicaciones.tsx`): 3 cards hardcodeadas:

   | Card preview (sitio home) | MDX real (`content/publicaciones/`) | Match |
   |---|---|---|
   | "Servidores públicos CDMX: el 88% gana menos de 20 mil pesos al mes" (`22 abr 2026`, `/publicaciones`) | "Servidores públicos de la Ciudad de México: una primera lectura" (`2026-05-04`, `/publicaciones/servidores-publicos-cdmx`) | ✗ |
   | "El SAR mexicano supera los 10 billones de pesos: composición y caveats" (`18 abr 2026`) | "El SAR mexicano administra más de diez billones de pesos: composición y AFOREs" (`2026-05-04`) | ✗ |
   | "Nuevo León supera a la CDMX en ingreso por hogar: lo que dice la ENIGH 2024" (`12 abr 2026`) | **no existe** en `content/publicaciones/` | ✗ |

   Las 3 `href` apuntan a `/publicaciones` (no a slugs específicos).
3. **`/manifiesto` y `/equipo` referenciados en este prompt pero
   inexistentes en producción**: detectado en D3, registrado aquí como
   coherencia.

### Comandos / queries

```bash
curl -sS https://api.datos-itam.org/openapi.json | jq -r '.info.description'
grep -rn "datos-itam.org\|api.datos-itam.org\|docs.datosmexico.org\|pip install datos-mexico\|github.com/datos-mexico" \
  --include="*.tsx" --include="*.ts" --include="*.mdx" --include="*.md" --include="*.json" .
curl -sS -o /dev/null -w '%{http_code}\n' https://docs.datosmexico.org/   # → 200
# Backend FASE 1+2: gh api repos/DabtcAvila/datos-itam/contents/docs/internal/audit-2026-05/fase-1-inventario.md
#   NOT ejecutado en esta sesión por restricción "no clonar otros repos"
```

### Observaciones neutras

- La auditoría no rompió la restricción de no clonar otros repos; las
  cifras del backend FASE 1+2 se compararon contra (a) prosa pública
  del propio backend (vía `/openapi.json`) y (b) lo declarado en este
  prompt sobre el commit `19f6a20`.
- Si la relación SDK-vs-backend cambia (e.g. el SDK alcanza paridad con
  el backend), el número "78 endpoints" debería actualizarse —
  registrado, no diagnosticado.
- El sitio enlaza correctamente a los tres frentes restantes (backend
  API, SDK pip + repo GitHub, docs). El laboratorio (`datos-itam.org`)
  está enlazado en hero, footer e Historia.

---

## Apéndice A — Comandos completos para reproducir el inventario

Bloques aglomerados, en el orden en que se ejecutaron:

```bash
# Working dir
cd "/Users/davicho/Datos México/datosmexico"

# D1 — repo
git fetch origin
git status
git rev-parse HEAD
git log -1 --format=fuller
git log --oneline -20
git submodule status
git branch -a
ls -lah
cat .gitignore
du -sh app/ components/ content/ lib/ public/ scripts/
find . -maxdepth 3 \( -path ./node_modules -o -path ./.next -o -path ./.git \
  -o -path ./out -o -path ./dist -o -path ./.open-next -o -path ./.wrangler \) \
  -prune -o -print | sort | wc -l   # → 179

# D2 — stack
cat package.json next.config.ts wrangler.jsonc open-next.config.ts \
    tsconfig.json eslint.config.mjs postcss.config.mjs mdx-components.tsx
ls -la .nvmrc .node-version 2>&1
ls -la package-lock.json pnpm-lock.yaml yarn.lock 2>&1
wc -l package-lock.json
node --version

# D3 — rutas
find app -type f \( -name "page.tsx" -o -name "route.ts" -o -name "layout.tsx" \) | sort
for url in / /quienes-somos /manifiesto /equipo /publicaciones /contacto \
            /prensa /boletin /metodologia /dash-mapa01 /styleguide \
            /feed.xml /sitemap.xml /robots.txt /llms.txt; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 12 -L \
    "https://datosmexico.org$url")
  echo "$code  https://datosmexico.org$url"
done
for slug in servidores-publicos-cdmx sar-recursos-administrados \
            hogares-mexicanos-enigh-2024; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 \
    "https://datosmexico.org/publicaciones/$slug")
  echo "$code  /publicaciones/$slug"
done
curl -sSI --max-time 10 https://datosmexico.org/

# D4 — API consumo + drift
grep -rn "fetchApiData\|api\.datos-itam\.org\|/api/v1/" --include="*.ts" \
  --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next .
cat lib/api/types.ts lib/api/fetcher.ts
curl -sS https://api.datos-itam.org/openapi.json -o /tmp/openapi-live.json
jq '[.paths[] | to_entries[] | select(.key | test("^(get|post|put|delete|patch|options|head)$"))] | length' /tmp/openapi-live.json
jq '.paths | keys | length' /tmp/openapi-live.json
jq '.components.schemas | keys | length' /tmp/openapi-live.json
jq '.components.schemas.DashboardStats' /tmp/openapi-live.json
jq '.components.schemas.HogaresSummary' /tmp/openapi-live.json
jq '.components.schemas.DecilRow' /tmp/openapi-live.json
jq '.components.schemas.TotalesSarResponse' /tmp/openapi-live.json

# D5 — Camino C
grep -rniE "ITAM Bases de Datos|Bases de Datos 2026|semestre 2026|programa de|proyecto académico|el autor" \
  --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" \
  --include="*.mdx" --include="*.md" --include="*.json" --include="*.yml" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git \
  --exclude-dir=out --exclude-dir=dist --exclude-dir=.open-next \
  --exclude-dir=.wrangler .
grep -rni "ITAM" --include="*.tsx" --include="*.ts" --include="*.mdx" \
  --include="*.md" --include="*.json" --exclude-dir=node_modules \
  --exclude-dir=.next --exclude-dir=.git .
cat app/\(marketing\)/quienes-somos/page.tsx
cat components/quienes-somos/{Hero,MisionVision,Historia,Equipo,Asesoria,Acompanamiento,Areas,Gobernanza,Contacto,MemberCard,AreaCard}.tsx

# D6 — Publicaciones MDX
ls -la content/publicaciones/
for f in content/publicaciones/*.mdx; do
  echo "$f"; wc -l "$f"; wc -w "$f"; head -16 "$f"
done

# D7 — Equipo
cat lib/team.ts lib/asesores.ts lib/academicos.ts

# D8 — Componentes
find components -type f -name "*.tsx" | wc -l
find components -type f -name "*.tsx" | sort
grep -rln "^\"use client\"" components/

# D9 — Branding
cat app/globals.css lib/design-tokens.ts public/manifest.json public/browserconfig.xml
ls -la public/brand/ public/og/

# D10 — Build/deploy
wrangler whoami
wrangler pages project list
wrangler deployments list --name datosmexico

# D11 — CI/CD
ls -la .github 2>&1
find .github -type f 2>&1

# D12 — Tests
find . -type d \( -name __tests__ -o -name tests -o -name e2e -o -name test \) \
  -not -path "*/node_modules/*" -not -path "*/.next/*"
find . -type f \( -name "*.test.*" -o -name "*.spec.*" \) \
  -not -path "*/node_modules/*" -not -path "*/.next/*"
ls vitest.config* jest.config* playwright.config* 2>&1
jq -r '.scripts | keys[]' package.json

# D13 — Seguridad
git grep -inE "password\s*=|secret\s*=|api[_-]?key\s*=|token\s*=" \
  -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.json' '*.yml' '*.toml'
git log --all --diff-filter=A --name-only --pretty=format: \
  | grep -E "\.env(\.[a-z]+)?$" | sort -u
git grep -E "(eyJ[A-Za-z0-9_-]{20,}|sk_live_|sk_test_|ghp_|gho_|github_pat_|AKIA[A-Z0-9]{16}|xoxb-)" \
  -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.json' '*.yml' '*.toml' '*.md' '*.mdx'
grep -rn "process\.env\." --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.next .

# D14 — Cross-frente
curl -sS https://api.datos-itam.org/openapi.json | jq -r '.info.description'
curl -sS -o /dev/null -w '%{http_code}\n' https://docs.datosmexico.org/
grep -rn "datos-itam.org\|api.datos-itam.org\|docs.datosmexico.org\|pip install datos-mexico\|github.com/datos-mexico" \
  --include="*.tsx" --include="*.ts" --include="*.mdx" --include="*.md" \
  --include="*.json" --exclude-dir=node_modules --exclude-dir=.next .
```

---

## Apéndice B — No verificables hoy

| # | Item | Razón concreta |
|---|---|---|
| B1 | Coherencia visual del laboratorio `datos-itam.org` (D14.2) | Restricción: "no clonar otros repos del observatorio localmente"; no se inspeccionó el repo del backend para comparar paleta/tipografía/logo. Smoke check del laboratorio tampoco ejecutado en esta sesión. |
| B2 | Confirmación numérica del "78 endpoints públicos" (D14.3) | El sitio dice 78; el backend live tiene 114 operaciones. No se inspeccionó el SDK (`Datos-Mexico/datos-mexico-py`) para confirmar cuántos endpoints cubre hoy realmente y desambiguar el origen del "78". Restricción: "no clonar otros repos". |
| B3 | Drift de schemas SarPorAfore / SarPorComponente / SarImssVsIssste / EnighGastoRubro (D4) | Sólo se verificó la coincidencia campo-a-campo de DashboardStats, HogaresSummary, DecilRow, TotalesSarResponse. Para los restantes 4 se confirmó únicamente la existencia del endpoint en spec live, no la equivalencia campo-a-campo. |
| B4 | `tree -L 3` (D1) | Comando `tree` no disponible en la máquina (`tree: command not found`). Sustituido por `find -maxdepth 3` con la misma utilidad. |
| B5 | `wrangler pages project list` para `datosmexico` (D10) | El sitio no es un Pages project sino un Worker, por lo que `wrangler pages project list` no lo enumera por diseño. Verificado vía `wrangler deployments list --name datosmexico`. No es una limitación; se registra para evitar confusión futura. |
| B6 | Cifras del backend FASE 1+2 comparadas contra el reporte fuente | Restricción: "no clonar otros repos del observatorio localmente". Se confirmó la spec live actual, y se contrastó con las cifras que el prompt cita haberse registrado en `DabtcAvila/datos-itam/docs/internal/audit-2026-05/fase-1-inventario.md`. No se descargó ese reporte en esta sesión. |
| B7 | Status HTTP del laboratorio y de la documentación API en este pass | Sólo se ejecutó smoke check sobre `datosmexico.org` (todas sus rutas), `docs.datosmexico.org` (200), y `api.datos-itam.org/openapi.json` (200 implícito por descarga exitosa). No se hizo smoke check explícito de `datos-itam.org/` (laboratorio) ni de `api.datos-itam.org/docs` (Swagger UI). |
| B8 | Tests con backend real (D12) | No hay tests en absoluto en el repo, así que la restricción "no ejecutar tests contra backend real" no aplica. Se registra para cerrar el item del prompt. |
