import type { AgendaWeek } from "../types";

export const week: AgendaWeek = {
  isoWeek: "2026-W25",
  startDate: "2026-06-15",
  endDate: "2026-06-21",
  weeklyMeeting: {
    date: "2026-06-17",
    time: "15:00",
    agenda: [],
  },
  events: [
    {
      id: "2026-w25-itam-inicio-cursos-verano",
      type: "deadline",
      date: "2026-06-15",
      title: "Inicio de cursos verano ITAM",
      description:
        "Fecha del calendario académico oficial del Instituto Tecnológico Autónomo de México, institución sede del observatorio.",
      link: {
        href: "https://escolar.itam.mx/servicios_escolares/calendarios/calesc2026.pdf",
        label: "Calendario ITAM 2026",
        external: true,
      },
    },
    {
      id: "2026-w25-encargo-001-jitomate-superissste",
      type: "press-engagement",
      date: "2026-06-15",
      title:
        "El observatorio respondió su primer encargo de prensa: precios del jitomate y contratos del SuperISSSTE",
      description:
        "Yuxtaposición del precio público observado en SuperISSSTE durante abril de 2026 con la negativa al acceso a la información sobre los contratos de adquisición, invocando 'secreto comercial'.",
      link: {
        href: "/transparencia/001-jitomate-superissste",
        label: "Leer la pieza",
      },
    },
  ],
};
