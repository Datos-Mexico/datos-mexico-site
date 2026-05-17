import { Body, Mono } from "@/components/typography";

export function PipelineStep({
  number,
  title,
  body,
  example,
  isLast = false,
}: {
  number: string;
  title: string;
  body: string;
  example?: string;
  isLast?: boolean;
}) {
  return (
    <li className="relative pl-8 md:pl-10">
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-[7px] top-7 bottom-0 w-px bg-border md:left-[9px]"
        />
      )}
      <span
        aria-hidden="true"
        className="absolute left-0 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full border border-border bg-background md:h-5 md:w-5"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent md:h-2 md:w-2" />
      </span>

      <div className="pb-12 md:pb-14">
        <Mono className="block text-[12px] uppercase tracking-[0.12em] text-accent">
          Paso {number}
        </Mono>
        <h3 className="mt-2 font-serif text-[22px] font-semibold leading-[1.3] text-foreground md:text-[24px]">
          {title}
        </h3>
        <Body className="mt-4 max-w-2xl text-[16px] leading-[1.65]">
          {body}
        </Body>

        {example && (
          <figure className="mt-5 max-w-2xl rounded-md bg-muted p-5">
            <figcaption className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground">
              Ejemplo
            </figcaption>
            <p className="mt-2 font-mono text-[13px] leading-[1.6] text-text">
              {example}
            </p>
          </figure>
        )}
      </div>
    </li>
  );
}
