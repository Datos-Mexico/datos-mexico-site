# Paquete de revisión legal — Aviso de privacidad

**Para:** Lic. Jesús Rubí Ramírez
**De:** Observatorio Datos México
**Fecha:** 19 de junio de 2026
**Asunto:** Revisión informal del aviso de privacidad para el newsletter del observatorio

---

## Para leer en orden

Este paquete tiene cuatro partes, pensadas para ser leídas en este orden:

1. **Resumen del caso** (≤ 1 página) — contexto suficiente para entender qué se está protegiendo y por qué.
2. **Preguntas concretas** — cinco preguntas específicas que necesitamos que usted valide o corrija.
3. **Borrador íntegro del aviso** — el texto tal como quedaría publicado, con los placeholders intactos para que vea exactamente qué decisiones jurídicas faltan.
4. **Matriz de fundamento legal** — qué artículo de la LFPDPPP respalda cada cláusula, para que usted contraste rápido.

El borrador está redactado conforme a la **LFPDPPP reforma del 20 de marzo de 2025** (vigente desde el 21 de marzo de 2025), no la versión anterior. Sabemos que el cambio es reciente y por eso pedimos su lectura.

---

## 1. Resumen del caso (≤ 1 página)

**Qué es Datos México.** Un observatorio académico de datos económicos y de transparencia de México, integrado por estudiantes, egresados y colaboradores. Publica análisis de microdatos, casos de transparencia, una agenda semanal y otros productos editoriales en `datosmexico.org`. Su modelo de operación es no lucrativo y de difusión pública. **No afirmamos respaldo institucional formal del ITAM en este aviso** — esa es precisamente una de las preguntas para usted: si jurídicamente corresponde nombrar al ITAM como responsable, o si el responsable debe ser otra figura.

**Qué se va a capturar.** Únicamente la **dirección de correo electrónico** de quien decida suscribirse al boletín del observatorio. Nada más: ni nombre, ni teléfono, ni dirección postal, ni datos sensibles en el sentido del Art. 2.VI de la LFPDPPP.

**Para qué.** Enviar un **boletín quincenal** (cada dos semanas) cuyo contenido es el agregado retrospectivo de las dos semanas previas de la agenda pública del sitio. Sin publicidad, sin perfilamiento, sin segmentación comercial, sin finalidades secundarias.

**Cómo se capturará.**
- Formulario simple en `datosmexico.org/boletin` con un solo campo (correo) y casilla de consentimiento.
- **Doble opt-in**: tras enviar el formulario, el suscriptor recibe un correo de confirmación con un enlace; solo si lo clickea queda en la lista activa.
- **Baja en cada envío**: cada boletín lleva al pie un enlace "darme de baja" que funciona en un clic, sin login.

**Dónde se almacenará.** En **infraestructura propia del observatorio**: una base de datos D1 de Cloudflare (SQLite serverless administrada por nosotros), no en la base del proveedor de envío. Decisión deliberada para que la lista de suscriptores sea un activo del observatorio, no del proveedor.

**Quién más lo procesa.** Un **proveedor tecnológico de envío de correo** (la opción más probable es Resend Inc., con sede en Estados Unidos; alternativas: Buttondown, MailerLite, Postmark). Lo interpretamos como **persona encargada** en el sentido del Art. 2.XII de la LFPDPPP — procesa por cuenta del observatorio, bajo sus instrucciones, sin facultad de tratar los datos para fines propios — y por tanto **no como tercero** que requiera comunicar transferencia. La validación de esa interpretación es la pregunta 2.

**Lo que NO se hará.** No se venden, rentan, comparten ni ceden correos a terceros. No se cruzan con otras bases. No se enriquecen con datos públicos. No se usan para nada distinto del envío del boletín.

**Estado actual.** El aviso está en un PR (`#23` del repositorio `Datos-Mexico/datos-mexico-site`) y publicado en `datosmexico.org/privacidad` con tres controles que impiden que se interprete como vigente:
- `<meta name="robots" content="noindex, nofollow">` — los buscadores no la indexan.
- Banner amarillo arriba y al pie: "BORRADOR EN REVISIÓN — NO VIGENTE".
- 18 marcadores `[PENDIENTE — CEO: ...]` distribuidos en el texto en los campos que dependen de decisión jurídica.
- No está enlazada desde el formulario, el footer, la navegación ni el sitemap.

Solo se publicará oficialmente cuando: (a) usted dé el visto bueno informal, (b) el CEO complete los placeholders con los datos del responsable, y (c) se conecte al formulario en una fase posterior del proyecto.

---

## 2. Preguntas concretas

Numeradas para que pueda responder cada una en una o dos frases. Cualquier corrección de redacción o de fondo es bienvenida — pero estas cinco son las que más necesitamos resolver.

### Pregunta 1 — Identidad del responsable

¿Quién debe figurar como **responsable del tratamiento** (Art. 15.I LFPDPPP) en este aviso?

Opciones que vemos:

a. **El observatorio como persona moral con personalidad jurídica propia.** No tenemos confirmado si existe constituido como tal (asociación civil, etc.).
b. **Una persona física** (el CEO o un coordinador responsable) actuando a título individual como responsable del tratamiento.
c. **El ITAM**, si jurídicamente corresponde nombrar a la institución sede como responsable del tratamiento de datos recabados a través de un proyecto albergado por ella.
d. **Otra figura** que usted recomiende.

Lo que necesitamos: cuál de las anteriores es jurídicamente correcta dadas las características del observatorio. De ahí se derivan **domicilio** (Art. 15.I) y **contacto para ARCO** que también deben quedar definidos.

### Pregunta 2 — Encargado vs. tercero

El proveedor de envío (Resend, Buttondown o similar, con sede en Estados Unidos) procesa los correos por cuenta del observatorio bajo instrucciones contractuales, sin tratarlos para sus propios fines. Mantenemos un acuerdo de tratamiento de datos (Data Processing Agreement) con el proveedor.

¿Es **correcta nuestra interpretación** de que en estas condiciones el proveedor califica como **persona encargada** (Art. 2.XII LFPDPPP) y **no como tercero** (Art. 2.XVII), y que por tanto **no constituye una transferencia** (Art. 2.XX) que requiera comunicación específica al titular?

Es la interpretación estándar en la doctrina, pero queremos su confirmación dada la novedad de la ley reformada.

### Pregunta 3 — Cumplimiento del Art. 15

El aviso cubre, en este orden, los seis elementos que enumera el Art. 15 LFPDPPP:

1. Identidad y domicilio del responsable — § 1
2. Datos personales sometidos a tratamiento, identificando sensibles — § 2
3. Finalidades, distinguiendo las que requieren consentimiento — § 3
4. Opciones y medios para limitar uso o divulgación — § 5
5. Mecanismos para ejercer derechos ARCO — § 9
6. Procedimiento para comunicar cambios al aviso — § 10

¿**Falta algún elemento** exigido por el Art. 15 vigente que no estemos cubriendo? ¿Hay alguno que estemos cubriendo de forma insuficiente para la nueva ley?

### Pregunta 4 — Redacción, alcance, sobras y faltantes

Más allá del Art. 15, ¿hay algo en el texto del borrador que **sobre, falte o deba redactarse de forma distinta**? En particular nos preocupa:

- La fórmula del **consentimiento expreso** (§ 4) basada en envío del formulario más confirmación por correo de verificación. ¿Es suficiente para que califique como consentimiento expreso conforme al Art. 7?
- La descripción del **bloqueo previo a la supresión** (§ 7) — usamos el lenguaje de los Arts. 2.III, 10 y 24, pero queremos confirmar que es la forma correcta de explicarlo al titular no jurista.
- El plazo de **20 días hábiles + 15 días hábiles** del Art. 31 para resolver ARCO (§ 9). ¿Lo estamos comunicando con claridad suficiente?
- La mención a la **Secretaría Anticorrupción y Buen Gobierno** como autoridad competente (§ 11). ¿La denominación es correcta hoy y la referencia procedimental al Art. 40 LFPDPPP procede?

### Pregunta 5 — Suficiencia del aviso para el caso

El caso de uso es de **bajo riesgo intrínseco**: un solo dato (correo), no sensible, una finalidad clara y acotada (envío de boletín), sin transferencias, retención mínima, baja en un clic, doble opt-in. La base de suscriptores se prevé en el orden de cientos a unos pocos miles de correos.

¿Para este perfil de bajo riesgo, basta con **publicar este aviso integral** + recoger consentimiento + ofrecer baja, o **falta algo más** que la ley o las buenas prácticas exijan (por ejemplo: registro adicional ante autoridad, designación formal de un Oficial de Protección de Datos, documento interno de políticas y procedimientos, evaluación de impacto a la privacidad, otra medida)?

---

## 3. Borrador íntegro del aviso

> El texto que sigue es el aviso tal como aparecería publicado, con los placeholders intactos. Los marcadores entre llaves dobles `{{...}}` señalan los campos que el CEO debe completar después de su revisión. Léalos como "campo a llenar con decisión jurídica" — no son texto del aviso.

> Banner amarillo arriba del documento publicado (no es parte del aviso jurídico, es advertencia mientras esté en borrador):
> **BORRADOR EN REVISIÓN — NO VIGENTE.** Este documento es un borrador redactado a partir de la LFPDPPP vigente (DOF 20-mar-2025). No ha sido aprobado por el CEO ni revisado por persona con criterio jurídico. No constituye asesoría legal ni es el aviso oficial del observatorio. Hasta que sea aprobado y publicado formalmente, este documento no genera obligaciones ni derechos.

---

### Aviso de privacidad — Cómo tratamos tu correo si te suscribes al boletín

Solo recabamos tu correo electrónico, y solo para enviarte el boletín quincenal del observatorio. No vendemos ni compartimos datos. Este aviso describe con detalle qué hacemos, qué no, y cómo puedes ejercer tus derechos en cualquier momento.

*Última actualización del borrador: {{fecha de aprobación}}. Documento redactado conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), vigente desde el 21 de marzo de 2025.*

#### § 1 — Quién es responsable de tus datos.

El responsable del tratamiento de los datos personales que se recaban a través del formulario de suscripción al boletín es **{{razón social o nombre legal completo del responsable; si es persona física, nombre completo; si es persona moral o el ITAM opera como responsable legal, confirmar con asesoría jurídica}}**, con domicilio en **{{domicilio completo para oír y recibir notificaciones (calle, número, colonia, alcaldía/municipio, código postal, ciudad, estado, país)}}**.

Para cualquier asunto relacionado con este aviso de privacidad o con tus datos personales, puedes escribirnos a **{{correo de contacto para asuntos de privacidad — sugerencia técnica: privacidad@datosmexico.org o arco@datosmexico.org; decidir cuál y crear el alias en Cloudflare Email Routing}}**.

#### § 2 — Qué datos recabamos.

Solo recabamos un dato: **tu dirección de correo electrónico**.

No recabamos nombre, apellidos, fecha de nacimiento, dirección postal, teléfono, ocupación, ni ningún otro dato. No recabamos datos personales sensibles en el sentido del artículo 2, fracción VI, de la LFPDPPP (origen racial o étnico, estado de salud, información genética, creencias religiosas o filosóficas, opiniones políticas, preferencia sexual, etcétera).

Aplicamos el principio de minimización: pedimos únicamente lo estrictamente necesario para cumplir la finalidad descrita en la sección siguiente.

#### § 3 — Para qué usamos tu correo.

**Finalidad primaria (requiere tu consentimiento).** Tu correo se utiliza con un único fin: **enviarte el boletín quincenal del observatorio**, que contiene el resumen de las dos semanas previas de actividad publicada en la agenda del sitio.

**Finalidades secundarias.** **No tratamos tu correo para ningún fin secundario.** En particular, no lo usamos para publicidad, perfilamiento, análisis de comportamiento, segmentación comercial, ni para enviarte comunicaciones distintas del boletín. Si en el futuro el observatorio decidiera incorporar alguna finalidad adicional, te lo notificaríamos previamente y solicitaríamos tu consentimiento de nuevo, conforme al artículo 11 de la LFPDPPP.

#### § 4 — Cómo obtenemos tu consentimiento y cómo puedes revocarlo.

Al enviar el formulario de suscripción y, en su caso, confirmar tu suscripción a través del correo de verificación que recibirás, otorgas tu consentimiento expreso para que tratemos tu dirección de correo con la finalidad descrita en § 3.

Puedes revocar tu consentimiento en cualquier momento, sin necesidad de justificar tu decisión, por cualquiera de estas vías:

- Haciendo clic en el enlace de baja ("darme de baja") que aparece al pie de cada boletín que enviamos.
- Enviando un correo a **{{correo para ARCO/baja}}** con el asunto "baja del boletín".

La revocación surte efectos a partir del momento en que la procesamos, sin efectos retroactivos sobre tratamientos previos (art. 7, último párrafo, de la LFPDPPP).

#### § 5 — Cómo limitar el uso o divulgación de tu correo.

Tu correo nunca se divulga públicamente ni se comparte con terceros para fines distintos al envío del boletín. Aun así, la LFPDPPP te garantiza el derecho a limitar el uso de tus datos. Si quieres recibir el boletín pero limitar algún aspecto específico de su tratamiento — por ejemplo, solicitar que tu correo no sea incluido en estadísticas agregadas de apertura o clics —, puedes solicitarlo escribiendo a **{{correo para ARCO}}**. Atenderemos tu solicitud en los plazos descritos en § 9.

#### § 6 — Quién más procesa tu correo en nuestro nombre.

Para el envío material del boletín, recurrimos a un proveedor tecnológico que actúa como *persona encargada* en el sentido del artículo 2, fracción XII, de la LFPDPPP — es decir, procesa tus datos exclusivamente por nuestra cuenta, siguiendo nuestras instrucciones, y sin facultad de tratarlos para sus propios fines. Esto no constituye una transferencia de datos a tercero.

El proveedor encargado del envío es **{{nombre y país del proveedor de envío que se elija (ej. Resend Inc., Estados Unidos; Buttondown, LLC, Estados Unidos; etcétera)}}**. Mantenemos con dicho proveedor un acuerdo de tratamiento de datos que le obliga a aplicar medidas de seguridad equivalentes a las descritas en § 8 y a destruir o devolver los datos al término de la relación contractual.

No vendemos, no rentamos, no compartimos ni cedemos tu correo a ningún otro tercero, salvo requerimiento fundado y motivado de autoridad competente conforme al artículo 9, fracción VII, de la LFPDPPP.

#### § 7 — Cuánto tiempo conservamos tu correo.

Tu correo se conserva en nuestra base de suscriptores mientras mantengas tu suscripción activa. Cuando te das de baja:

- Marcamos tu correo como dado de baja de inmediato y dejamos de enviarte el boletín.
- Mantenemos tu correo en estado de *bloqueo* — sin tratamiento adicional — durante el plazo de prescripción legal aplicable, con el único propósito de poder acreditar, si fuera necesario, que tu solicitud de baja fue atendida (art. 2 fracc. III y art. 24 de la LFPDPPP).
- Concluido ese plazo, suprimimos definitivamente tu correo de nuestros sistemas.

Si ejerces tu derecho de cancelación (§ 9), aplicamos el mismo procedimiento de bloqueo previo a la supresión.

#### § 8 — Cómo protegemos tu correo.

Aplicamos medidas de seguridad administrativas, técnicas y físicas razonables para proteger tu correo contra pérdida, uso, divulgación o acceso no autorizados, conforme al artículo 18 de la LFPDPPP. En lo técnico, esto incluye: almacenamiento cifrado en reposo, transmisión cifrada en tránsito (TLS), control de acceso por rol, y registro de operaciones sobre la base de suscriptores.

En el caso poco probable de una vulneración de seguridad que afecte de forma significativa tus derechos, te lo informaremos de forma inmediata para que puedas tomar medidas en defensa de tus intereses, conforme al artículo 19 de la LFPDPPP.

#### § 9 — Tus derechos ARCO y cómo ejercerlos.

En cualquier momento puedes ejercer tus derechos de **acceso, rectificación, cancelación y oposición** (ARCO), reconocidos por los artículos 22 a 26 de la LFPDPPP:

- **Acceso**: conocer qué datos tuyos tenemos y bajo qué condiciones los tratamos.
- **Rectificación**: corregir tu correo si está mal escrito o lo cambiaste.
- **Cancelación**: pedir que eliminemos tu correo (equivalente a darte de baja del boletín).
- **Oposición**: oponerte al tratamiento de tu correo por una causa legítima, aun si el tratamiento fuera lícito.

**Cómo lo ejerces.** Envía tu solicitud al correo **{{correo para ARCO}}** con la siguiente información, conforme al artículo 28 de la LFPDPPP:

- Tu nombre y un medio para responderte (puede ser el mismo correo).
- Algún documento que acredite tu identidad (o, en su caso, la representación legal de quien actúa por ti).
- Descripción clara del derecho ARCO que quieres ejercer.
- El correo electrónico sobre el cual recae tu solicitud.

Te responderemos en un plazo máximo de **20 días hábiles** desde la recepción de tu solicitud y, si procede, haremos efectiva la determinación dentro de los **15 días hábiles** siguientes, conforme al artículo 31 de la LFPDPPP. El ejercicio de los derechos ARCO es gratuito (art. 34).

#### § 10 — Cómo te informamos de cambios a este aviso.

Si modificamos este aviso de privacidad, publicaremos la nueva versión en esta misma página, con la fecha de última actualización visible al inicio. Cuando los cambios sean sustanciales — por ejemplo, una nueva finalidad de tratamiento o un cambio en los encargados —, te lo notificaremos por correo electrónico antes de que la nueva versión surta efectos, para que puedas decidir si mantienes tu suscripción.

#### § 11 — Autoridad competente.

La autoridad encargada de vigilar el cumplimiento de la LFPDPPP es la **Secretaría Anticorrupción y Buen Gobierno**, conforme al artículo 38 de la propia ley y al Decreto de reforma publicado en el DOF el 20 de marzo de 2025. Si consideras que el tratamiento de tus datos no se ajusta a este aviso, puedes presentar una solicitud de protección de derechos ante dicha Secretaría, en los términos del artículo 40 y siguientes de la LFPDPPP.

#### § 12 — Fundamento legal y vigencia.

Este aviso de privacidad se emite en cumplimiento de los artículos 14, 15, 16 y 17 de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, publicada en el Diario Oficial de la Federación el 20 de marzo de 2025 y vigente a partir del 21 de marzo de 2025.

Vigencia del presente aviso: a partir del **{{fecha de publicación oficial}}** y hasta que sea modificado conforme al procedimiento descrito en § 10.

---

### Resumen de los placeholders que el CEO debe completar antes de publicar

Cinco campos, todos dependientes de las respuestas que esperamos de usted:

| # | Campo | Sección | Depende de |
|---|---|---|---|
| 1 | Razón social / nombre legal del responsable | § 1 | Pregunta 1 |
| 2 | Domicilio del responsable | § 1 | Pregunta 1 |
| 3 | Correo de contacto para privacidad / ARCO | § 1, § 4, § 5, § 9 | Decisión técnica del CEO |
| 4 | Nombre y país del proveedor de envío | § 6 | Decisión técnica del CEO (validada por su pregunta 2) |
| 5 | Fecha de publicación oficial | hero, § 12 | Día de publicación |

---

## 4. Matriz de fundamento legal — qué artículo respalda cada cláusula

Esta tabla es para que usted pueda contrastar rápido sin tener que ir buscando cada referencia en el texto.

| § | Tema | Artículo(s) LFPDPPP |
|---|---|---|
| 1 | Identidad y domicilio del responsable | Art. 15, fracc. I |
| 2 | Datos recabados; declaración de no sensibles | Art. 2, fracc. VI; Art. 15, fracc. II |
| 3 | Finalidades (primaria y secundarias); distinción que requiere consentimiento; cambio futuro | Art. 15, fracc. III; Art. 11 |
| 4 | Consentimiento expreso; revocación; efectos no retroactivos | Art. 7 |
| 5 | Opciones para limitar uso o divulgación | Art. 15, fracc. IV |
| 6 | Persona encargada (no transferencia); excepciones por autoridad | Art. 2, fracc. XII; Art. 2, fracc. XX; Art. 9, fracc. VII |
| 7 | Conservación, bloqueo, supresión | Art. 2, fracc. III; Art. 10; Art. 24 |
| 8 | Medidas de seguridad; notificación de vulneraciones | Art. 18; Art. 19 |
| 9 | Derechos ARCO; requisitos de solicitud; plazos; gratuidad | Arts. 22-26; Art. 28; Art. 31; Art. 34 |
| 10 | Procedimiento de cambios al aviso | Art. 15, fracc. VI |
| 11 | Autoridad competente (Secretaría Anticorrupción y Buen Gobierno) | Art. 38; Decreto DOF 20-mar-2025 |
| 12 | Fundamento legal y vigencia | Arts. 14-17 |

**Fuente normativa de referencia:** Ley Federal de Protección de Datos Personales en Posesión de los Particulares, expedida por el Decreto publicado en el Diario Oficial de la Federación el 20 de marzo de 2025 (Edición Vespertina), pp. 88-99. URL oficial: `https://www.diputados.gob.mx/LeyesBiblio/ref/lfpdppp/LFPDPPP_orig_20mar25.pdf`

---

## Anexo: limitación y agradecimiento

Este borrador fue redactado por el equipo del observatorio a partir del texto íntegro de la ley vigente. **No constituye asesoría legal** y por eso pedimos su revisión. Si después de sus comentarios queda alguna duda jurídica significativa, estamos en posibilidad de iterar antes de publicar — el aviso no es público todavía y el formulario sigue desconectado.

Le agradecemos mucho el tiempo de su revisión informal. Si prefiere comentarlo en una llamada breve antes de devolver observaciones por escrito, también podemos hacerlo así.

**Contacto del observatorio para esta revisión:** {{correo o canal que el CEO indique al lic. Rubí}}
