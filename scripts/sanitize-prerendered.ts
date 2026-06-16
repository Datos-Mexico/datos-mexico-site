// Salvaguarda: sanitiza el HTML pre-renderizado por react-markdown +
// markdownComponents antes de empaquetarlo en los registries. Garantiza que
// el dangerouslySetInnerHTML del runtime nunca reciba etiquetas o atributos
// fuera del allowlist, ni hoy ni si el corpus crece con contenido nuevo.
//
// El allowlist permite exactamente lo que el render legítimo produce:
// elementos markdown estándar (h1-h6, p, lists, blockquote, code, pre, hr,
// tabla y sus hijos, anchor, énfasis), el div/span que los componentes
// custom envuelven (table-wrapper y li>span.block), y `class` (Tailwind) +
// href/target/rel en anchors.
//
// Solo se ejecuta en build-time (importado por los build:*-registry scripts).
// El postProcess re-normaliza self-closing tags (<hr ... /> → <hr .../>)
// para preservar identidad bit-exacta con la salida de renderToString.

import sanitizeHtml from "sanitize-html";

export const sanitizeConfig: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr",
    "a",
    "strong", "em",
    "code", "pre",
    "blockquote",
    "ul", "ol", "li",
    "table", "thead", "tbody", "tr", "th", "td",
    "div", "span",
  ],
  allowedAttributes: {
    "*": ["class"],
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  selfClosing: ["hr", "br"],
  parser: { decodeEntities: false },
};

function postProcess(html: string): string {
  return html.replace(/<(hr|br)((?:\s[^>]*)?)\s\/>/g, "<$1$2/>");
}

export function sanitizePrerenderedHtml(html: string): string {
  return postProcess(sanitizeHtml(html, sanitizeConfig));
}
