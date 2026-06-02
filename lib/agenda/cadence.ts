import type { CadenceItem } from "./types";

export const cadence: readonly CadenceItem[] = [
  {
    id: "junta-semanal",
    cadence: "weekly",
    what: "Junta operativa del equipo",
    when: "Una vez por semana",
    rationale:
      "Coordinación de líneas de trabajo, revisión de publicaciones en curso y planificación de la semana siguiente.",
  },
  {
    id: "publicacion-diaria",
    cadence: "daily",
    what: "Publicación pregunta–respuesta",
    when: "En días hábiles",
    where: "/publicaciones",
    rationale:
      "Cadencia editorial del corpus pregunta–respuesta del observatorio. Cada entrega responde a una pregunta acotada con un microdato verificable.",
  },
];
