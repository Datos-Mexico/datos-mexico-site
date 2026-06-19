import { Globe } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Body } from "@/components/typography";
import {
  LinkedinIcon,
  TwitterIcon,
  GithubIcon,
} from "@/components/ui/SocialIcons";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/lib/team";

type MemberCardProps = {
  member: TeamMember;
};

const linkIcons = {
  linkedin: LinkedinIcon,
  twitter: TwitterIcon,
  github: GithubIcon,
  website: Globe,
} as const;

const linkLabels = {
  linkedin: "LinkedIn",
  twitter: "Twitter",
  github: "GitHub",
  website: "Sitio web",
} as const;

export function MemberCard({ member }: MemberCardProps) {
  const linkEntries = (
    Object.entries(member.links) as Array<
      [keyof typeof linkIcons, string | undefined]
    >
  ).filter(([, href]) => Boolean(href)) as Array<
    [keyof typeof linkIcons, string]
  >;

  return (
    <article className="flex h-full flex-col">
      {member.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.photo}
          alt={member.name}
          className="aspect-square w-full rounded-md object-cover"
        />
      ) : (
        // Slot cuadrado: ocupa todo el ancho de la columna del grid y
        // escala las iniciales al ancho disponible. Calibrado para grid
        // de 5 columnas a partir de lg (cards ~170-200px), idéntico en
        // ambos tiers.
        <Avatar
          initials={member.initials}
          size="lg"
          className="h-auto w-full aspect-square text-[56px] md:text-[64px] lg:text-[40px] xl:text-[44px]"
        />
      )}

      <h3
        className={cn(
          "mt-5 font-serif text-[18px] font-semibold leading-[1.3] text-foreground md:text-[19px] lg:text-[16px]",
        )}
      >
        {member.name}
      </h3>
      <Body className="mt-1 text-[14px] leading-[1.5] text-text-subtle lg:text-[13px] lg:leading-[1.45]">
        {member.career}
      </Body>

      {member.bio !== "" && (
        <Body className="mt-3 text-[14px] leading-[1.6] text-text">
          {member.bio}
        </Body>
      )}

      {linkEntries.length > 0 && (
        <ul className="mt-auto flex items-center gap-2 pt-5">
          {linkEntries.map(([kind, href]) => {
            const Icon = linkIcons[kind];
            return (
              <li key={kind}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} en ${linkLabels[kind]}`}
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded border border-border text-text-subtle",
                    "hover:border-foreground hover:text-foreground transition-colors",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
