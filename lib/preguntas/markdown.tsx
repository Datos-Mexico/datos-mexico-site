import type { ComponentProps } from "react";
import type { Components } from "react-markdown";
import { Body, H2, H3, Mono } from "@/components/typography";
import { cn } from "@/lib/utils";

export const markdownComponents: Components = {
  h1: () => null,
  h2: ({ children }) => <H2 className="mt-12">{children}</H2>,
  h3: ({ children }) => <H3 className="mt-10">{children}</H3>,
  p: ({ children }) => <Body className="mt-5">{children}</Body>,
  ul: ({ children }) => (
    <ul className="mt-5 space-y-2 pl-5 marker:text-text-subtle">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-5 list-decimal space-y-2 pl-6 marker:text-text-subtle">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="font-sans text-[16px] leading-[1.6] text-text md:text-[17px] md:leading-[1.65]">
      <span className="block">{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-2 border-border bg-muted/40 px-5 py-4 italic text-text-subtle">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => {
    const isExternal = typeof href === "string" && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className="text-primary underline underline-offset-4 hover:text-primary-hover"
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  },
  code: ({ className, children, ...rest }: ComponentProps<"code">) => {
    const isInline = !className?.includes("language-");
    if (isInline) {
      return (
        <Mono
          as="code"
          className="rounded bg-muted px-1.5 py-0.5 text-[13px] text-text"
        >
          {children}
        </Mono>
      );
    }
    return (
      <code className={cn("font-mono text-[13px]", className)} {...rest}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mt-6 overflow-x-auto rounded-md border border-border bg-muted/40 p-4 text-[13px] leading-[1.5]">
      {children}
    </pre>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="my-10 border-t border-border" />,
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse border border-border text-left text-[14px]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/60">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-border px-3 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-3 py-2 align-top">{children}</td>
  ),
};
