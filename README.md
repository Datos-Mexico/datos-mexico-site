# Datos México — datosmexico.org

Sitio público institucional de **Datos México**, observatorio independiente
de datos públicos de México, formado por estudiantes, egresados y
colaboradores del ITAM.

> Producción: **https://datosmexico.org**
> Workers preview: deshabilitado en este deploy (ver "Preview URLs" abajo).

---

## Sistemas vivos (ya operando en producción)

- **`/modelo`** — documento doctrinal del observatorio, público y vivo. Articula las tres capas de trabajo, la regla de independencia, sostenibilidad, gobernanza y compromisos asociados. Pieza maestra de la fase de difusión.
- **Newsletter** — captura real. El form (`components/newsletter/NewsletterForm.tsx`) usa `liveSubmit` que hace POST a `/api/newsletter/subscribe`. El endpoint persiste en D1 (`datosmexico-newsletter`, binding `NEWSLETTER_DB`) y dispara correo de confirmación vía Resend; doble opt-in con páginas `/boletin/confirmacion` y `/boletin/baja`. Lo que falta es el agregador/envío del boletín periódico, no la plomería.
- **Logo SVG** — variantes color, mono-blanco y mono-negro vivas en `public/brand/logo*.svg`. `components/layout/Logo.tsx` las consume.
- **Descargables del kit de prensa** — `public/brand/datos-mexico-logos.zip` y `public/brand/datos-mexico-kit-prensa.pdf` están publicados y enlazados desde `components/prensa/Recursos.tsx` (botones activos, no "Próximamente").

## Pendientes (placeholders en código)

Buscar `[PENDIENTE` en el código para encontrarlos. Hoy hay:

- **Aliados / respaldos institucionales** — sección "Quiénes somos" del home (`components/sections/QuienesSomosPreview.tsx`).
- **Handles de redes y contacto** — `components/contacto/Redes.tsx`, `components/contacto/Preguntas.tsx` y `components/quienes-somos/Contacto.tsx` tienen marcadores `[PENDIENTE]` para handles reales y links de repositorio.
- **Fotos del equipo** — los miembros en `lib/team.ts` tienen `photo: undefined`; `MemberCard` renderiza Avatar con iniciales como fallback. Pendiente: fotos reales para cada miembro.

Asuntos institucionales fuera del código (visibles en UI como estado actual del proyecto, no como TODOs):

- **Constitución como Asociación Civil** — operación informal hoy; trámite en fase preparatoria. Estado declarado explícitamente en `/quienes-somos` (sección Gobernanza).

---

## Decisiones técnicas que vale la pena conocer

- **Next.js 16.2.4 / React 19.2.4 / Tailwind v4**: `create-next-app` instaló estas versiones (el spec original pedía Next 15, pero la versión actual estable es 16). App Router se usa igual; las rutas/UI no cambian. La diferencia principal vs Next 15 es que `params`/`searchParams`/`cookies()`/`headers()` ahora son siempre async, y `middleware` se renombró a `proxy`. No usamos esas APIs en este prompt.
- **Despliegue: Cloudflare Workers via `@opennextjs/cloudflare`**, no Vercel. El usuario pidió wrangler. Esto requiere `nodejs_compat` y `global_fetch_strictly_public`. El sitio funciona como Worker estático (todas las rutas son `○ Static`).
- **`@/*` alias** ya configurado en `tsconfig.json` apunta a la raíz del proyecto.
- **Tipografías**: Source Serif 4 / Inter / JetBrains Mono via `next/font/google` con `display: 'swap'`. Mapeadas a `--font-serif`, `--font-sans`, `--font-mono` en `globals.css`.
- **Tokens**: definidos como CSS custom properties en `globals.css` y mapeados a Tailwind via `@theme inline`. La copia TypeScript vive en `lib/design-tokens.ts` para uso programático (ej. styleguide).
- **Componentes**: ninguna dependencia pesada de UI. shadcn no se instaló como CLI: en lugar de eso construí `Button`, `Input`, `Card`, `Badge` a mano en `components/ui/` siguiendo la convención (cva + tailwind-merge + radix-style API). Esto evita arrastrar el ecosistema entero de Radix por unos cuantos componentes.
- **MDX**: `@next/mdx` configurado en `next.config.ts` (`pageExtensions` incluye `md` y `mdx`). En uso para los artículos largos de `/publicaciones` (los `.mdx` viven en `content/publicaciones/`).
- **Custom domain**: configurado en `wrangler.jsonc` con `routes: [{ pattern: "datosmexico.org", custom_domain: true }, ...]`. La zona ya estaba en la cuenta Cloudflare.
- **Workers.dev URL**: se deshabilitó por defecto al agregar `routes`. Si quieres preview por subdominio agrega `"workers_dev": true` y `"preview_urls": true` a `wrangler.jsonc`.

---

## Estructura

```
app/
  (marketing)/         ← grupo de rutas con header + footer
    layout.tsx         ← Header + Footer wrap
    page.tsx           ← home
  styleguide/
    page.tsx           ← /styleguide (no listado en nav, robots:noindex)
  globals.css          ← tokens CSS + @theme inline + reset
  layout.tsx           ← root: html/body, fuentes, metadata, JSON-LD
  robots.ts
  sitemap.ts
components/
  layout/              ← Header, Footer, Container, Logo
  sections/            ← Hero, DataStrip, QuienesSomosPreview, Principios,
                          Publicaciones, Metodologia, Newsletter
  typography/          ← Display, H1-H3, Lead, Body, Small, Mono, Eyebrow
  ui/                  ← Button, Input, Card, Badge, ExternalLinkIcon
lib/
  design-tokens.ts     ← tokens TS + nav config + brand strings
  utils.ts             ← cn helper (clsx + tailwind-merge)
open-next.config.ts    ← Cloudflare adapter config
wrangler.jsonc         ← Cloudflare Workers config
next.config.ts         ← MDX + turbopack root + image config
```

---

## Setup local

```bash
npm install
npm run dev
# → http://localhost:3000
```

Páginas:
- `/` — home
- `/quienes-somos` — equipo, misión/visión, historia, asesoría, áreas, gobernanza, contacto
- `/preguntas` y `/preguntas/[slug]` — corpus pregunta-respuesta del observatorio (lee `.observatorio/preguntas/*.md` en build)
- `/publicaciones` y `/publicaciones/[slug]` — registry estático con artículos del observatorio
- `/transparencia` y `/transparencia/[slug]` — encargos de prensa (lee `content/transparencia/*.md` en build)
- `/prensa` — recursos para prensa (voceros, citación, descargables, FAQs)
- `/agenda` — calendario semestral de actividades
- `/modelo` — modelo institucional del observatorio (documento doctrinal: tres capas, regla de independencia, sostenibilidad, gobernanza, compromisos)
- `/metodologia`, `/contacto`, `/boletin`, `/privacidad` — landing pages institucionales
- `/boletin/confirmacion`, `/boletin/baja` — páginas del flujo doble opt-in del newsletter
- `/dash-mapa01` — visualización geográfica (sandbox)
- `/styleguide` — design system (no listado en nav, `robots: noindex`)

---

## Build local

```bash
npm run build      # build Next.js solo (verifica TS + Turbopack)
npx tsc --noEmit   # type-check sin build
```

---

## Deploy a Cloudflare Workers

Necesitas estar autenticado: `wrangler login`.

```bash
# build + deploy en un solo paso
npx opennextjs-cloudflare build && npx opennextjs-cloudflare deploy
```

Esto:
1. Corre `next build`.
2. Empaqueta el output con `@opennextjs/cloudflare` en `.open-next/`.
3. Sube assets estáticos y el worker a Cloudflare.
4. Actualiza las routes `datosmexico.org` y `www.datosmexico.org`.

Para previsualizar localmente el bundle de Cloudflare antes de deploy:

```bash
npx opennextjs-cloudflare build
npx wrangler dev
```

### Auto-deploy desde GitHub

Cada push a `main` dispara un build automático en Cloudflare Workers Builds que despliega el sitio a producción sin intervención manual.

Workflow:

1. Hacés tus cambios en una branch.
2. Commit + push de la branch.
3. Merge ff-only a `main`.
4. `git push origin main`.
5. Cloudflare detecta el push, corre `npm ci && npx opennextjs-cloudflare build` y después `npx opennextjs-cloudflare deploy`.
6. El sitio en datosmexico.org refleja el cambio en 3-6 minutos.

El deploy manual con `npm run deploy` desde local sigue funcionando como fallback.

---

## SEO

- Metadata completa en `app/layout.tsx`: `title` template, `description`,
  `openGraph`, `twitter`, `robots`, `canonical`, `keywords`.
- JSON-LD `Organization` injectado en `<head>` del root layout.
- `app/robots.ts` produce `/robots.txt` con disallow para `/styleguide`.
- `app/sitemap.ts` produce `/sitemap.xml`.

---

## Lo que NO está hecho (intencionalmente)

- Modo oscuro.
- i18n.
- Animaciones avanzadas.
- Envío real del boletín periódico (la captura sí está viva — falta el agregador/composición + envío).
