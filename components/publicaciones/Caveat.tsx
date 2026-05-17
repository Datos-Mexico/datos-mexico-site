import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function Caveat({ children }: Props) {
  return (
    <aside
      aria-label="Salvedad metodológica"
      className="my-8 rounded-md border-l-4 border-accent bg-muted px-6 py-5 font-sans text-[16px] leading-[1.65] text-text"
    >
      {children}
    </aside>
  );
}
