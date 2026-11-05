import Link from "next/link";
import { Check } from "lucide-react";
import { Section, Eyebrow } from "@/components/marketing/Section";
import { FAQ } from "@/components/marketing/Forms";
import { plans, faq } from "@/lib/marketing-data";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

export default function PricingPage() {
  return (
    <>
      <Section className="pt-6">
        <Eyebrow>PRICING</Eyebrow>
        <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-6xl">From opportunity to submission-ready in one platform.</h1>
        <p className="mt-6 max-w-2xl text-xl text-muted">{brand.company} pulls every requirement, compliance check, clarification, risk, price version and deliverable into a single sourced workspace — for any industry.</p>
        <p className="mt-4 font-mono text-sm text-ink"><span className="text-accent">3</span>-day free trial on every plan, cancel anytime.</p>
        <p className="text-sm text-muted">After your 3-day free trial, you will be automatically billed the standard rate unless cancelled.</p>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={cn("relative flex flex-col border p-7", p.popular ? "border-accent bg-white/60" : "border-line bg-white/30")}>
              {p.popular && <span className="eyebrow absolute -top-3 left-6 bg-accent px-2 py-1 text-white">Most popular</span>}
              <h3 className="font-display text-2xl">{p.name}</h3>
              <p className="mt-4 font-display text-5xl">${p.price.toLocaleString()}<span className="text-base text-muted">/month</span></p>
              <p className="mt-2 text-sm text-muted">Free for 3 days, then ${p.price.toLocaleString()}/month</p>
              <p className="text-xs text-muted">Taxes may apply and will be calculated at checkout.</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.features.map((f) => <li key={f} className="flex gap-2 text-[15px]"><Check size={16} className="mt-1 shrink-0 text-accent" />{f}</li>)}
              </ul>
              <Link href={`/sign-up?plan=${p.name.toLowerCase()}`} className={cn("mt-8 block rounded-sm py-3 text-center", p.popular ? "bg-accent text-white hover:brightness-110" : "border border-ink hover:bg-ink hover:text-cream")}>Choose plan</Link>
            </div>
          ))}
        </div>
      </Section>
      <Section className="!pt-0">
        <Eyebrow>FAQ</Eyebrow>
        <h2 className="mt-4 mb-10 font-display text-4xl">Common questions.</h2>
        <FAQ items={faq} />
        <p className="mt-8 text-muted">Still have a question? <a href={`mailto:${brand.email}`} className="text-accent underline">Email us</a> and we reply within one business day.</p>
      </Section>
    </>
  );
}
