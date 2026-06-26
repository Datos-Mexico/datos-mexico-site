/**
 * Generates all derived brand assets from the source SVG:
 *   - 4 SVG variants in /public/brand/
 *   - Favicon set in /public/
 *   - 6 Open Graph PNGs in /public/og/
 *
 * Idempotent. Run with: npm run generate:brand
 */

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
// @ts-expect-error — `to-ico` ships no type declarations.
import toIco from "to-ico";
import { ImageResponse } from "@vercel/og";
import React from "react";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");
const BRAND = join(PUBLIC, "brand");
const OG = join(PUBLIC, "og");

const SOURCE_SVG = join(BRAND, "logo-source.svg");

const COLORS = {
  background: "#FAFAF9",
  foreground: "#0A0A0A",
  textSubtle: "#4B5563",
  primary: "#15803D",
};

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(path: string) {
  await mkdir(path, { recursive: true });
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 1: SVG variants
// ─────────────────────────────────────────────────────────────────────────

async function generateSvgVariants() {
  console.log("→ Generating SVG variants…");
  const source = await readFile(SOURCE_SVG, "utf8");

  // 1.1 logo.svg — exact copy of source
  await writeFile(join(BRAND, "logo.svg"), source, "utf8");

  // 1.2 logo-mono-white.svg — replace gradient + class colors with white
  const monoWhite = source
    .replace(/stroke="url\(#barGradient\)"/g, 'stroke="#FFFFFF"')
    .replace(/stroke:\s*#BB0201/g, "stroke: #FFFFFF")
    .replace(/stroke:\s*#74B433/g, "stroke: #FFFFFF")
    .replace(/fill:\s*#BB0201/g, "fill: #FFFFFF")
    .replace(/fill:\s*#74B433/g, "fill: #FFFFFF")
    .replace(/fill:\s*#000000/g, "fill: #FFFFFF");
  await writeFile(join(BRAND, "logo-mono-white.svg"), monoWhite, "utf8");

  // 1.3 logo-mono-black.svg — same logic, black
  const monoBlack = source
    .replace(/stroke="url\(#barGradient\)"/g, 'stroke="#000000"')
    .replace(/stroke:\s*#BB0201/g, "stroke: #000000")
    .replace(/stroke:\s*#74B433/g, "stroke: #000000")
    .replace(/fill:\s*#BB0201/g, "fill: #000000")
    .replace(/fill:\s*#74B433/g, "fill: #000000");
  await writeFile(join(BRAND, "logo-mono-black.svg"), monoBlack, "utf8");

  // 1.4 logo-square.svg — wrap inner content in <g translate(0,125)> and bump viewBox
  const square = source
    .replace(
      'viewBox="0 0 1000 750"',
      'viewBox="0 0 1000 1000"',
    )
    .replace(
      /(<\/style>)/,
      '$1\n  <g transform="translate(0, 125)">',
    )
    .replace(/<\/svg>/, "  </g>\n</svg>");
  await writeFile(join(BRAND, "logo-square.svg"), square, "utf8");

  console.log("  ✓ logo.svg");
  console.log("  ✓ logo-mono-white.svg");
  console.log("  ✓ logo-mono-black.svg");
  console.log("  ✓ logo-square.svg");
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 2: Favicons
// ─────────────────────────────────────────────────────────────────────────

async function rasterize(
  svgBuffer: Buffer,
  size: number,
  background: { r: number; g: number; b: number; alpha: number } = {
    r: 0,
    g: 0,
    b: 0,
    alpha: 0,
  },
) {
  return sharp(svgBuffer, { density: 384 })
    .resize(size, size, { fit: "contain", background })
    .flatten(background.alpha === 1 ? { background } : false)
    .png()
    .toBuffer();
}

async function generateFavicons() {
  console.log("→ Generating favicons…");
  const squareSvg = await readFile(join(BRAND, "logo-square.svg"));

  const transparent = { r: 255, g: 255, b: 255, alpha: 0 };
  const offWhite = { r: 250, g: 250, b: 249, alpha: 1 };

  const sizes = [
    { name: "favicon-16x16.png", size: 16, bg: transparent },
    { name: "favicon-32x32.png", size: 32, bg: transparent },
    { name: "favicon-96x96.png", size: 96, bg: transparent },
    { name: "apple-touch-icon.png", size: 180, bg: offWhite },
    { name: "android-chrome-192x192.png", size: 192, bg: transparent },
    { name: "android-chrome-512x512.png", size: 512, bg: transparent },
    { name: "mstile-150x150.png", size: 150, bg: offWhite },
  ] as const;

  for (const { name, size, bg } of sizes) {
    const buf = await rasterize(squareSvg, size, bg);
    await writeFile(join(PUBLIC, name), buf);
    console.log(`  ✓ ${name} (${buf.length} bytes)`);
  }

  // Multi-resolution .ico: 16, 32, 48 PNG buffers packed into ICO
  const icoSizes = [16, 32, 48];
  const icoBuffers = await Promise.all(
    icoSizes.map((s) => rasterize(squareSvg, s, transparent)),
  );
  const icoBuf = await toIco(icoBuffers);
  await writeFile(join(PUBLIC, "favicon.ico"), icoBuf);
  console.log(`  ✓ favicon.ico (${icoBuf.length} bytes, multi-res 16/32/48)`);
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 3: OG images
// ─────────────────────────────────────────────────────────────────────────

// Source the actual font binaries from @fontsource packages installed under
// node_modules. We pick the latin subset (covers Spanish) and use the WOFF
// format because Satori (the engine inside @vercel/og) accepts it directly.
const FONT_FILES = {
  "SourceSerif4-Bold":
    "@fontsource/source-serif-4/files/source-serif-4-latin-700-normal.woff",
  "Inter-Regular":
    "@fontsource/inter/files/inter-latin-400-normal.woff",
  "Inter-Medium":
    "@fontsource/inter/files/inter-latin-500-normal.woff",
} as const;

async function ensureFonts() {
  const cached: Record<string, Buffer> = {};
  for (const [name, relPath] of Object.entries(FONT_FILES)) {
    const path = join(ROOT, "node_modules", relPath);
    if (!(await exists(path))) {
      throw new Error(
        `Missing font ${name} at ${path}. Run \`npm install\` to fetch @fontsource packages.`,
      );
    }
    cached[name] = await readFile(path);
  }
  return cached;
}

const TAGLINES = {
  "og-default.png":
    "Observatorio de datos de México: del microdato a la conversación pública.",
  "og-quienes-somos.png":
    "Quiénes somos · Un observatorio académico, transparente y en construcción.",
  "og-metodologia.png":
    "Metodología · Cómo construimos cifras que se pueden auditar.",
  "og-boletin.png":
    "Boletín · Análisis profundos, notas breves y comentarios de coyuntura.",
  "og-prensa.png": "Prensa · Recursos para periodistas y medios.",
  "og-contacto.png":
    "Contacto · Canales del observatorio según el tipo de consulta.",
  "og-modelo.png":
    "Modelo · Cómo opera y cómo se sostiene el observatorio.",
} as const;

async function generateOgImages() {
  console.log("→ Generating OG images…");
  const fonts = await ensureFonts();

  // We feed @vercel/og a data URL for the logo so the renderer doesn't need to
  // resolve a relative URL. Read the natural-aspect logo SVG (4:3) and inline.
  const logoSvg = await readFile(join(BRAND, "logo.svg"), "utf8");
  const logoDataUrl = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}`;

  for (const [filename, tagline] of Object.entries(TAGLINES)) {
    const element = React.createElement(
      "div",
      {
        style: {
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: COLORS.background,
          padding: "64px",
          fontFamily: "Inter",
          position: "relative",
        },
      },
      // Logo (240px wide, ~180px tall via 4:3)
      React.createElement("img", {
        src: logoDataUrl,
        width: 240,
        height: 180,
        style: { display: "block" },
      }),
      // Wordmark
      React.createElement(
        "div",
        {
          style: {
            marginTop: "24px",
            fontFamily: "SourceSerif",
            fontWeight: 700,
            fontSize: "56px",
            color: COLORS.foreground,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          },
        },
        "Datos México",
      ),
      // Tagline
      React.createElement(
        "div",
        {
          style: {
            marginTop: "16px",
            fontFamily: "Inter",
            fontWeight: 400,
            fontSize: "32px",
            color: COLORS.textSubtle,
            lineHeight: 1.35,
            maxWidth: "1000px",
          },
        },
        tagline,
      ),
      // Spacer pushes URL to bottom
      React.createElement("div", { style: { flex: 1 } }),
      // URL in bottom-left
      React.createElement(
        "div",
        {
          style: {
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: "24px",
            color: COLORS.textSubtle,
          },
        },
        "datosmexico.org",
      ),
      // Bottom border (8px green)
      React.createElement("div", {
        style: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "8px",
          backgroundColor: COLORS.primary,
        },
      }),
    );

    const response = new ImageResponse(element, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "SourceSerif",
          data: fonts["SourceSerif4-Bold"],
          weight: 700,
          style: "normal",
        },
        {
          name: "Inter",
          data: fonts["Inter-Regular"],
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: fonts["Inter-Medium"],
          weight: 500,
          style: "normal",
        },
      ],
    });

    const buf = Buffer.from(await response.arrayBuffer());
    await writeFile(join(OG, filename), buf);
    console.log(`  ✓ ${filename} (${(buf.length / 1024).toFixed(1)} KB)`);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 4: Email assets
// ─────────────────────────────────────────────────────────────────────────
//
// Los clientes de correo (Outlook desktop, muchos corporativos) renderizan
// SVG de forma inconsistente. PNG es el formato fiable. Generamos un PNG
// del isotipo a tamaño @1x y @2x para retina, sobre el background del
// observatorio para que se integre con el header del correo.

async function generateEmailAssets() {
  console.log("→ Generating email assets…");
  const logoSvg = await readFile(join(BRAND, "logo.svg"));

  // Isotipo solo (sin wordmark — el wordmark va como texto en el HTML
  // del correo para que el remitente quede visible incluso si el cliente
  // bloquea imágenes). Ratio 4:3 del SVG fuente.
  //
  // Canal alfa transparente: el header del correo es `cardBg` (#FFFFFF)
  // pero el footer es `#FAFAF9` y futuras plantillas podrían poner el
  // logo sobre otros tonos. Un PNG aplanado introduce un recuadro
  // visible cuando el fondo del PNG ≠ fondo del contenedor. Con alpha
  // el isotipo se asienta limpio sobre cualquier fondo claro.
  const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
  const sizes = [
    { name: "logo-email.png", width: 96, height: 72 },
    { name: "logo-email@2x.png", width: 192, height: 144 },
  ] as const;

  for (const { name, width, height } of sizes) {
    const buf = await sharp(logoSvg, { density: 384 })
      .resize(width, height, { fit: "contain", background: transparent })
      .png()
      .toBuffer();
    await writeFile(join(BRAND, name), buf);
    console.log(`  ✓ ${name} (${(buf.length / 1024).toFixed(1)} KB)`);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────

async function main() {
  if (!(await exists(SOURCE_SVG))) {
    throw new Error(
      `Missing source SVG at ${SOURCE_SVG}. Place the approved logo there before running this script.`,
    );
  }
  await ensureDir(BRAND);
  await ensureDir(OG);

  await generateSvgVariants();
  await generateFavicons();
  await generateOgImages();
  await generateEmailAssets();

  console.log("\n✓ All brand assets generated.");
}

main().catch((err) => {
  console.error("\n✗ Generation failed:");
  console.error(err);
  process.exit(1);
});
