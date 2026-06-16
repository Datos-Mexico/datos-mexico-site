import { TocList } from "./TocList";
import type {
  TocEntry,
  TransparenciaSummaryHtml,
} from "@/lib/transparencia/types";

type Props = {
  summaryHtml: TransparenciaSummaryHtml;
  toc: ReadonlyArray<TocEntry>;
  onClickTocEntry?: () => void;
};

type ItemProps = { label: string; html: string };

function Item({ label, html }: ItemProps) {
  return (
    <div>
      <dt className="font-serif text-[14px] font-semibold text-foreground">
        {label}
      </dt>
      <dd
        className="mt-1 text-text-subtle [&>p]:m-0 [&>p]:font-sans [&>p]:text-[14px] [&>p]:leading-[1.55]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export function SummaryGuiaContent({
  summaryHtml,
  toc,
  onClickTocEntry,
}: Props) {
  return (
    <div>
      <section aria-labelledby="lo-esencial-heading">
        <h3
          id="lo-esencial-heading"
          className="font-mono text-[12px] uppercase tracking-[0.12em] text-text-subtle"
        >
          Lo esencial
        </h3>
        <dl className="mt-4 space-y-4">
          <Item label="Qué se preguntó." html={summaryHtml.pregunta} />
          <Item label="Sobre los precios." html={summaryHtml.precios} />
          <Item label="Sobre los contratos." html={summaryHtml.contratos} />
          <Item
            label="Lo que sigue sin saberse."
            html={summaryHtml.frontera}
          />
        </dl>
      </section>

      <hr className="my-6 border-t border-border" />

      <section aria-labelledby="guia-heading">
        <h3
          id="guia-heading"
          className="font-mono text-[12px] uppercase tracking-[0.12em] text-text-subtle"
        >
          Guía
        </h3>
        <TocList entries={toc} onClickEntry={onClickTocEntry} />
      </section>
    </div>
  );
}
