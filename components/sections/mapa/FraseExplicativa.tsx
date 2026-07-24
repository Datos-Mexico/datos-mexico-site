/**
 * Pie editorial del mapa: la frase explicativa nacional del indicador
 * activo, en la capa humana del registro dual. Vive entre el mapa y la
 * leyenda; cambia con el indicador (aria-live para que el cambio sea
 * perceptible en lector de pantalla sin robar el foco).
 */
export function FraseExplicativa({ texto }: { texto: string }) {
  return (
    <p
      aria-live="polite"
      className="mt-2 font-serif text-[16px] leading-[1.45] text-foreground"
    >
      {texto}
    </p>
  );
}
