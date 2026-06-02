import type { AgendaWeek } from "../types";

export const week: AgendaWeek = {
  isoWeek: "2026-W33",
  startDate: "2026-08-10",
  endDate: "2026-08-16",
  weeklyMeeting: {
    date: "2026-08-12",
    time: "15:00",
    agenda: [],
  },
  events: [
    {
      id: "2026-w33-itam-inicio-cursos-otono",
      type: "deadline",
      date: "2026-08-10",
      title: "Inicio de cursos otoño ITAM",
      description:
        "Fecha del calendario académico oficial del Instituto Tecnológico Autónomo de México, institución sede del observatorio.",
    },
  ],
};
