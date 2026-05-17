export type TeamMember = {
  id: string;
  name: string;
  initials: string;
  career: string;
  year: string;
  bio: string;
  links: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  photo?: string;
};

export const team: TeamMember[] = [
  {
    id: "avila-diaz-david",
    name: "David Fernando Ávila Díaz",
    initials: "DA",
    career: "Estudiante de Ciencia de Datos, Instituto Tecnológico Autónomo de México",
    year: "",
    bio: "",
    links: {
      linkedin: "https://www.linkedin.com/in/david-avila-879075302",
      github: "https://github.com/DabtcAvila",
    },
    photo: undefined,
  },
  {
    id: "butron-ramirez-gerardo",
    name: "Gerardo André Butrón Ramírez",
    initials: "GB",
    career: "Estudiante de Ciencia de Datos, Instituto Tecnológico Autónomo de México",
    year: "",
    bio: "",
    links: {
      linkedin: "https://www.linkedin.com/in/andr%C3%A9-butr%C3%B3n-5888a7351",
      github: "https://github.com/butronand-png",
    },
    photo: undefined,
  },
  {
    id: "millan-giffard-emiliano",
    name: "Emiliano Sebastián Millán Giffard",
    initials: "EM",
    career: "Estudiante de Ciencia de Datos, Instituto Tecnológico Autónomo de México",
    year: "",
    bio: "",
    links: {
      github: "https://github.com/emilianomillan",
    },
    photo: undefined,
  },
  {
    id: "uribe-clemente-jose-roberto",
    name: "José Roberto Uribe Clemente",
    initials: "JU",
    career: "Estudiante de Ciencia de Datos, Instituto Tecnológico Autónomo de México",
    year: "",
    bio: "",
    links: {
      github: "https://github.com/RobertoUribeClemente",
    },
    photo: undefined,
  },
  {
    id: "solano-diaz-ashley",
    name: "Ashley Dannae Solano Díaz",
    initials: "AS",
    career: "Estudiante de Psicología, Universidad del Valle de México",
    year: "",
    bio: "",
    links: {
      linkedin: "https://mx.linkedin.com/in/ashley-dannae-solano-diaz-08723634a",
    },
    photo: undefined,
  },
  {
    id: "hernandez-monroy-alexa",
    name: "Alexa Fernanda Hernández Monroy",
    initials: "AH",
    career: "Egresada de Economía, Instituto Tecnológico Autónomo de México",
    year: "",
    bio: "",
    links: {
      linkedin: "https://www.linkedin.com/in/alexa-fernanda-hern%C3%A1ndez-monroy-9aaa58289",
    },
    photo: undefined,
  },
  {
    id: "campos-juarez-fabiola",
    name: "Fabiola Campos Juárez",
    initials: "FC",
    career: "Estudiante de Economía, Instituto Tecnológico Autónomo de México",
    year: "",
    bio: "",
    links: {
      linkedin: "https://www.linkedin.com/in/fabiola-campos-ju%C3%A1rez-6a41a0334",
    },
    photo: undefined,
  },
];
