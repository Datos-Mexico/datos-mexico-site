export function TransparenciaBody({ html }: { html: string }) {
  return (
    <div
      className="mt-12 max-w-3xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
