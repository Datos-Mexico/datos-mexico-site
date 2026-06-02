export type TipoTemporal = "snapshot" | "puente";

export type Sensibilidad = "directa" | "sensible";

export type EstadoArticulo =
  | "pre-firma"
  | "firmada"
  | "en-re-revision"
  | "en-reclasificacion"
  | "errata-vigente";

export type EstadoMetodologia = "provisional" | "validada-por-paper";

export type AmbitoGeografico =
  | "nacional"
  | "estatal"
  | "municipal"
  | "sub-municipal";

export type MecanismoRelacion =
  | "tag"
  | "dataset-compartido"
  | "proximidad-vectorial"
  | "curacion-humana";

export type DatasetReferencia = {
  nombre: string;
  version_captura: string;
  url_fuente: string;
};

export type TagsGeograficos = {
  ambito: AmbitoGeografico;
  entidades_especificas: string[];
};

export type MarcasTemporalesPuente = {
  fecha_computo_respuesta: string;
  fecha_version_dataset: string;
  divergencia_detectada: boolean;
};

export type DefinicionContestable = {
  termino: string;
  definicion_adoptada: string;
  fuente_definicion: string;
  alternativas_descartadas: string[];
};

export type EnlaceRelacionado = {
  slug: string;
  mecanismo: MecanismoRelacion;
};

export type ErrataReferencia = {
  version_anterior_url: string;
  motivo_errata: string;
};

export type Articulo = {
  slug: string;
  id_canonico: string;
  pregunta: string;
  version: number;
  fecha_creacion: string;
  fecha_ultima_actualizacion: string;

  tipo_temporal: TipoTemporal;
  sensibilidad: Sensibilidad;
  estado: EstadoArticulo;
  sla_dias_restantes: number | null;

  revisor: string | null;
  fecha_firma: string | null;

  datasets: DatasetReferencia[];

  metodo: string;
  caveats: string[];

  tags_tema_principal: string;
  tags_tema_secundario: string[];
  tags_geograficos: TagsGeograficos;
  tags_temporales: string[];

  paper_ciclo: string | null;
  estado_metodologia: EstadoMetodologia;

  generado_por_routine: boolean;
  articulos_relacionados: EnlaceRelacionado[];

  marcas_temporales_puente?: MarcasTemporalesPuente;
  definiciones_contestables?: DefinicionContestable[];
  errata_referencia?: ErrataReferencia;

  filename: string;
  content: string;
};
