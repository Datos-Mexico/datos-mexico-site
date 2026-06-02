import type { AgendaWeek } from "../types";

export const week: AgendaWeek = {
  isoWeek: "2026-W29",
  startDate: "2026-07-13",
  endDate: "2026-07-19",
  weeklyMeeting: {
    date: "2026-07-15",
    time: "15:00",
    agenda: [],
  },
  events: [
    {
      id: "2026-w29-itam-ultimo-dia-baja-verano",
      type: "deadline",
      date: "2026-07-17",
      title: "Último día para baja en materias (verano ITAM)",
      description:
        "Fecha del calendario académico oficial del Instituto Tecnológico Autónomo de México, institución sede del observatorio.",
    },
  ],
};
