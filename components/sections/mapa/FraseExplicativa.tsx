/**
 * Pie editorial del mapa: la frase explicativa nacional del indicador
 * activo, en la capa humana del registro dual. Vive entre el mapa y la
 * leyenda; cambia con el indicador. Solo los cambios iniciados por el
 * usuario se anuncian (aria-live): narrar cada rotación automática del
 * pulso sería ruido permanente en lector de pantalla.
 */
export function FraseExplicativa({ texto, anuncia = true }: { texto: string; anuncia?: boolean }) {
  return (
    <p
      aria-live={anuncia ? "polite" : "off"}
      className="mt-2 font-serif text-[16px] leading-[1.45] text-foreground"
    >
      {texto}
    </p>
  );
}
