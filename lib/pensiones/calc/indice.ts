export type CalcItem = {
  slug: string;
  titulo: string;
  descripcion: string;
  familia: "proyeccion" | "presupuesto";
};

/* Índice de las 10 calculadoras de pensiones. Agrupadas por familia:
   proyección (usan el motor Ley 97 validado) y presupuesto/lógica propia. */
export const calculadoras: readonly CalcItem[] = [
  { slug: "pension", titulo: "Pensión estimada", descripcion: "Tu pensión IMSS bajo Ley 73, Ley 97 y transición, en tres escenarios.", familia: "proyeccion" },
  { slug: "comparador", titulo: "Comparador de escenarios", descripcion: "Retirarte antes, a tiempo o después: tres edades lado a lado.", familia: "proyeccion" },
  { slug: "elegibilidad", titulo: "Elegibilidad de retiro", descripcion: "¿Cumples los requisitos de edad y semanas — y si no, cuándo?", familia: "proyeccion" },
  { slug: "ahorro", titulo: "Ahorro para el retiro", descripcion: "La aportación que alcanzaría tu meta de ingreso.", familia: "proyeccion" },
  { slug: "aportaciones", titulo: "Aportaciones voluntarias", descripcion: "Cuánto suma a tu saldo y pensión aportar un poco más.", familia: "proyeccion" },
  { slug: "brecha", titulo: "Brecha de retiro", descripcion: "La distancia entre el gasto que deseas y el ingreso que sostendrías.", familia: "proyeccion" },
  { slug: "interes-compuesto", titulo: "Interés compuesto", descripcion: "Cuánto cuesta esperar para empezar a ahorrar.", familia: "presupuesto" },
  { slug: "reemplazo", titulo: "Reemplazo de ingreso", descripcion: "Qué parte de tu ingreso pediría tu retiro, desde tu presupuesto.", familia: "presupuesto" },
  { slug: "gasto-vida", titulo: "Gasto de vida en retiro", descripcion: "Tu presupuesto mensual, desde el gasto real de los hogares 65+.", familia: "presupuesto" },
  { slug: "gastos-medicos", titulo: "Gastos médicos en retiro", descripcion: "El gasto de bolsillo en salud, que sube con la edad.", familia: "presupuesto" },
];
