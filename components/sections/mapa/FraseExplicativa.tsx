/**
 * Pie editorial del mapa: la frase explicativa nacional del indicador
 * activo, en la capa humana del registro dual. Vive entre el mapa y la
 * leyenda; cambia con el indicador. Solo los cambios iniciados por el
 * usuario se anuncian (aria-live): narrar cada rotación automática del
 * pulso sería ruido permanente en lector de pantalla.
 *
 * El min-height de escritorio reserva la frase más larga del canon (5
 * líneas, 116px medidos a 16px/1.45): sin la reserva, cada repintado
 * cambia la altura de la columna, items-center recentra el grid y la
 * lista se desplaza bajo el cursor quieto — con frases de largo dispar
 * el hover puede entrar en ping-pong. Al refrescar copy, verificar que
 * ninguna frase pase de 5 líneas en anchos lg (o subir la reserva).
 */
export function FraseExplicativa({ texto, anuncia = true }: { texto: string; anuncia?: boolean }) {
  return (
    <p
      aria-live={anuncia ? "polite" : "off"}
      className="mt-2 font-serif text-[16px] leading-[1.45] text-foreground lg:min-h-[116px]"
    >
      {texto}
    </p>
  );
}
