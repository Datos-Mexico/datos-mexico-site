import {
  Mail,
  Newspaper,
  BookOpen,
  CircleAlert,
  Users,
  Send,
} from "lucide-react";
import { ContactChannelCard, type ContactChannelCardProps } from "./ContactChannelCard";

const canales: ContactChannelCardProps[] = [
  {
    icon: Mail,
    title: "Consultas generales",
    description:
      "Si tu pregunta no encaja en ninguna otra categoría, este es el canal correcto.",
    email: "contacto@datosmexico.org",
    responseTime: "5 días hábiles",
  },
  {
    icon: Newspaper,
    title: "Prensa y medios",
    description:
      "Periodistas con plazos, solicitudes de entrevista, atribución de cifras o reproducción de gráficas.",
    email: "prensa@datosmexico.org",
    responseTime: "24 horas hábiles · mismo día para coyuntura",
    complementaryLink: { href: "/prensa", label: "Ver recursos para prensa" },
  },
  {
    icon: BookOpen,
    title: "Investigación y academia",
    description:
      "Investigadores, periodistas de datos o tesistas que quieran auditar metodología, replicar análisis o colaborar en proyectos académicos.",
    email: "academia@datosmexico.org",
    responseTime: "1–3 días hábiles",
  },
  {
    icon: CircleAlert,
    title: "Reportar errores",
    description:
      "Detectaste una inconsistencia, error metodológico o cifra incorrecta en una publicación. Revisamos y rectificamos públicamente.",
    email: "errores@datosmexico.org",
    responseTime: "48 horas hábiles",
    complementaryLink: {
      href: "/metodologia#cambios",
      label: "Ver registro de cambios",
    },
  },
  {
    icon: Users,
    title: "Sumarse al equipo",
    description:
      "Si te interesa formar parte del observatorio — investigación, datos, comunicación — escríbenos contándonos qué te interesa aportar.",
    email: "equipo@datosmexico.org",
    responseTime: "5 días hábiles",
    complementaryLink: {
      href: "/quienes-somos#areas",
      label: "Conoce las áreas",
    },
  },
  {
    icon: Send,
    title: "Suscribirse al boletín",
    description:
      "El boletín es el canal directo para recibir nuestros análisis. La suscripción se hace en su propia página.",
    emailLabel: "Acción",
    emailValue: "Suscripción opt-in",
    responseLabel: "Cadencia",
    responseTime: "3–5 envíos por semana",
    complementaryLink: {
      href: "/boletin",
      label: "Ir a la página del boletín",
    },
  },
];

export function Canales() {
  return (
    <section id="canales" className="border-b border-border py-16 md:py-20">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {canales.map((canal) => (
          <ContactChannelCard key={canal.title} {...canal} />
        ))}
      </div>
    </section>
  );
}
