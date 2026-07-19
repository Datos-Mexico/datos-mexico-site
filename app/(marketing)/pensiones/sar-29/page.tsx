import { redirect } from "next/navigation";

/* La landing de la serie SAR-29 se consolidó en el hub /pensiones (Fase 7,
   D9): la pieza visual y el acceso a las 29 entregas + panel viven ahí.
   Esta ruta redirige para no dejar 404 — los colofones de los papers y el
   enlace "Volver a la serie" de las entregas frozen la siguen usando. Los
   HTML congelados (/pensiones/sar-29/DM-SAR-{año}.html) y el dataset son
   rutas hijas estáticas distintas y no se ven afectados por este redirect. */
export default function Sar29LandingRedirect() {
  redirect("/pensiones");
}
