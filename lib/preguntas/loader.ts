import matter from "gray-matter";
import { rawArticulos, rawBanners } from "./registry.generated";
import type {
  AmbitoGeografico,
  Articulo,
  DatasetReferencia,
  DefinicionContestable,
  EnlaceRelacionado,
  EstadoArticulo,
  EstadoMetodologia,
  ErrataReferencia,
  MarcasTemporalesPuente,
  MecanismoRelacion,
  Sensibilidad,
  TagsGeograficos,
  TipoTemporal,
} from "./types";

const TIPOS_TEMPORALES: readonly TipoTemporal[] = ["snapshot", "puente"];
const SENSIBILIDADES: readonly Sensibilidad[] = ["directa", "sensible"];
const ESTADOS: readonly EstadoArticulo[] = [
  "pre-firma",
  "firmada",
  "en-re-revision",
  "en-reclasificacion",
  "errata-vigente",
];
const ESTADOS_METODOLOGIA: readonly EstadoMetodologia[] = [
  "provisional",
  "validada-por-paper",
];
const AMBITOS: readonly AmbitoGeografico[] = [
  "nacional",
  "estatal",
  "municipal",
  "sub-municipal",
];
const MECANISMOS: readonly MecanismoRelacion[] = [
  "tag",
  "dataset-compartido",
  "proximidad-vectorial",
  "curacion-humana",
];

function fail(filename: string, msg: string): never {
  throw new Error(`Frontmatter inválido en ${filename}: ${msg}`);
}

function toIsoDateString(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string") return v;
  return String(v);
}

function toIsoDateTimeString(v: unknown): string {
  if (v instanceof Date) {
    return `${v.toISOString().split(".")[0]}Z`;
  }
  if (typeof v === "string") return v;
  return String(v);
}

function asString(v: unknown, filename: string, field: string): string {
  if (typeof v !== "string" || v.length === 0) {
    fail(filename, `campo "${field}" debe ser string no vacío`);
  }
  return v;
}

function asStringArray(
  v: unknown,
  filename: string,
  field: string,
): string[] {
  if (!Array.isArray(v) || !v.every((x) => typeof x === "string")) {
    fail(filename, `campo "${field}" debe ser lista de strings`);
  }
  return v as string[];
}

function asInteger(v: unknown, filename: string, field: string): number {
  if (typeof v !== "number" || !Number.isInteger(v)) {
    fail(filename, `campo "${field}" debe ser entero`);
  }
  return v;
}

function asEnum<T extends string>(
  v: unknown,
  allowed: readonly T[],
  filename: string,
  field: string,
): T {
  if (typeof v !== "string" || !(allowed as readonly string[]).includes(v)) {
    fail(
      filename,
      `campo "${field}" debe ser uno de [${allowed.join(", ")}], recibido: ${String(v)}`,
    );
  }
  return v as T;
}

function asDatasets(
  v: unknown,
  filename: string,
): DatasetReferencia[] {
  if (!Array.isArray(v) || v.length === 0) {
    fail(filename, `campo "datasets" debe ser lista no vacía`);
  }
  return v.map((d, i) => {
    if (
      !d ||
      typeof d !== "object" ||
      typeof (d as Record<string, unknown>).nombre !== "string" ||
      typeof (d as Record<string, unknown>).url_fuente !== "string"
    ) {
      fail(
        filename,
        `datasets[${i}] requiere nombre y url_fuente como string`,
      );
    }
    const obj = d as Record<string, unknown>;
    return {
      nombre: obj.nombre as string,
      version_captura: String(obj.version_captura),
      url_fuente: obj.url_fuente as string,
    };
  });
}

function asTagsGeograficos(v: unknown, filename: string): TagsGeograficos {
  if (!v || typeof v !== "object") {
    fail(filename, `tags_geograficos debe ser objeto`);
  }
  const o = v as Record<string, unknown>;
  return {
    ambito: asEnum(o.ambito, AMBITOS, filename, "tags_geograficos.ambito"),
    entidades_especificas: Array.isArray(o.entidades_especificas)
      ? asStringArray(
          o.entidades_especificas,
          filename,
          "tags_geograficos.entidades_especificas",
        )
      : [],
  };
}

function asMarcasTemporalesPuente(
  v: unknown,
  filename: string,
): MarcasTemporalesPuente {
  if (!v || typeof v !== "object") {
    fail(filename, `marcas_temporales_puente debe ser objeto`);
  }
  const o = v as Record<string, unknown>;
  if (typeof o.divergencia_detectada !== "boolean") {
    fail(filename, `marcas_temporales_puente.divergencia_detectada debe ser boolean`);
  }
  return {
    fecha_computo_respuesta: toIsoDateTimeString(o.fecha_computo_respuesta),
    fecha_version_dataset: toIsoDateTimeString(o.fecha_version_dataset),
    divergencia_detectada: o.divergencia_detectada,
  };
}

function asDefinicionesContestables(
  v: unknown,
  filename: string,
): DefinicionContestable[] {
  if (!Array.isArray(v)) {
    fail(filename, `definiciones_contestables debe ser lista`);
  }
  return v.map((d, i) => {
    if (!d || typeof d !== "object") {
      fail(filename, `definiciones_contestables[${i}] debe ser objeto`);
    }
    const o = d as Record<string, unknown>;
    return {
      termino: asString(o.termino, filename, `definiciones_contestables[${i}].termino`),
      definicion_adoptada: asString(
        o.definicion_adoptada,
        filename,
        `definiciones_contestables[${i}].definicion_adoptada`,
      ),
      fuente_definicion: asString(
        o.fuente_definicion,
        filename,
        `definiciones_contestables[${i}].fuente_definicion`,
      ),
      alternativas_descartadas: Array.isArray(o.alternativas_descartadas)
        ? asStringArray(
            o.alternativas_descartadas,
            filename,
            `definiciones_contestables[${i}].alternativas_descartadas`,
          )
        : [],
    };
  });
}

function asArticulosRelacionados(
  v: unknown,
  filename: string,
): EnlaceRelacionado[] {
  if (!Array.isArray(v)) {
    fail(filename, `articulos_relacionados debe ser lista`);
  }
  return v.map((e, i) => {
    if (!e || typeof e !== "object") {
      fail(filename, `articulos_relacionados[${i}] debe ser objeto`);
    }
    const o = e as Record<string, unknown>;
    return {
      slug: asString(o.slug, filename, `articulos_relacionados[${i}].slug`),
      mecanismo: asEnum(
        o.mecanismo,
        MECANISMOS,
        filename,
        `articulos_relacionados[${i}].mecanismo`,
      ),
    };
  });
}

function asErrataReferencia(
  v: unknown,
  filename: string,
): ErrataReferencia {
  if (!v || typeof v !== "object") {
    fail(filename, `errata_referencia debe ser objeto`);
  }
  const o = v as Record<string, unknown>;
  return {
    version_anterior_url: asString(
      o.version_anterior_url,
      filename,
      "errata_referencia.version_anterior_url",
    ),
    motivo_errata: asString(
      o.motivo_errata,
      filename,
      "errata_referencia.motivo_errata",
    ),
  };
}

function parseArticulo(
  filename: string,
  raw: { data: Record<string, unknown>; content: string; body_html: string },
): Articulo {
  const fm = raw.data;
  const slug = asString(fm.slug, filename, "slug");
  const fileStem = filename.replace(/\.md$/, "");
  if (slug !== fileStem) {
    fail(
      filename,
      `slug "${slug}" no coincide con el nombre del archivo "${fileStem}"`,
    );
  }
  const estado = asEnum(fm.estado, ESTADOS, filename, "estado");
  const tipoTemporal = asEnum(
    fm.tipo_temporal,
    TIPOS_TEMPORALES,
    filename,
    "tipo_temporal",
  );
  const sensibilidad = asEnum(
    fm.sensibilidad,
    SENSIBILIDADES,
    filename,
    "sensibilidad",
  );
  const version = asInteger(fm.version, filename, "version");

  if (estado === "pre-firma") {
    if (fm.revisor !== null || fm.fecha_firma !== null) {
      fail(filename, `estado=pre-firma requiere revisor=null y fecha_firma=null`);
    }
    if (typeof fm.sla_dias_restantes !== "number") {
      fail(filename, `estado=pre-firma requiere sla_dias_restantes numérico`);
    }
  } else {
    if (typeof fm.revisor !== "string" || typeof fm.fecha_firma !== "string") {
      fail(filename, `estado=${estado} requiere revisor y fecha_firma poblados`);
    }
  }

  if (tipoTemporal === "puente" && !fm.marcas_temporales_puente) {
    fail(filename, `tipo_temporal=puente requiere marcas_temporales_puente`);
  }
  if (sensibilidad === "sensible" && !fm.definiciones_contestables) {
    fail(filename, `sensibilidad=sensible requiere definiciones_contestables`);
  }
  if (version > 1 && !fm.errata_referencia) {
    fail(filename, `version>1 requiere errata_referencia`);
  }

  const articulo: Articulo = {
    slug,
    id_canonico: asString(fm.id_canonico, filename, "id_canonico"),
    pregunta: asString(fm.pregunta, filename, "pregunta"),
    version,
    fecha_creacion: toIsoDateString(fm.fecha_creacion),
    fecha_ultima_actualizacion: toIsoDateString(fm.fecha_ultima_actualizacion),

    tipo_temporal: tipoTemporal,
    sensibilidad,
    estado,
    sla_dias_restantes:
      estado === "pre-firma" ? (fm.sla_dias_restantes as number) : null,

    revisor: typeof fm.revisor === "string" ? fm.revisor : null,
    fecha_firma:
      typeof fm.fecha_firma === "string"
        ? fm.fecha_firma
        : fm.fecha_firma && typeof (fm.fecha_firma as { toISOString?: unknown }).toISOString === "function"
          ? toIsoDateString(fm.fecha_firma)
          : null,

    datasets: asDatasets(fm.datasets, filename),

    metodo: asString(fm.metodo, filename, "metodo"),
    caveats: asStringArray(fm.caveats, filename, "caveats"),

    tags_tema_principal: asString(
      fm.tags_tema_principal,
      filename,
      "tags_tema_principal",
    ),
    tags_tema_secundario: Array.isArray(fm.tags_tema_secundario)
      ? asStringArray(fm.tags_tema_secundario, filename, "tags_tema_secundario")
      : [],
    tags_geograficos: asTagsGeograficos(fm.tags_geograficos, filename),
    tags_temporales: asStringArray(fm.tags_temporales, filename, "tags_temporales"),

    paper_ciclo: typeof fm.paper_ciclo === "string" ? fm.paper_ciclo : null,
    estado_metodologia: asEnum(
      fm.estado_metodologia,
      ESTADOS_METODOLOGIA,
      filename,
      "estado_metodologia",
    ),

    generado_por_routine:
      typeof fm.generado_por_routine === "boolean"
        ? fm.generado_por_routine
        : (fail(filename, `generado_por_routine debe ser boolean`) as never),
    articulos_relacionados: asArticulosRelacionados(
      fm.articulos_relacionados ?? [],
      filename,
    ),

    filename,
    content: raw.content,
    body_html: raw.body_html,
  };

  if (tipoTemporal === "puente") {
    articulo.marcas_temporales_puente = asMarcasTemporalesPuente(
      fm.marcas_temporales_puente,
      filename,
    );
  }
  if (sensibilidad === "sensible") {
    articulo.definiciones_contestables = asDefinicionesContestables(
      fm.definiciones_contestables,
      filename,
    );
  }
  if (version > 1) {
    articulo.errata_referencia = asErrataReferencia(
      fm.errata_referencia,
      filename,
    );
  }

  return articulo;
}

function parseRawArticulo(
  filename: string,
  raw: string,
  body_html: string,
): Articulo {
  const parsed = matter(raw);
  return parseArticulo(filename, {
    data: parsed.data as Record<string, unknown>,
    content: parsed.content,
    body_html,
  });
}

let cache: Articulo[] | null = null;

export async function getAllArticulos(): Promise<Articulo[]> {
  if (cache) return cache;
  const articulos = rawArticulos.map((r) =>
    parseRawArticulo(r.filename, r.raw, r.body_html),
  );
  articulos.sort((a, b) =>
    a.fecha_ultima_actualizacion < b.fecha_ultima_actualizacion ? 1 : -1,
  );
  cache = articulos;
  return articulos;
}

export async function getArticuloPorSlug(
  slug: string,
): Promise<Articulo | null> {
  const all = await getAllArticulos();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function getAllSlugs(): Promise<string[]> {
  const all = await getAllArticulos();
  return all.map((a) => a.slug);
}

export async function getBannerCanonico(
  estado: EstadoArticulo,
): Promise<string | null> {
  return rawBanners[estado] ?? null;
}
