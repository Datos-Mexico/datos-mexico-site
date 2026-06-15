import { Hero } from "@/components/sections/Hero";
import { DataStrip } from "@/components/sections/DataStrip";
import { QuienesSomosPreview } from "@/components/sections/QuienesSomosPreview";
import { Principios } from "@/components/sections/Principios";
import { Publicaciones } from "@/components/sections/Publicaciones";
import { Transparencia } from "@/components/sections/Transparencia";
import { Metodologia } from "@/components/sections/Metodologia";
import { Newsletter } from "@/components/sections/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <DataStrip />
      <QuienesSomosPreview />
      <Principios />
      <Publicaciones />
      <Transparencia />
      <Metodologia />
      <Newsletter />
    </>
  );
}
