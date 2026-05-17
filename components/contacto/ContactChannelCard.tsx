import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ContactChannelCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  email?: string;
  emailLabel?: string;
  emailValue?: string;
  responseTime?: string;
  responseLabel?: string;
  complementaryLink?: { href: string; label: string };
};

function MetaRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-subtle">
        {label}
      </span>
      <span aria-hidden="true" className="text-text-subtle">·</span>
      <span className={cn("font-sans text-[14px] leading-[1.5]", className)}>
        {children}
      </span>
    </div>
  );
}

export function ContactChannelCard({
  icon: Icon,
  title,
  description,
  email,
  emailLabel = "Email",
  emailValue,
  responseTime,
  responseLabel = "Tiempo de respuesta",
  complementaryLink,
}: ContactChannelCardProps) {
  return (
    <article className="flex h-full flex-col rounded-md border border-border bg-background p-6 transition-colors hover:border-foreground/20">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>

      <h3 className="mt-5 font-serif text-[19px] font-semibold leading-[1.3] text-foreground md:text-[20px]">
        {title}
      </h3>
      <p className="mt-3 font-sans text-[15px] leading-[1.6] text-text-subtle">
        {description}
      </p>

      <dl className="mt-auto pt-5">
        <div className="space-y-2 border-t border-border pt-4">
          {email ? (
            <MetaRow label={emailLabel}>
              <a
                href={`mailto:${email}`}
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                {email}
              </a>
            </MetaRow>
          ) : (
            emailValue && (
              <MetaRow label={emailLabel} className="text-foreground">
                {emailValue}
              </MetaRow>
            )
          )}
          {responseTime && (
            <MetaRow label={responseLabel} className="text-foreground">
              {responseTime}
            </MetaRow>
          )}
        </div>

        {complementaryLink && (
          <Link
            href={complementaryLink.href}
            className="mt-4 inline-flex items-center gap-1 font-mono text-[12px] uppercase tracking-[0.08em] text-accent hover:gap-2 transition-[gap]"
          >
            {complementaryLink.label}
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        )}
      </dl>
    </article>
  );
}
