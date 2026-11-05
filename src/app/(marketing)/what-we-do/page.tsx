import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, Eyebrow } from "@/components/marketing/Section";
import { brand } from "@/config/brand";

const blocks = [
  { eyebrow: brand.workspace.toUpperCase(), title: "From opportunity to submission-ready.", body: "A workspace that holds every moving part of a bid: AI document analysis with sources, requirements, compliance, Go/No-Go, clarifications, engineering, procurement, costing, versioned pricing, proposals, reviews and the submission package.", status: "Available now", href: "/platform" },
  { eyebrow: brand.crm.toUpperCase(), title: "The pipeline, before the tender lands.", body: "Companies, contacts, opportunities and inquiry intake from email, WhatsApp and the web. A prospect that reaches the Tender stage opens straight into a workspace — same client, same scope.", status: "Available now", href: "/crm" },
  { eyebrow: "INDUSTRY TEMPLATES", title: "Specialised by configuration, not by code.", body: "Oil & Gas, Infrastructure, Construction, Manufacturing, IT, Healthcare, Government and more ship as templates. Administrators build their own: services, compliance, documents, risk and cost categories, engineering sections, proposal structure.", status: "Available now", href: "/industries" },
];

export default function WhatWeDo() {
  return (
    <>
      <Section className="pt-6">
        <Eyebrow>WHAT WE DO</Eyebrow>
        <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">Insight. Strategy. Execution.</h1>
        <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted">We build the operating system for tender and business-development teams — designed by people who have run bids across industries, not analysts who have read about them.</p>
      </Section>
      <Section dark className="!pt-0">
        <div className="divide-y divide-cream/15">
          {blocks.map((b) => (
            <div key={b.title} className="grid gap-6 py-14 md:grid-cols-[1fr_2fr]">
              <div>
                <Eyebrow>{b.eyebrow}</Eyebrow>
                <span className="eyebrow mt-3 inline-block border border-cream/30 px-2 py-1 text-cream/70">{b.status}</span>
              </div>
              <div>
                <h2 className="font-display text-4xl">{b.title}</h2>
                <p className="mt-4 text-lg leading-relaxed text-cream/70">{b.body}</p>
                <Link href={b.href} className="mt-6 inline-flex items-center gap-2 text-accent hover:underline">Learn more <ArrowRight size={16} /></Link>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
