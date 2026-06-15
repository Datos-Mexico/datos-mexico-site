import Link from "next/link";
import { Body, Mono } from "@/components/typography";
import { LinkedinIcon, TwitterIcon } from "@/components/ui/SocialIcons";
import { formatDateLong } from "@/lib/publicaciones/format";
import type { TransparenciaPiece } from "@/lib/transparencia/types";

type Props = {
  pieza: TransparenciaPiece;
};

export function TransparenciaFooter({ pieza }: Props) {
  const url = `https://datosmexico.org/transparencia/${pieza.slug}`;
  const text = pieza.title;

  const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const linkedinIntent = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <footer className="mt-14 max-w-3xl border-t border-border pt-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Mono className="block text-[12px] uppercase tracking-[0.12em]">
            Firma
          </Mono>
          <Body className="mt-2 text-[16px] font-medium">
            <Link
              href="/quienes-somos"
              className="text-foreground hover:underline underline-offset-4"
            >
              Observatorio Datos México
            </Link>
          </Body>
          <Mono className="mt-3 block text-[13px]">
            Publicado el {formatDateLong(pieza.publishedAt)}
          </Mono>
        </div>

        {pieza.status === "published" && (
          <div>
            <Mono className="block text-[12px] uppercase tracking-[0.12em]">
              Compartir
            </Mono>
            <ul className="mt-3 flex items-center gap-3">
              <li>
                <a
                  href={twitterIntent}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compartir en Twitter"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-subtle transition-colors hover:border-foreground hover:text-foreground"
                >
                  <TwitterIcon className="h-4 w-4" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={linkedinIntent}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compartir en LinkedIn"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-subtle transition-colors hover:border-foreground hover:text-foreground"
                >
                  <LinkedinIcon className="h-4 w-4" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </footer>
  );
}
