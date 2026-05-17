type KpiItem = {
  label: string;
  value: string | number;
  unit?: string;
  emphasis?: boolean;
};

type KpiGridProps = {
  items: KpiItem[];
  caption?: string;
};

export function KpiGrid({ items, caption }: KpiGridProps) {
  return (
    <figure className="my-8">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {items.map((item, i) => (
          <div key={i} className="border-l-4 border-border pl-4">
            <p
              className={`font-serif text-3xl ${item.emphasis ? "text-primary" : "text-foreground"}`}
            >
              {item.value}
              {item.unit && (
                <span className="ml-1 font-sans text-base text-text-subtle">
                  {item.unit}
                </span>
              )}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-text-subtle">
              {item.label}
            </p>
          </div>
        ))}
      </div>
      {caption && (
        <figcaption className="mt-4 text-center font-mono text-xs text-text-subtle">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
