import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import { Caveat } from "./Caveat";
import { KeyFigure } from "./KeyFigure";
import { Visualization } from "./Visualization";

export const publicationMdxComponents: MDXComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-12 font-serif text-[26px] font-semibold leading-[1.2] tracking-tight text-foreground first:mt-0 md:text-[36px] md:leading-[1.2]"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className="mt-10 font-serif text-[22px] font-semibold leading-[1.3] tracking-tight text-foreground md:text-[24px] md:leading-[1.3]"
      {...props}
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p
      className="mt-6 font-sans text-[17px] leading-[1.75] text-text md:text-[18px]"
      {...props}
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="mt-6 list-disc space-y-2 pl-6 font-sans text-[17px] leading-[1.75] text-text md:text-[18px]"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="mt-6 list-decimal space-y-2 pl-6 font-sans text-[17px] leading-[1.75] text-text md:text-[18px]"
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="pl-1" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="mt-8 border-l-4 border-border pl-5 font-serif text-[18px] italic leading-[1.6] text-text-subtle md:text-[19px]"
      {...props}
    />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => {
    const isExternal = props.href?.startsWith("http") ?? false;
    return (
      <a
        className="text-primary underline-offset-4 hover:underline"
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        {...props}
      />
    );
  },
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-text"
      {...props}
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="mt-6 overflow-x-auto rounded-lg border border-border bg-muted p-4 font-mono text-[14px] leading-[1.5] text-text"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-border" />,
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="mt-6 overflow-x-auto">
      <table
        className="w-full border-collapse font-sans text-[15px] leading-[1.6]"
        {...props}
      />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="border-b border-border px-3 py-2 text-left font-mono text-[12px] uppercase tracking-[0.08em] text-text-subtle"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td
      className="border-b border-border px-3 py-2 align-top text-text"
      {...props}
    />
  ),
  small: (props: ComponentPropsWithoutRef<"small">) => (
    <small
      className="font-mono text-[14px] leading-[1.5] tracking-tight text-text-subtle"
      {...props}
    />
  ),
  Caveat,
  KeyFigure,
  Visualization,
};
