import { Container } from "@/components/layout/Container";

const stats = [
  { value: "38.8M", label: "Hogares analizados (ENIGH 2024)" },
  { value: "246,831", label: "Servidores públicos CDMX" },
  { value: "$10.13 bill", label: "MXN administrados en SAR (CONSAR 1998–2025)" },
  { value: "13/13", label: "Validaciones contra INEGI passing" },
];

export function DataStrip() {
  return (
    <section className="border-b border-border bg-background py-12 md:py-16">
      <Container>
        <ul
          className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-x-0"
          aria-label="Cifras clave del observatorio"
        >
          {stats.map((stat, index) => (
            <li
              key={stat.label}
              className={
                "flex flex-col items-start text-left md:px-8 " +
                (index !== 0 ? "md:border-l md:border-border" : "")
              }
            >
              <span className="font-serif text-[36px] font-semibold leading-none text-primary tabular-nums md:text-[44px]">
                {stat.value}
              </span>
              <span className="mt-3 font-sans text-[13px] leading-[1.4] text-text-subtle md:text-[14px]">
                {stat.label}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
