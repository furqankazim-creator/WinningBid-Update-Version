import Link from "next/link";
import { Section, Eyebrow, NumberedCard } from "@/components/marketing/Section";
import { modules, howItWorks } from "@/lib/marketing-data";
import { brand } from "@/config/brand";

const lifecycle = ["DISCOVER", "QUALIFY", "ANALYZE", "DECIDE", "PLAN", "ENGINEER", "PROCURE", "COST", "PRICE", "PROPOSE", "REVIEW", "APPROVE", "SUBMIT", "WIN/LOSE", "CONTRACT", "PROJECT", "LEARN"];
const workspaceTabs = ["Overview", "Documents", "AI Analysis", "Requirements", "Compliance", "Clarifications", "Qualifications", "Risks", "Engineering", "Procurement", "Costing", "Pricing", "Technical Proposal", "Commercial Proposal", "Reviews", "Deliverables", "Submission", "Result", "Lessons Learned"];

export default function Platform() {
  return (
    <>
      <Section className="pt-6">
        <Eyebrow>{brand.product.toUpperCase()}</Eyebrow>
        <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">The operating system<br />for your bid lifecycle.</h1>
        <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted">Instead of Excel, email, WhatsApp, PDF folders, a separate CRM and separate costing sheets — everything connected in one platform.</p>
        <div className="mt-10 flex flex-wrap gap-1.5">{lifecycle.map((l, i) => <span key={l} className="eyebrow border border-line px-2 py-1 text-ink">{l}{i < lifecycle.length - 1 && <span className="ml-2 text-accent">→</span>}</span>)}</div>
        <Link href="/sign-up" className="mt-10 inline-block rounded-sm bg-accent px-6 py-3 text-white hover:brightness-110">Start free, 3 days</Link>
      </Section>
      <Section dark>
        <Eyebrow>THE MOST IMPORTANT SCREEN</Eyebrow>
        <h2 className="mt-4 font-display text-4xl md:text-5xl">The {brand.workspace}.</h2>
        <p className="mt-4 max-w-2xl text-lg text-cream/70">Header with reference, client, industry, tender type, deadline, value, owner, status, Go/No-Go and a Tender Health score computed from real data — never fabricated. A right sidebar tracks deadline, AI review, missing documents, risk, pricing status and submission readiness.</p>
        <div className="mt-10 flex flex-wrap gap-1.5">{workspaceTabs.map((t) => <span key={t} className="rounded-sm border border-cream/20 px-2.5 py-1 text-sm text-cream/80">{t}</span>)}</div>
      </Section>
      <Section>
        <Eyebrow>MODULES</Eyebrow>
        <h2 className="mt-4 font-display text-4xl md:text-5xl">Everything the bid needs, nothing it doesn&apos;t.</h2>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{modules.map((m) => <NumberedCard key={m.n} {...m} />)}</div>
      </Section>
      <Section dark>
        <Eyebrow>HOW IT WORKS</Eyebrow>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{howItWorks.map((h) => <NumberedCard key={h.n} dark n={h.n} title={h.title} body={h.body} />)}</div>
      </Section>
    </>
  );
}
