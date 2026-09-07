import { ArenaSection } from "@/components/home/ArenaSection";
import { CtaBanner } from "@/components/home/CtaBanner";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { useDocumentTitle } from "@/hooks/use-document-title";

/**
 * Single-arena marketing homepage:
 * Hero → Stats → The Arena → Features → How it works → Gallery preview →
 * Testimonials → CTA banner. Footer lives in PublicLayout.
 */
export function HomePage() {
  useDocumentTitle("Home");

  return (
    <>
      <Hero />
      <ArenaSection />
      <FeatureGrid />
      <HowItWorks />
      <GalleryPreview />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
