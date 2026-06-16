import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  note: string;
  children: ReactNode;
  table: ReactNode;
};

export function ChartCard({ eyebrow, title, note, children, table }: Props) {
  return (
    <figure className="my-10 rounded-lg border border-border bg-muted/40 p-5 md:p-6">
      <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-text-subtle">
        {eyebrow}
      </p>
      <p className="mt-2 font-serif text-[18px] font-semibold leading-[1.3] text-foreground md:text-[20px]">
        {title}
      </p>

      <div className="mt-5">{children}</div>

      <figcaption className="mt-5">
        <div className="overflow-x-auto">{table}</div>
        <p className="mt-4 font-sans text-[13px] leading-[1.6] text-text-subtle">
          {note}
        </p>
      </figcaption>
    </figure>
  );
}
