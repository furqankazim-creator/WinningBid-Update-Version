import { Section, Eyebrow } from "@/components/marketing/Section";
import { brand } from "@/config/brand";

export default function Page() {
  return (
    <Section className="pt-6">
      <Eyebrow>LEGAL</Eyebrow>
      <h1 className="mt-6 font-display text-5xl">Terms of Service</h1>
      <p className="mt-6 max-w-3xl text-lg text-muted">Last updated {new Date().getFullYear()}. This page is a placeholder for {brand.company}&apos;s Terms of Service. Replace this copy with your reviewed legal text before launch.</p>
    </Section>
  );
}
