# Datos México — datosmexico.org

Sitio público institucional de **Datos México**, observatorio independiente
de datos públicos de México formado por estudiantes y egresados del ITAM.

> Producción: **https://datosmexico.org**
> Workers preview: deshabilitado en este deploy (ver "Preview URLs" abajo).

---

## Pendientes (placeholders en código)

Buscar `[PENDIENTE` en el código para encontrarlos. Hoy hay:

- **Logo SVG real** — actualmente se usa wordmark "Datos México" en Source Serif (`components/layout/Logo.tsx`).
- **Aliados / respaldos institucionales** — sección "Quiénes somos" del home (`components/sections/QuienesSomosPreview.tsx`).
- **Repositorio público (GitHub)** — link en footer (`components/layout/Footer.tsx`).
- **API documentación** — link en footer (`components/layout/Footer.tsx`).
- **Twitter / X y LinkedIn** — handles en footer.
- **Integración del newsletter** — el form solo muestra "Gracias, pronto te contactaremos." Hay que conectarlo a Mailchimp / Buttondown / ConvertKit (`components/sections/Newsletter.tsx`).
- **Open Graph image** (`/og-image.png`) — declarado en metadata pero el archivo no existe. Generar 1200×630.
- **Favicon real** — el actual es el default de create-next-app.

---

## Decisiones técnicas que vale la pena conocer

- **Next.js 16.2.4 / React 19.2.4 / Tailwind v4**: `create-next-app` instaló estas versiones (el spec original pedía Next 15, pero la versión actual estable es 16). App Router se usa igual; las rutas/UI no cambian. La diferencia principal vs Next 15 es que `params`/`searchParams`/`cookies()`/`headers()` ahora son siempre async, y `middleware` se renombró a `proxy`. No usamos esas APIs en este prompt.
- **Despliegue: Cloudflare Workers via `@opennextjs/cloudflare`**, no Vercel. El usuario pidió wrangler. Esto requiere `nodejs_compat` y `global_fetch_strictly_public`. El sitio funciona como Worker estático (todas las rutas son `○ Static`).
- **`@/*` alias** ya configurado en `tsconfig.json` apunta a la raíz del proyecto.
- **Tipografías**: Source Serif 4 / Inter / JetBrains Mono via `next/font/google` con `display: 'swap'`. Mapeadas a `--font-serif`, `--font-sans`, `--font-mono` en `globals.css`.
- **Tokens**: definidos como CSS custom properties en `globals.css` y mapeados a Tailwind via `@theme inline`. La copia TypeScript vive en `lib/design-tokens.ts` para uso programático (ej. styleguide).
- **Componentes**: ninguna dependencia pesada de UI. shadcn no se instaló como CLI: en lugar de eso construí `Button`, `Input`, `Card`, `Badge` a mano en `components/ui/` siguiendo la convención (cva + tailwind-merge + radix-style API). Esto evita arrastrar el ecosistema entero de Radix por unos cuantos componentes.
- **MDX**: `@next/mdx` configurado en `next.config.ts` (`pageExtensions` incluye `md` y `mdx`). Sin uso aún — listo para `/publicaciones`.
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
- `/styleguide` — design system (no listado en nav)
- `/publicaciones`, `/metodologia`, `/quienes-somos`, `/contacto` — devuelven 404 (links en nav, sin implementar)

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

---

## SEO

- Metadata completa en `app/layout.tsx`: `title` template, `description`,
  `openGraph`, `twitter`, `robots`, `canonical`, `keywords`.
- JSON-LD `Organization` injectado en `<head>` del root layout.
- `app/robots.ts` produce `/robots.txt` con disallow para `/styleguide`.
- `app/sitemap.ts` produce `/sitemap.xml`.

---

## Lo que NO está hecho (intencionalmente)

- Páginas internas: `/quienes-somos`, `/publicaciones`, `/metodologia`, `/contacto`.
- Modo oscuro.
- i18n.
- Animaciones avanzadas.
- Integración real del newsletter.
- Logo SVG.
- OG image.

Esos quedan para prompts siguientes.
