import { Mono, Small } from "@/components/typography";

type Props = {
  value: string;
  label: string;
  source?: string;
};

export function KeyFigure({ value, label, source }: Props) {
  return (
    <figure className="my-10 rounded-lg border border-border bg-background p-6 md:p-8">
      <p className="font-serif text-[44px] font-semibold leading-[1.05] tracking-tight text-primary md:text-[56px]">
        {value}
      </p>
      <Small className="mt-3 block text-[15px] text-text">{label}</Small>
      {source && (
        <Mono className="mt-3 block text-[12px]">{source}</Mono>
      )}
    </figure>
  );
}
