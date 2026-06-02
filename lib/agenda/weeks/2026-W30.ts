import type { AgendaWeek } from "../types";

export const week: AgendaWeek = {
  isoWeek: "2026-W30",
  startDate: "2026-07-20",
  endDate: "2026-07-26",
  weeklyMeeting: {
    date: "2026-07-22",
    time: "15:00",
    agenda: [],
  },
  events: [
    {
      id: "2026-w30-itam-fin-cursos-verano",
      type: "deadline",
      date: "2026-07-24",
      title: "Fin de cursos verano ITAM",
      description:
        "Fecha del calendario académico oficial del Instituto Tecnológico Autónomo de México, institución sede del observatorio.",
    },
  ],
};
