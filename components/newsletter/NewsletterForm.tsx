"use client";

import { useId, useState, type FormEvent } from "react";
import { ArrowRight, Check, Loader } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  defaultSimulatedSubmit,
  isValidEmail,
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
  onSubmit = defaultSimulatedSubmit,
  size = "lg",
  variant = "default",
  successMessage = "¡Listo! Te enviaremos un correo de confirmación.",
  ctaText = "Suscribirme",
  showLabel,
}: NewsletterFormProps) {
  const id = useId();
  const inputId = `newsletter-${id}`;
  const errorId = `newsletter-error-${id}`;

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const dark = variant === "dark";
  const isLg = size === "lg";
  const renderLabel = showLabel ?? isLg;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;

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
          disabled={status === "loading"}
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
