/**
 * Procesa las fotos originales en /Users/davicho/Datos México/fotos/ y las
 * exporta optimizadas a /public/quienes-somos/presentacion/.
 *
 * - 3 fotos del salón → 1600px ancho, calidad ~82, WebP
 * - auditorio → 2400px ancho, calidad ~82, WebP
 *
 * Las PNG originales NO se mueven al repo (~90 MB combinados). Solo las WebP
 * optimizadas se commitean.
 *
 * Ejecutar con: npx tsx scripts/process-presentacion-photos.ts
 *
 * Idempotente: sobreescribe los WebP existentes.
 */

import { mkdir, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DEST = join(ROOT, "public", "quienes-somos", "presentacion");

// Source dir lives OUTSIDE the repo on purpose — originals are 90+ MB combined
// and should not enter the working tree.
const SRC = "/Users/davicho/Datos México/fotos";

type Job = {
  source: string;
  output: string;
  width: number;
  quality: number;
};

const jobs: Job[] = [
  {
    source: join(SRC, "IMG_9495.png"),
    output: join(DEST, "sala-01.webp"),
    width: 1600,
    quality: 82,
  },
  {
    source: join(SRC, "IMG_9498.png"),
    output: join(DEST, "sala-02.webp"),
    width: 1600,
    quality: 82,
  },
  {
    source: join(SRC, "IMG_9503 (1).png"),
    output: join(DEST, "sala-03.webp"),
    width: 1600,
    quality: 82,
  },
  {
    source: join(SRC, "auditorio.png"),
    output: join(DEST, "auditorio.webp"),
    width: 2400,
    quality: 82,
  },
];

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(DEST, { recursive: true });

  for (const job of jobs) {
    if (!(await exists(job.source))) {
      throw new Error(`Falta fuente: ${job.source}`);
    }
    const info = await sharp(job.source)
      .resize({ width: job.width, withoutEnlargement: true })
      .webp({ quality: job.quality, effort: 6 })
      .toFile(job.output);
    const kb = (info.size / 1024).toFixed(1);
    console.log(
      `  ✓ ${job.output.replace(ROOT, "")} (${info.width}×${info.height}, ${kb} KB)`,
    );
  }

  console.log("\n✓ Fotos procesadas.");
}

main().catch((err) => {
  console.error("\n✗ Falló el procesamiento:");
  console.error(err);
  process.exit(1);
});
