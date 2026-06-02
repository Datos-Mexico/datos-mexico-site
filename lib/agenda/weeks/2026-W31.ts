import type { AgendaWeek } from "../types";

export const week: AgendaWeek = {
  isoWeek: "2026-W31",
  startDate: "2026-07-27",
  endDate: "2026-08-02",
  weeklyMeeting: {
    date: "2026-07-29",
    time: "15:00",
    agenda: [],
  },
  events: [
    {
      id: "2026-w31-itam-inicio-examenes-finales-verano",
      type: "deadline",
      date: "2026-07-27",
      title: "Inicio de exámenes finales verano ITAM",
      description:
        "Fecha del calendario académico oficial del Instituto Tecnológico Autónomo de México, institución sede del observatorio.",
    },
    {
      id: "2026-w31-amafore-presentacion",
      type: "presentation",
      date: "2026-07-31",
      title: "Amafore — presentación pública del observatorio",
      description:
        "Presentación pública del trabajo del observatorio en el ciclo temático de pensiones, ante la Asociación Mexicana de Administradoras de Fondos para el Retiro.",
    },
    {
      id: "2026-w31-itam-fin-examenes-finales-verano",
      type: "deadline",
      date: "2026-08-01",
      title: "Fin de exámenes finales verano ITAM",
      description:
        "Fecha del calendario académico oficial del Instituto Tecnológico Autónomo de México, institución sede del observatorio.",
    },
  ],
};
