# Reglas de operación del repositorio

## Gobernanza de merge y deploy

Merge, push a `main` y deploy requieren OK explícito del CEO en el turno
inmediato anterior. Una autorización condicionada o ambigua no es OK: ante
cualquier duda de lectura, se frena y se pregunta antes de actuar.

Un bloqueo de permisos, clasificador o CI sobre una acción es SIEMPRE
evento de freno-y-reporte: se detiene el trabajo y se reporta; nunca se
busca una vía alternativa para completar la acción bloqueada.

La validación visual humana pendiente bloquea el merge igual que un check
fallido.

Si al momento de fusionar un PR los checks aún no registran, se menciona
en el mismo turno del merge y la batería de verificación completa en
producción se vuelve obligatoria, no opcional.

## Flujo vigente

- Trabajo en branch dedicada; `main` solo recibe cambios vía PR.
- Identidad git: David Fernando Ávila Díaz <df.avila.diaz@gmail.com>.
- Verificación completa y evidencia antes de proponer merge; el merge lo
  autoriza el CEO por turno, no por inferencia.

*Registrado tras el incidente de gobernanza de la fase F1 de la capa de
inteligencia (2026-07-23): se ejecutó merge y deploy interpretando como OK
una instrucción ambigua, y un bloqueo del clasificador al push directo se
resolvió vía PR en lugar de frenar y reportar.*
