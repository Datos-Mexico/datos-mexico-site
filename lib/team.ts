export type TeamTag = "equipo-tecnico-fundador" | "equipo-del-observatorio";

export const teamTagLabels: Record<TeamTag, string> = {
  "equipo-tecnico-fundador": "Equipo técnico fundador",
  "equipo-del-observatorio": "Equipo del observatorio",
} as const;

export type TeamMember = {
  id: string;
  name: string;
  initials: string;
  career: string;
  /**
   * Bio editorial corta del miembro. Se renderiza solo si no está vacía.
   * NUNCA se rellena con texto inventado: el campo se queda "" hasta que
   * la persona misma aporte su biografía.
   */
  bio: string;
  links: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
    scholar?: string;
    orcid?: string;
  };
  photo?: string;
  tag?: TeamTag;
};

export const team: TeamMember[] = [
  {
    id: "avila-diaz-david",
    name: "David Fernando Ávila Díaz",
    initials: "DA",
    career: "Estudiante de Ciencia de Datos, Instituto Tecnológico Autónomo de México",
    bio: "",
    links: {
      linkedin: "https://www.linkedin.com/in/david-avila-879075302",
      github: "https://github.com/DabtcAvila",
    },
    photo: undefined,
    tag: "equipo-tecnico-fundador",
  },
  {
    id: "butron-ramirez-gerardo",
    name: "Gerardo André Butrón Ramírez",
    initials: "GB",
    career: "Estudiante de Ciencia de Datos, Instituto Tecnológico Autónomo de México",
    bio: "",
    links: {
      linkedin: "https://www.linkedin.com/in/andr%C3%A9-butr%C3%B3n-5888a7351",
      github: "https://github.com/butronand-png",
    },
    photo: undefined,
    tag: "equipo-tecnico-fundador",
  },
  {
    id: "millan-giffard-emiliano",
    name: "Emiliano Sebastián Millán Giffard",
    initials: "EM",
    career: "Estudiante de Ciencia de Datos, Instituto Tecnológico Autónomo de México",
    bio: "",
    links: {
      linkedin: "https://www.linkedin.com/in/emiliano-sebastián-millán-giffard-911635370",
      github: "https://github.com/emilianomillan",
    },
    photo: undefined,
    tag: "equipo-tecnico-fundador",
  },
  {
    id: "uribe-clemente-jose-roberto",
    name: "José Roberto Uribe Clemente",
    initials: "JU",
    career: "Estudiante de Ciencia de Datos, Instituto Tecnológico Autónomo de México",
    bio: "",
    links: {
      github: "https://github.com/RobertoUribeClemente",
    },
    photo: undefined,
    tag: "equipo-tecnico-fundador",
  },
  {
    id: "solano-diaz-ashley",
    name: "Ashley Dannae Solano Díaz",
    initials: "AS",
    career: "Estudiante de Psicología, Universidad del Valle de México",
    bio: "",
    links: {
      linkedin: "https://mx.linkedin.com/in/ashley-dannae-solano-diaz-08723634a",
    },
    photo: undefined,
    tag: "equipo-del-observatorio",
  },
  {
    id: "hernandez-monroy-alexa",
    name: "Alexa Fernanda Hernández Monroy",
    initials: "AH",
    career: "Egresada de Economía, Instituto Tecnológico Autónomo de México",
    bio: "",
    links: {
      linkedin: "https://www.linkedin.com/in/alexa-fernanda-hern%C3%A1ndez-monroy-9aaa58289",
    },
    photo: undefined,
    tag: "equipo-del-observatorio",
  },
  {
    id: "campos-juarez-fabiola",
    name: "Fabiola Campos Juárez",
    initials: "FC",
    career: "Estudiante de Economía, Instituto Tecnológico Autónomo de México",
    bio: "",
    links: {
      linkedin: "https://www.linkedin.com/in/fabiola-campos-ju%C3%A1rez-6a41a0334",
    },
    photo: undefined,
    tag: "equipo-del-observatorio",
  },
  {
    id: "bustillos-hernandez-luis-eduardo",
    name: "Luis Eduardo Bustillos Hernández",
    initials: "LB",
    career: "Estudiante de Ciencia Política, Instituto Tecnológico Autónomo de México",
    bio: "",
    links: {
      linkedin: "https://www.linkedin.com/in/luiseduardobustilloshernandez",
    },
    photo: undefined,
    tag: "equipo-del-observatorio",
  },
  {
    id: "alfaro-rodriguez-ian-miguel",
    name: "Ian Miguel Alfaro Rodriguez",
    initials: "IA",
    career: "Estudiante de Administración de Negocios, Instituto Tecnológico Autónomo de México",
    bio: "",
    links: {},
    photo: undefined,
    tag: "equipo-del-observatorio",
  },
];
