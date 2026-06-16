export function ArticuloBody({ body_html }: { body_html: string }) {
  return (
    <div
      className="mt-10 max-w-3xl"
      dangerouslySetInnerHTML={{ __html: body_html }}
    />
  );
}
