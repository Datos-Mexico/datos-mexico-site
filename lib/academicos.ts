export type Academico = {
  id: string;
  name: string;
  role: string;
  institution: string;
};

export const academicos: Academico[] = [
  {
    id: "esponda",
    name: "Dr. Carlos Fernando Esponda Darlington",
    role: "Director de la Licenciatura en Ciencia de Datos",
    institution: "ITAM",
  },
  {
    id: "morales",
    name: "Dr. Marco Antonio Morales Aguirre",
    role: "Director del Programa de Ingeniería en Inteligencia Artificial",
    institution: "ITAM",
  },
];
