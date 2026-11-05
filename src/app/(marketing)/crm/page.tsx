import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, Eyebrow, NumberedCard } from "@/components/marketing/Section";
import { DemoForm } from "@/components/marketing/Forms";
import { crmStages, crmFeatures } from "@/lib/marketing-data";
import { brand } from "@/config/brand";

export default function CRMPage() {
  return (
    <>
      <Section className="pt-6">
        <Eyebrow>{brand.crm.toUpperCase()}</Eyebrow>
        <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">The pipeline, before<br />the tender lands.</h1>
        <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted">{brand.crm} tracks opportunities in any industry from first contact to contract: prospects, clients, competitors and the commercial numbers behind every bid decision.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a href="#access" className="rounded-sm bg-accent px-6 py-3 text-white hover:brightness-110">Request access</a>
          <a href="#pipeline" className="border border-ink px-6 py-3 hover:bg-ink hover:text-cream">See the pipeline ↓</a>
        </div>
      </Section>

      <Section dark className="!py-0" >
        <div id="pipeline">
          <Eyebrow>THE PIPELINE</Eyebrow>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">Lead to Won. One record, start to close.</h2>
          <div className="mt-14 grid gap-px bg-cream/15 md:grid-cols-4">
            {crmStages.map((s) => (
              <div key={s.n} className="bg-navy p-6">
                <span className="font-display text-5xl text-accent">{s.n}</span>
                <h3 className="mt-4 font-display text-2xl">{s.title}</h3>
                <p className="mt-2 text-cream/70">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <Eyebrow>WHAT&apos;S IN IT</Eyebrow>
        <h2 className="mt-4 font-display text-4xl md:text-5xl">Everything the desk needs before the bid.</h2>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {crmFeatures.map((f) => <NumberedCard key={f.n} {...f} />)}
        </div>
      </Section>

      <Section dark>
        <Eyebrow>BETTER TOGETHER</Eyebrow>
        <h2 className="mt-4 font-display text-4xl md:text-5xl">One client record. Two workspaces.</h2>
        <p className="mt-6 max-w-3xl text-lg text-cream/70">{brand.crm} and the {brand.workspace} share the same client, contact and competitor data. The moment a prospect reaches the Tender stage, it opens straight into a workspace, no re-entry, no second source of truth.</p>
        <Link href="/platform" className="mt-8 inline-flex items-center gap-2 text-accent hover:underline">Explore the platform <ArrowRight size={16} /></Link>
      </Section>

      <Section>
        <div id="access" className="grid gap-12 md:grid-cols-2">
          <div>
            <Eyebrow>SECURE YOUR COMPETITIVE EDGE</Eyebrow>
            <h2 className="mt-4 font-display text-4xl">Stop tracking in spreadsheets. Start winning tenders.</h2>
            <p className="mt-4 text-muted">Ready to transform how your team manages opportunities? Request access and get a first-look demonstration of {brand.crm} in action.</p>
          </div>
          <DemoForm />
        </div>
      </Section>
    </>
  );
}
