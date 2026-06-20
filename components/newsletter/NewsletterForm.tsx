"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { ArrowRight, Check, Loader } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  isValidEmail,
  liveSubmit,
  type NewsletterSubmitFn,
} from "@/lib/newsletter";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

export type NewsletterFormProps = {
  onSubmit?: NewsletterSubmitFn;
  size?: "sm" | "lg";
  variant?: "default" | "dark";
  successMessage?: string;
  ctaText?: string;
  showLabel?: boolean;
};

export function NewsletterForm({
  onSubmit = liveSubmit,
  size = "lg",
  variant = "default",
  successMessage = "Te enviamos un correo a tu dirección. Abre el enlace para confirmar la suscripción. (Revisa también la carpeta de spam la primera vez.)",
  ctaText = "Suscribirme",
  showLabel,
}: NewsletterFormProps) {
  const id = useId();
  const inputId = `newsletter-${id}`;
  const consentId = `newsletter-consent-${id}`;
  const errorId = `newsletter-error-${id}`;

  const [email, setEmail] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const dark = variant === "dark";
  const isLg = size === "lg";
  const renderLabel = showLabel ?? isLg;

  const canSubmit = consentChecked && status !== "loading";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    const value = email.trim();
    if (!isValidEmail(value)) {
      setStatus("error");
      setErrorMessage("Introduce un correo electrónico válido.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const result = await onSubmit(value);
      if (result.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(
          result.error ??
            "Algo salió mal. Inténtalo de nuevo o escríbenos.",
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage("Algo salió mal. Inténtalo de nuevo o escríbenos.");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "flex items-start gap-3 rounded-md border px-5 py-4",
          dark
            ? "border-primary/40 bg-primary/15 text-text-inverse"
            : "border-primary/30 bg-primary/5 text-foreground",
        )}
      >
        <Check
          className={cn(
            "mt-0.5 h-5 w-5 flex-shrink-0",
            dark ? "text-primary" : "text-primary",
          )}
          aria-hidden="true"
        />
        <p className="font-sans text-[15px] leading-[1.55]">{successMessage}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-describedby={status === "error" ? errorId : undefined}
      className="w-full"
    >
      {renderLabel && (
        <label
          htmlFor={inputId}
          className={cn(
            "mb-2 block font-sans text-[14px] font-medium",
            dark ? "text-text-inverse" : "text-foreground",
          )}
        >
          Correo electrónico
        </label>
      )}

      <div
        className={cn(
          "flex flex-col gap-3",
          isLg ? "sm:flex-row sm:gap-2" : "sm:flex-row sm:gap-2",
        )}
      >
        <label htmlFor={inputId} className="sr-only">
          Correo electrónico
        </label>
        <Input
          id={inputId}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setErrorMessage("");
            }
          }}
          disabled={status === "loading"}
          aria-invalid={status === "error"}
          className={cn(
            "flex-1",
            isLg && "h-12 text-[16px]",
            dark &&
              "border-white/20 bg-white/5 text-text-inverse placeholder:text-white/40 focus-visible:ring-primary",
          )}
        />
        <Button
          type="submit"
          variant="primary"
          size={isLg ? "lg" : "md"}
          disabled={!canSubmit}
          className={cn(isLg ? "sm:w-auto" : "sm:w-auto", "w-full")}
        >
          {status === "loading" ? (
            <>
              <Loader
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
              Enviando…
            </>
          ) : (
            <>
              {ctaText}
              {isLg && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </>
          )}
        </Button>
      </div>

      <div className={cn("mt-3 flex items-start gap-2")}>
        <input
          id={consentId}
          type="checkbox"
          checked={consentChecked}
          onChange={(e) => {
            setConsentChecked(e.target.checked);
            if (status === "error") {
              setStatus("idle");
              setErrorMessage("");
            }
          }}
          disabled={status === "loading"}
          required
          className={cn(
            "mt-1 h-4 w-4 flex-shrink-0 rounded border-2 cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            dark
              ? "border-white/30 bg-white/5 accent-primary"
              : "border-foreground/30 accent-primary",
          )}
        />
        <label
          htmlFor={consentId}
          className={cn(
            "font-sans text-[13px] leading-[1.5] cursor-pointer select-none",
            dark ? "text-white/80" : "text-foreground/80",
          )}
        >
          Acepto el{" "}
          <Link
            href="/privacidad"
            prefetch={false}
            className={cn(
              "underline underline-offset-2",
              dark ? "text-white hover:text-white/90" : "text-foreground hover:text-foreground/80",
            )}
          >
            aviso de privacidad
          </Link>{" "}
          de Datos México.
        </label>
      </div>

      <p
        id={errorId}
        role="alert"
        aria-live="polite"
        className={cn(
          "mt-2 min-h-[1.25rem] font-sans text-[13px] leading-[1.4]",
          status === "error" ? "text-danger" : "sr-only",
        )}
      >
        {status === "error" ? errorMessage : ""}
      </p>
    </form>
  );
}
