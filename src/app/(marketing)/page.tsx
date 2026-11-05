"use client";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { Hero } from "@/components/marketing/Hero";
import { Section, Eyebrow, NumberedCard } from "@/components/marketing/Section";
import { DemoForm } from "@/components/marketing/Forms";
import { brand } from "@/config/brand";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export default function Home() {
  const { t, lang, isRtl } = useI18n();

  const howItWorks = [
    {
      n: "01",
      title: lang === "ar" ? "استكشاف" : "DISCOVER",
      body: lang === "ar" ? "ابحث عن الفرص وأدر العملاء المحتملين. استقبل الاستفسارات من البريد الإلكتروني والواتساب في مسار عمل موحد." : "Find opportunities and manage prospects. Inquiries from email, WhatsApp and the web land in one pipeline.",
    },
    {
      n: "02",
      title: lang === "ar" ? "تحليل" : "ANALYZE",
      body: lang === "ar" ? "ارفع كراسات الشروط والعقود. يستخرج الذكاء المتطلبات، المواعيد، الشروط والمخاطر موثقة برقم الصفحة والفقرة." : "Upload tenders, RFPs, RFQs and contracts. AI extracts requirements, dates, terms and risks — every finding cited to page and clause.",
    },
    {
      n: "03",
      title: lang === "ar" ? "تأهيل" : "QUALIFY",
      body: lang === "ar" ? "قارن المتطلبات مع قدرات شركتك وشهاداتها وسجل خبراتها لمعرفة نقاط التطابق والنقص بدقة." : "Compare requirements with your capabilities, certifications and experience. See what is matched, missing, expired or unknown.",
    },
    {
      n: "04",
      title: lang === "ar" ? "قرار" : "DECIDE",
      body: lang === "ar" ? "اتخذ قرار المشاركة أو الاعتذار بناءً على بطاقة تقييم مدروسة مع إمكانية التعديل وتوثيق المبررات." : "Make a data-driven Go / No-Go decision on a scored card, with management override and a documented reason.",
    },
    {
      n: "05",
      title: lang === "ar" ? "إعداد" : "BUILD",
      body: lang === "ar" ? "أنشئ حزم العروض الفنية، المالية والتسعير مع الأقسام الهندسية والمشتريات في مساحة عمل واحدة." : "Create technical, commercial and pricing packages with engineering, procurement and costing in one workspace.",
    },
    {
      n: "06",
      title: lang === "ar" ? "تقديم" : "SUBMIT",
      body: lang === "ar" ? "مرر العطاء عبر مراجعات الفرق الفنية والتجارية والقانونية، واعتمد السعر النهائي وقفل العرض." : "Route through technical, commercial, legal and management review. Approve, lock the price and assemble the package.",
    },
    {
      n: "07",
      title: lang === "ar" ? "تعلم" : "LEARN",
      body: lang === "ar" ? "تتبع نتائج الفوز والخسارة والأسباب، ووظف الدروس المستفادة لتحسين المناقصات القادمة باستمرار." : "Track results, win/loss reasons and lessons learned, and feed them into the next opportunity.",
    },
  ];

  const modules = [
    {
      n: "01",
      title: lang === "ar" ? "إدارة العملاء والفرص CRM" : "CRM & Opportunities",
      body: lang === "ar" ? "سجل موحد للشركات، جهات الاتصال، وتتبع الفرص حتى الفوز بالصفقة وتغذية المناقصات." : "Companies, contacts, pipeline from Lead to Won, and inquiry intake — one client record that flows into every tender.",
    },
    {
      n: "02",
      title: lang === "ar" ? "ذكاء المستندات الاصطناعي" : "AI Document Intelligence",
      body: lang === "ar" ? "استخراج مهيكل للمتطلبات، المواعيد، التكاليف وشروط العقود مع التوثيق والمراجعة البشرية." : "Structured extraction of requirements, dates, values and contract terms with source references and human verification.",
    },
    {
      n: "03",
      title: lang === "ar" ? "فحص الامتثال والقدرات" : "Compliance & Capability Matching",
      body: lang === "ar" ? "مطابقة اشتراطات ومعايير الجهات المالكة (مثل أرامكو السعودية) مع شهادات وإمكانيات شركتك." : "Industry-configurable compliance templates checked against your organisation's capabilities and expiries.",
    },
    {
      n: "04",
      title: lang === "ar" ? "محرك قرار المشاركة Go / No-Go" : "Go / No-Go Engine",
      body: lang === "ar" ? "15 معياراً تقييمياً بنتيجة شفافة وتسجيل رسمي للاعتماد الإداري وحفظ أسباب القرار." : "Fifteen scored criteria, a transparent verdict and an auditable management override.",
    },
    {
      n: "05",
      title: lang === "ar" ? "الاستفسارات والمخاطر التعاقدية" : "Clarifications, Qualifications & Risk",
      body: lang === "ar" ? "سجل التحفظات، الاستيضاحات ومصفوفة مخاطر 5×5 لتقليل الخسائر وحماية هامش الربح." : "Clarification log, deviation register and a 5×5 risk matrix with pre- and post-mitigation scoring.",
    },
    {
      n: "06",
      title: lang === "ar" ? "الهندسة والمشتريات وحصر MTO" : "Engineering & Procurement",
      body: lang === "ar" ? "حصر كميات المواد MTO، طلبات عروض الأسعار RFQ، ومقارنة عروض الموردين وترسية البنود." : "Template-driven engineering workspaces and a universal RFQ → quotation → evaluation → award workflow.",
    },
    {
      n: "07",
      title: lang === "ar" ? "حساب التكاليف والتسعير" : "Costing & Pricing",
      body: lang === "ar" ? "تصنيفات تكاليف مرنة، حساب هوامش الأرباح، وتثبيت الأسعار المعتمدة مع إدارة الإصدارات." : "Configurable cost categories, margin and markup, locked approved prices and versioned changes.",
    },
    {
      n: "08",
      title: lang === "ar" ? "إعداد العروض والمراجعات" : "Proposals, Reviews & Submission",
      body: lang === "ar" ? "مسودات ذكية مدعومة بالذكاء، مراحل تدقيق محددة، ومؤشر جاهزية العطاء محسوب من بيانات حقيقية." : "AI first drafts, human editing, staged reviews, approvals and a submission-readiness score computed from real data.",
    },
    {
      n: "09",
      title: lang === "ar" ? "البيانات ونظام إدارة الموارد ERP" : "Intelligence & ERP",
      body: lang === "ar" ? "سجلات المنافسين، تحليلات الفوز والخسارة، الدروس المستفادة، وإدارة العقود والمشاريع." : "Competitor records with sources, win/loss analytics, lessons learned, contracts and projects.",
    },
  ];

  const landingIndustries = [
    ["🛢️", lang === "ar" ? "النفط والغاز" : "Oil & Gas", lang === "ar" ? "مشاريع أرامكو، عقود EPC/EPCI، تأهيل السلامة، المحتوى المحلي iktva." : "EPC/EPCI, HSE prequalification, vessel spreads, local content."],
    ["🌉", lang === "ar" ? "البنية التحتية" : "Infrastructure", lang === "ar" ? "الطرق والجسور والسكك: التراخيص، جداول الكميات BOQ، أساطيل المعدات." : "Roads, bridges, rail: licences, BOQ, equipment fleets, references."],
    ["🏗️", lang === "ar" ? "الإنشاءات والمقاولات" : "Construction", lang === "ar" ? "الأعمال المدنية، الهيكلية، والكهروميكانيكية MEP: خطط التنفيذ وإجراءات السلامة." : "Civil, structural, MEP: permits, method statements, safety."],
    ["🏭", lang === "ar" ? "التصنيع والتوريد" : "Manufacturing", lang === "ar" ? "معايير المنتجات، شهادات المصانع المعتمدة، واختبارات القبول المصنعي FAT." : "Product standards, factory certifications, FAT and capacity."],
    ["⚡", lang === "ar" ? "الطاقة والمرافق" : "Energy", lang === "ar" ? "توليد ونقل وتخزين الطاقة: كود الشبكة وعقود التشغيل والصيانة O&M." : "Generation, transmission, storage: grid codes and O&M."],
    ["💻", lang === "ar" ? "تقنية المعلومات" : "IT & Technology", lang === "ar" ? "الحوسبة السحابية، الأمن السيبراني: ISO 27001، استضافة البيانات، واتفاقيات SLA." : "Cloud, software, cybersecurity: ISO 27001, data residency, SLAs."],
    ["📡", lang === "ar" ? "الاتصالات" : "Telecom", lang === "ar" ? "الألياف الضوئية، الأبراج، البنية التحتية للشبكات: اعتماد الأنظمة وخطط النشر." : "Fibre, towers, core network: type approvals and rollout plans."],
    ["🏥", lang === "ar" ? "الرعاية الصحية" : "Healthcare", lang === "ar" ? "الموافقات التنظيمية، تسجيل الأجهزة والمستلزمات، ومعايير الجودة الطبية." : "Regulatory approvals, product registrations, quality standards."],
    ["🏛️", lang === "ar" ? "القطاع الحكومي" : "Government", lang === "ar" ? "المنافسات الحكومية، متطلبات التوطين، ونسب القيمة المضافة المحلية." : "Public procurement registration, disclosures, in-country value."],
    ["🚆", lang === "ar" ? "النقل واللوجستيات" : "Transportation", lang === "ar" ? "السكك الحديدية، إدارة الأساطيل، وأنظمة التحكم وإدارة المرور الذكية." : "Rail, fleet and traffic systems."],
    ["⛏️", lang === "ar" ? "التعدين والصناعة" : "Mining", lang === "ar" ? "رخص التعدين والاستكشاف، الموافقات البيئية، وعقود المقاولة التعدينية." : "Mining licences, environmental approvals, contract mining."],
    ["🏢", lang === "ar" ? "التطوير العقاري" : "Real Estate", lang === "ar" ? "التطوير العقاري، إدارة الأملاك والمرافق الشاملة." : "Development, property and facilities management."],
    ["💧", lang === "ar" ? "المياه والبيئة" : "Water & Utilities", lang === "ar" ? "محطات التحلية والمعالجة، شبكات التوزيع، وتشغيل المنشآت المائية." : "Treatment, networks, desalination, O&M."],
    ["💼", lang === "ar" ? "الخدمات المهنية" : "Professional Services", lang === "ar" ? "الاستشارات الهندسية والقانونية والمالية: خبرات الكوادر وسجل الإنجاز." : "Consulting, legal, audit: personnel and experience."],
    ["◻️", lang === "ar" ? "قطاعات متخصصة" : "Other Industries", lang === "ar" ? "قم بإنشاء وتخصيص قوالب قطاعك بسهولة تامة وبدون أي كتابة كود." : "Configure your own template — no code changes required."],
  ];

  const testimonials = [
    [
      lang === "ar" ? "توقفنا تماماً عن خسارة العطاءات بسبب البنود المنسية في دفاتر الشروط. كل نتيجة يكتشفها الذكاء تشير مباشرة إلى الصفحة والفقرة." : "We stopped losing bids to missed clauses. Every AI finding points at the page.",
      lang === "ar" ? "مدير إدارة المناقصات والعقود، شركة مقاولات بنية تحتية" : "Head of Tendering, infrastructure contractor"
    ],
    [
      lang === "ar" ? "قرار المشاركة Go / No-Go كان مجرد نقاش طويل غير مدعوم بالبيانات. الآن أصبح بطاقة تقييم دقيقة ببيانات محفوظة رسمياً." : "Go / No-Go used to be a meeting. Now it is a scorecard with a reason on file.",
      lang === "ar" ? "المدير التجاري، مقاول عام لمشاريع EPC" : "Commercial Director, EPC"
    ],
    [
      lang === "ar" ? "مساحة عمل واحدة متكاملة لكل مناقصة، من استلام كراسة الشروط حتى تسليم العطاء. انتهت فوضى ملفات الإكسل المبعثرة." : "One workspace per RFP, from CRM to submission. Our Excel sprawl is gone.",
      lang === "ar" ? "مدير إعداد العروض الفنية والمالية" : "Bid Manager, IT services"
    ],
  ];

  return (
    <>
      <Hero />

      <Section dark>
        <Eyebrow>{t("HOW IT WORKS")}</Eyebrow>
        <h2 className="mt-4 max-w-3xl font-display text-4xl md:text-5xl">{t("How It Works Title")}</h2>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((h, i) => <NumberedCard key={h.n} dark n={h.n} title={h.title} body={h.body} delay={(i % 4) + 1} />)}
        </div>
      </Section>

      <Section>
        <Eyebrow>{t("INDUSTRIES")}</Eyebrow>
        <h2 className="mt-4 max-w-3xl font-display text-4xl md:text-5xl">{t("Industries Title")}</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">{t("Industries Subtitle")}</p>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {landingIndustries.map(([icon, name, body], i) => (
            <Link key={name} href="/industries" data-delay={String((i % 5) + 1)} className="reveal card-lift group rounded-lg border border-line bg-white/60 p-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-xl">{icon}</span>
              <p className="mt-3 font-display text-lg group-hover:text-accent font-semibold">{name}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{body}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section dark>
        <Eyebrow>{t("THE PLATFORM")}</Eyebrow>
        <h2 className="mt-4 max-w-3xl font-display text-4xl md:text-5xl">{t("Platform Title")}</h2>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => <NumberedCard key={m.n} dark {...m} delay={(i % 3) + 1} />)}
        </div>
        <Link href="/platform" className="mt-10 inline-flex items-center gap-2 text-accent hover:underline font-medium">
          {t("Explore the full platform")} <ArrowRight size={16} className={cn(isRtl && "rotate-180")} />
        </Link>
      </Section>

      <Section>
        <div className="reveal grid gap-6 md:grid-cols-3">
          {testimonials.map(([q, who], i) => (
            <figure key={who} data-delay={String(i + 1)} className="reveal card-lift rounded-xl border border-line bg-white/50 p-6 dark-card">
              <Quote size={18} className="text-accent" />
              <blockquote className="mt-3 font-display text-xl leading-snug">{q}</blockquote>
              <figcaption className="mt-4 text-xs uppercase tracking-wider text-muted font-medium">{who}</figcaption>
            </figure>
          ))}
        </div>
        <div className="reveal mt-16 overflow-hidden rounded-2xl bg-navy p-10 text-cream md:p-14" style={{ backgroundImage: "radial-gradient(ellipse at 20% 0%, color-mix(in oklab, var(--bravo-accent) 55%, transparent), transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(91,147,196,.45), transparent 55%)" }}>
          <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="eyebrow text-cream/70">{t("START IN MINUTES")}</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">{t("Start In Minutes Title")}</h2>
              <p className="mt-4 max-w-xl text-cream/75">{t("Start In Minutes Subtitle")}</p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-white transition-transform hover:scale-[1.03] font-medium">
                {t("Start free, 3 days")} <ArrowRight size={16} className={cn(isRtl && "rotate-180")} />
              </Link>
              <Link href="/pricing" className="text-sm text-cream/80 hover:text-cream">
                {t("See pricing →")}
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div id="demo" className="reveal grid gap-12 md:grid-cols-2">
          <div>
            <Eyebrow>{t("REQUEST A DEMO")}</Eyebrow>
            <h2 className="mt-4 font-display text-4xl">{t("Demo Title")}</h2>
            <p className="mt-4 text-muted leading-relaxed">{t("Demo Subtitle")}</p>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              <li>• {t("Demo Bullet 1")}</li>
              <li>• {t("Demo Bullet 2")}</li>
              <li>• {t("Demo Bullet 3")}</li>
            </ul>
          </div>
          <DemoForm />
        </div>
      </Section>
    </>
  );
}
