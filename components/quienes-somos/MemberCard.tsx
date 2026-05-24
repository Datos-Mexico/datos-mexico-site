import { Globe } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Body, Mono } from "@/components/typography";
import {
  LinkedinIcon,
  TwitterIcon,
  GithubIcon,
} from "@/components/ui/SocialIcons";
import { cn } from "@/lib/utils";
import { teamTagLabels, type TeamMember } from "@/lib/team";

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
    <article className="flex h-full flex-col rounded-lg border border-border bg-background p-6 transition-colors hover:border-foreground/20">
      {member.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.photo}
          alt={member.name}
          className="h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <Avatar
          initials={member.initials}
          size="md"
          className="h-24 w-24 text-[32px]"
        />
      )}

      {member.tag && (
        <Badge
          variant={
            member.tag === "equipo-tecnico-fundador" ? "outline" : "default"
          }
          className="mt-5 self-start"
        >
          {teamTagLabels[member.tag]}
        </Badge>
      )}

      <h3
        className={cn(
          "font-serif text-[19px] font-semibold leading-[1.3] text-foreground md:text-[20px]",
          member.tag ? "mt-2" : "mt-5",
        )}
      >
        {member.name}
      </h3>
      <Body className="mt-1 text-[14px] text-text-subtle">{member.career}</Body>
      {member.year !== "" && (
        <Mono className="mt-2 block text-[12px]">{member.year}</Mono>
      )}

      {member.bio !== "" && (
        <Body className="mt-4 text-[15px] leading-[1.6] text-text">
          {member.bio}
        </Body>
      )}

      {linkEntries.length > 0 && (
        <ul className="mt-auto flex items-center gap-3 pt-6">
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
                    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-subtle",
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
