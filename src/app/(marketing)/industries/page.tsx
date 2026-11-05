import { Section, Eyebrow } from "@/components/marketing/Section";
import { industries } from "@/lib/industries";
import { brand } from "@/config/brand";

export default function Industries() {
  return (
    <>
      <Section className="pt-6">
        <Eyebrow>INDUSTRIES</Eyebrow>
        <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">One platform.<br />Every industry.</h1>
        <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted">{brand.company} ships with {industries.length - 1} industry templates and an administrator template builder. Each template configures the compliance checklist, cost and risk categories, engineering workspace and proposal structure — the core stays the same.</p>
      </Section>
      <Section dark className="!pt-0">
        <div className="divide-y divide-cream/15">
          {industries.filter((i) => i.id !== "other").map((i) => (
            <div key={i.id} className="grid gap-6 py-10 md:grid-cols-[1fr_2fr]">
              <div><p className="text-3xl">{i.icon}</p><h2 className="mt-2 font-display text-3xl">{i.name}</h2><p className="mt-2 text-sm text-cream/60">{i.services.join(" · ")}</p></div>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div><p className="eyebrow text-accent">Compliance template</p><ul className="mt-2 space-y-1 text-cream/75">{i.compliance.slice(-4).map((c) => <li key={c}>• {c}</li>)}</ul></div>
                <div><p className="eyebrow text-accent">Engineering workspace</p><ul className="mt-2 space-y-1 text-cream/75">{i.engineeringSections.slice(0, 4).map((c) => <li key={c}>• {c}</li>)}</ul></div>
                <div><p className="eyebrow text-accent">Requirement focus</p><p className="mt-2 text-cream/75">{i.requirementFocus.join(", ")}</p></div>
                <div><p className="eyebrow text-accent">Cost categories</p><p className="mt-2 text-cream/75">{i.costCategories.length} configured</p></div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
