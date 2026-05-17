"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { ExternalLinkIcon } from "@/components/ui/ExternalLinkIcon";
import { navigation } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <Container>
        <div className="flex h-16 items-center justify-between md:h-[72px]">
          <Logo variant="default" withWordmark size="md" />

          <nav
            className="hidden items-center gap-7 md:flex"
            aria-label="Navegación principal"
          >
            {navigation.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>

          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden",
              "text-foreground hover:bg-muted transition-colors",
            )}
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>

      {open && (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-border bg-background"
        >
          <Container>
            <nav
              className="flex flex-col py-6"
              aria-label="Navegación móvil"
            >
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-b border-border py-4 font-sans text-[17px] text-foreground"
                >
                  <span>{item.label}</span>
                  {item.external && (
                    <ExternalLinkIcon className="text-text-subtle" />
                  )}
                </Link>
              ))}
              <div className="pt-6">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => setOpen(false)}
                  href="/boletin"
                >
                  Suscríbete al boletín
                </Button>
              </div>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}

function NavItem({
  label,
  href,
  external,
}: {
  label: string;
  href: string;
  external?: boolean;
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-sans text-[15px] font-medium text-foreground hover:text-primary transition-colors"
      >
        {label}
        <ExternalLinkIcon className="text-text-subtle" />
      </a>
    );
  }
  return (
    <Link
      href={href}
      className="font-sans text-[15px] font-medium text-foreground hover:text-primary transition-colors"
    >
      {label}
    </Link>
  );
}
