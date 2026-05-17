import type { Category, CategorySlug } from "./types";

export const categories: readonly Category[] = [
  {
    slug: "mercado-laboral",
    label: "Mercado laboral",
    description:
      "Análisis sobre empleo, salarios, productividad y condiciones laborales en México.",
  },
  {
    slug: "pensiones",
    label: "Pensiones y ahorro para el retiro",
    description:
      "Sistema de pensiones, AFORES, SAR y la trayectoria del ahorro para el retiro en México.",
  },
  {
    slug: "hogares-bienestar",
    label: "Hogares y bienestar",
    description:
      "Ingreso, gasto, pobreza y bienestar de los hogares mexicanos.",
  },
] as const;

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function isValidCategorySlug(slug: string): slug is CategorySlug {
  return categories.some((c) => c.slug === slug);
}
