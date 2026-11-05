"use client";
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { Languages } from "lucide-react";
import { cn } from "@/lib/cn";

export type Language = "en" | "ar";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, defaultEn?: string) => string;
  isRtl: boolean;
  dir: "rtl" | "ltr";
}

const STORAGE_KEY = "vendoriq.lang";
const SOW_STORAGE_KEY = "vendoriq.sow.lang";
const LANG_EVENT = "vendoriq:lang-changed";

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Topbar & Global
    "All Industries": "All Industries",
    "Notifications": "Notifications",
    "Mark all read": "Mark all read",
    "Search": "Search",
    "Filter": "Filter",
    "Save": "Save",
    "Saved": "Saved",
    "Saving…": "Saving…",
    "Error": "Error",
    "Local": "Local",
    "Sign out": "Sign out",
    "Settings": "Settings",
    "Loading…": "Loading…",
    "Workspace created with sample data": "Workspace created with sample data",
    "Retry": "Retry",
    "Create or find": "Create or find",
    "No tender": "No tender",
    "Workspace": "Workspace",
    "Chat": "Chat",
    "Conversations": "Conversations",
    "Ctrl K": "Ctrl K",
    "edits save automatically": "edits save automatically",

    // Navigation Groups
    "Dashboard": "Dashboard",
    "CRM": "CRM",
    "Tender Intelligence": "Tender Intelligence",
    "Active Workspace": "Active Workspace",
    "Governance": "Governance",
    "ERP": "ERP",
    "Intelligence": "Intelligence",
    "Administration": "Administration",

    // Navigation Items
    "Companies": "Companies",
    "Contacts": "Contacts",
    "Opportunities": "Opportunities",
    "Inquiries": "Inquiries",
    "Tender Workspaces": "Tender Workspaces",
    "Vendors & Partners": "Vendors & Partners",
    "Our Capabilities": "Our Capabilities",
    "Overview": "Overview",
    "Action Board": "Action Board",
    "Documents": "Documents",
    "AI Analysis": "AI Analysis",
    "Requirements": "Requirements",
    "Compliance": "Compliance",
    "Go / No-Go": "Go / No-Go",
    "Setup & Milestones": "Setup & Milestones",
    "Engineering": "Engineering",
    "Pricing": "Pricing",
    "Procurement": "Procurement",
    "Technical Proposal": "Technical Proposal",
    "Commercial Proposal": "Commercial Proposal",
    "Reviews": "Reviews",
    "Approvals": "Approvals",
    "Contracts": "Contracts",
    "Projects": "Projects",
    "Reports & Analytics": "Reports & Analytics",
    "Knowledge Base": "Knowledge Base",
    "Master Library": "Master Library",
    "Local Database": "Local Database",
    "Industry Templates": "Industry Templates",
    "Users & Roles": "Users & Roles",
    "Audit Trail": "Audit Trail",
    "AI Governance": "AI Governance",

    // Executive Dashboard
    "Executive Dashboard": "Executive Dashboard",
    "Active opportunities": "Active opportunities",
    "Active tenders": "Active tenders",
    "Closing ≤ 60 days": "Closing ≤ 60 days",
    "RFPs / RFQs": "RFPs / RFQs",
    "AI reviews pending": "AI reviews pending",
    "Go / Cond. / No-Go": "Go / Cond. / No-Go",
    "Bids in preparation": "Bids in preparation",
    "Submitted": "Submitted",
    "Won / Lost": "Won / Lost",
    "Pipeline value": "Pipeline value",
    "Weighted pipeline": "Weighted pipeline",
    "Expected margin": "Expected margin",
    "Pipeline growth": "Pipeline growth",
    "Revenue forecast": "Revenue forecast",
    "Pipeline by industry": "Pipeline by industry",
    "Pipeline by region": "Pipeline by region",
    "Pipeline by client": "Pipeline by client",
    "Opportunities by stage": "Opportunities by stage",
    "Tenders by type": "Tenders by type",
    "Win / loss": "Win / loss",
    "Tender deadlines": "Tender deadlines",
    "Tender health": "Tender health",
    "Industry performance": "Industry performance",
    "cumulative opportunity value by month created": "cumulative opportunity value by month created",
    "deadline calendar": "deadline calendar",
    "win rate": "win rate",
    "no results yet": "no results yet",
    "No active tenders in this view.": "No active tenders in this view.",

    // Tender Overview
    "Tender record": "Tender record",
    "Tender details": "Tender details",
    "Reference": "Reference",
    "Tender type": "Tender type",
    "Industry": "Industry",
    "Service": "Service",
    "Region": "Region",
    "Owner": "Owner",
    "Estimated value": "Estimated value",
    "Currency": "Currency",
    "Submission deadline": "Submission deadline",
    "Stage": "Stage",
    "Scope / description": "Scope / description",
    "Client": "Client",
    "Industry template": "Industry template",
    "Recent activity": "Recent activity",
    "Critical": "Critical",
    "Important": "Important",
    "Suggested": "Suggested",
    "days left": "days left",
    "due today": "due today",
    "overdue": "overdue",

    // Marketing & Landing Page
    "Platform": "Platform",
    "Industries": "Industries",
    "About": "About",
    "Login": "Login",
    "Get Started": "Get Started",
    "Request Demo": "Request Demo",
    "Explore Platform": "Explore Platform",
    "Explore the full platform": "Explore the full platform",
    "Hero Headline": "Win more bids with AI that shows its sources.",
    "Hero Subtitle": "Analyze tenders, RFPs and RFQs, qualify against your capabilities, decide Go / No-Go on a scorecard, build pricing and proposals, and submit from one workspace — for construction, infrastructure, manufacturing, IT, energy, healthcare, government and more.",
    "multi-industry": "multi-industry",
    "industry templates": "industry templates",
    "Go / No-Go criteria": "Go / No-Go criteria",
    "workspace tabs": "workspace tabs",
    "Source-cited AI": "Source-cited AI",
    "Configurable compliance": "Configurable compliance",
    "Scored Go / No-Go": "Scored Go / No-Go",
    "Locked, versioned pricing": "Locked, versioned pricing",
    "HOW IT WORKS": "HOW IT WORKS",
    "How It Works Title": "One lifecycle. From discovery to lessons learned.",
    "INDUSTRIES": "INDUSTRIES",
    "Industries Title": "Industry-agnostic at the core. Specialised through templates.",
    "Industries Subtitle": "Each industry template configures services, compliance requirements, document types, risk and cost categories, engineering sections and proposal structure. Adding a new industry never requires rewriting the platform.",
    "THE PLATFORM": "THE PLATFORM",
    "Platform Title": "CRM · Tender Intelligence · Compliance · Bid Production · ERP",
    "START IN MINUTES": "START IN MINUTES",
    "Start In Minutes Title": "Your next tender, analysed before lunch.",
    "Start In Minutes Subtitle": "Upload the RFP. Get cited requirements, a compliance check against your capabilities and a Go / No-Go scorecard — then build the bid in the same workspace.",
    "Start free, 3 days": "Start free, 3 days",
    "See pricing →": "See pricing →",
    "REQUEST A DEMO": "REQUEST A DEMO",
    "Demo Title": "See BidWinning on your own tender.",
    "Demo Subtitle": "Bring an RFP, RFQ or ITT from your industry. We'll walk you from upload to a cited requirement list, a compliance check and a scored Go / No-Go in one session.",
    "Demo Bullet 1": "Built for government contractors, construction companies, manufacturers, engineering and technology companies.",
    "Demo Bullet 2": "Multi-tenant, role-based, fully audited.",
    "Demo Bullet 3": "AI that shows its sources and waits for a human.",
    "Build a winning strategy.": "Build a winning strategy.",
    "All rights reserved.": "All rights reserved.",
    "Tender workspace · RFP": "Tender workspace · RFP",
    "Contract & commercial lead": "Contract & commercial lead",
    "3 drafts cited to GCC p.71–88 · awaiting human review": "3 drafts cited to GCC p.71–88 · awaiting human review",
    "78/100 · GO · override logged": "78/100 · GO · override logged",
    "tender health": "tender health",
    "AI drafts": "AI drafts",
    "Decision": "Decision",

    // Lifecycle
    "DISCOVER": "DISCOVER",
    "QUALIFY": "QUALIFY",
    "ANALYZE": "ANALYZE",
    "DECIDE": "DECIDE",
    "PLAN": "PLAN",
    "ENGINEER": "ENGINEER",
    "PROCURE": "PROCURE",
    "COST": "COST",
    "PRICE": "PRICE",
    "PROPOSE": "PROPOSE",
    "REVIEW": "REVIEW",
    "APPROVE": "APPROVE",
    "SUBMIT": "SUBMIT",
    "WIN": "WIN",
    "CONTRACT": "CONTRACT",
    "PROJECT": "PROJECT",
    "LEARN": "LEARN",

    // Documents & SOW
    "Scope & MTO Takeoff": "Scope & MTO Takeoff",
    "Files Repository": "Files Repository",
    "Upload New Document": "Upload New Document",
    "Search documents...": "Search documents...",
    "Filter by tag": "Filter by tag",
    "All Tags": "All Tags",
    "Total Files": "Total Files",
    "Indexed Pages": "Indexed Pages",
    "Storage Used": "Storage Used",
    "Pending OCR": "Pending OCR",
  },
  ar: {
    // Topbar & Global
    "All Industries": "جميع القطاعات",
    "Notifications": "الإشعارات",
    "Mark all read": "تحديد الكل كمقروء",
    "Search": "بحث",
    "Filter": "تصفية",
    "Save": "حفظ",
    "Saved": "تم الحفظ",
    "Saving…": "جاري الحفظ…",
    "Error": "خطأ في المزامنة",
    "Local": "محلي فقط",
    "Sign out": "تسجيل الخروج",
    "Settings": "الإعدادات",
    "Loading…": "جاري التحميل…",
    "Workspace created with sample data": "تم تجهيز مساحة العمل ببيانات نموذجية",
    "Retry": "إعادة المحاولة",
    "Create or find": "إنشاء أو بحث سريع",
    "No tender": "لا توجد مناقصة",
    "Workspace": "مساحة العمل",
    "Chat": "المحادثة والمساعد",
    "Conversations": "المحادثات",
    "Ctrl K": "Ctrl K",
    "edits save automatically": "يتم الحفظ التلقائي فوراً",

    // Navigation Groups
    "Dashboard": "لوحة المؤشرات",
    "CRM": "إدارة علاقات العملاء CRM",
    "Tender Intelligence": "ذكاء المناقصات",
    "Active Workspace": "مساحة العمل النشطة",
    "Governance": "الحوكمة والاعتماد",
    "ERP": "نظام إدارة الموارد ERP",
    "Intelligence": "البيانات والذكاء التحليلي",
    "Administration": "الإدارة والنظام",

    // Navigation Items
    "Companies": "الشركات والعملاء",
    "Contacts": "جهات الاتصال",
    "Opportunities": "الفرص التجارية",
    "Inquiries": "طلبات الاستفسار",
    "Tender Workspaces": "مساحات عمل المناقصات",
    "Vendors & Partners": "الموردون والشركاء",
    "Our Capabilities": "قدرات وسجلات الشركة",
    "Overview": "نظرة عامة على المناقصة",
    "Action Board": "لوحة المهام والإجراءات",
    "Documents": "المستندات",
    "AI Analysis": "تحليل الذكاء الاصطناعي",
    "Requirements": "المتطلبات والمواصفات",
    "Compliance": "الامتثال والمعايير الفنية",
    "Go / No-Go": "قرار المشاركة / الاعتذار",
    "Setup & Milestones": "الإعداد ومعالم المشروع",
    "Engineering": "الهندسة والمواصفات",
    "Pricing": "التسعير وهوامش الربح",
    "Procurement": "المشتريات وعروض الموردين",
    "Technical Proposal": "العرض الفني",
    "Commercial Proposal": "العرض التجاري والمالي",
    "Reviews": "المراجعات والتدقيق",
    "Approvals": "الموافقات الرسمية",
    "Contracts": "العقود والاتفاقيات",
    "Projects": "المشاريع قيد التنفيذ",
    "Reports & Analytics": "التقارير والتحليلات",
    "Knowledge Base": "قاعدة المعرفة",
    "Master Library": "المكتبة القياسية والمواصفات",
    "Local Database": "قاعدة البيانات المحلية",
    "Industry Templates": "قوالب القطاعات الصناعية",
    "Users & Roles": "المستخدمون والصلاحيات",
    "Audit Trail": "سجل العمليات والتدقيق",
    "AI Governance": "حوكمة الذكاء الاصطناعي",

    // Executive Dashboard
    "Executive Dashboard": "لوحة المؤشرات التنفيذية",
    "Active opportunities": "الفرص التجارية النشطة",
    "Active tenders": "المناقصات النشطة",
    "Closing ≤ 60 days": "الإغلاق خلال ≤ 60 يوماً",
    "RFPs / RFQs": "طلبات العروض / طلبات الأسعار",
    "AI reviews pending": "مراجعات الذكاء المعلقة",
    "Go / Cond. / No-Go": "مشاركة / مشروط / اعتذار",
    "Bids in preparation": "عطاءات قيد الإعداد",
    "Submitted": "تم التقديم",
    "Won / Lost": "فوز / خسارة",
    "Pipeline value": "إجمالي قيمة الفرص",
    "Weighted pipeline": "القيمة المرجحة للفرص",
    "Expected margin": "هامش الربح المتوقع",
    "Pipeline growth": "نمو الفرص التراكمي",
    "Revenue forecast": "توقعات الإيرادات المالية",
    "Pipeline by industry": "الفرص حسب القطاع",
    "Pipeline by region": "الفرص حسب المنطقة",
    "Pipeline by client": "الفرص حسب العميل",
    "Opportunities by stage": "الفرص حسب المرحلة",
    "Tenders by type": "المناقصات حسب النوع",
    "Win / loss": "معدل الفوز والخسارة",
    "Tender deadlines": "المواعيد النهائية للمناقصات",
    "Tender health": "سلامة وجاهزية المناقصات",
    "Industry performance": "أداء القطاعات والخدمات",
    "cumulative opportunity value by month created": "القيمة التراكمية للفرص حسب شهر الإنشاء",
    "deadline calendar": "تقويم المواعيد النهائية",
    "win rate": "نسبة الفوز",
    "no results yet": "لا توجد نتائج بعد",
    "No active tenders in this view.": "لا توجد مناقصات نشطة في هذا العرض.",

    // Tender Overview
    "Tender record": "سجل المناقصة",
    "Tender details": "تفاصيل وبيانات المناقصة",
    "Reference": "الرقم المرجعي للمناقصة",
    "Tender type": "نوع المناقصة",
    "Industry": "القطاع الصناعي",
    "Service": "مجال الخدمة",
    "Region": "المنطقة الجغرافية",
    "Owner": "المسؤول عن المناقصة",
    "Estimated value": "القيمة التقديرية",
    "Currency": "العملة",
    "Submission deadline": "الموعد النهائي للتقديم",
    "Stage": "المرحلة الحالية",
    "Scope / description": "نطاق العمل / الوصف التعاقدي",
    "Client": "العميل / الجهة المالكة",
    "Industry template": "قالب القطاع المعتمد",
    "Recent activity": "النشاط الأخير وسجل العمليات",
    "Critical": "حرج للغاية",
    "Important": "مهم جداً",
    "Suggested": "مقترح",
    "days left": "يوم متبقي",
    "due today": "يستحق اليوم",
    "overdue": "متأخر عن الموعد",

    // Marketing & Landing Page
    "Platform": "المنصة",
    "Industries": "القطاعات",
    "About": "عن المنصة",
    "Login": "تسجيل الدخول",
    "Get Started": "ابدأ الآن",
    "Request Demo": "طلب عرض تجريبي",
    "Explore Platform": "استكشف المنصة",
    "Explore the full platform": "استكشف كافة مزايا المنصة",
    "Hero Headline": "ضاعف فرص فوزك بالمناقصات مع ذكاء اصطناعي موثق بالمصادر.",
    "Hero Subtitle": "حلل المناقصات ودفاتر الشروط، طابق المتطلبات مع قدراتك، اتخذ قرار المشاركة عبر بطاقة تقييم دقيقة، جهز التسعير والعروض وقدم بثقة — لمشاريع أرامكو، البنية التحتية، الإنشاءات، التصنيع، الطاقة، والجهات الحكومية.",
    "multi-industry": "متعدد القطاعات الهندسية والصناعية",
    "industry templates": "قوالب قطاعية معتمدة",
    "Go / No-Go criteria": "معايير قرار المشاركة / الاعتذار",
    "workspace tabs": "وحدات متكاملة في مساحة العمل",
    "Source-cited AI": "ذكاء اصطناعي موثق برقم الصفحة والفقرة",
    "Configurable compliance": "امتثال فني قابل للتخصيص الكامل",
    "Scored Go / No-Go": "بطاقة تقييم مدروسة لقرار المشاركة",
    "Locked, versioned pricing": "تسعير محكم مع إدارة الإصدارات والاعتمادات",
    "HOW IT WORKS": "كيف تعمل المنصة",
    "How It Works Title": "دورة عمل متكاملة. من استكشاف الفرصة حتى تسليم المشروع.",
    "INDUSTRIES": "القطاعات المعتمدة",
    "Industries Title": "بنية منصة شاملة ومرنة. متخصصة عبر قوالب معايير قياسية.",
    "Industries Subtitle": "يحدد كل قالب قطاعي الخدمات، اشتراطات الامتثال، تصنيفات المخاطر والتكاليف، الأقسام الهندسية وهيكل العطاءات دون الحاجة لإعادة ضبط النظام.",
    "THE PLATFORM": "وحدات المنصة",
    "Platform Title": "إدارة العملاء · ذكاء المناقصات · الامتثال · إعداد العطاءات · إدارة الموارد ERP",
    "START IN MINUTES": "ابدأ خلال دقائق",
    "Start In Minutes Title": "مناقصتك القادمة، تم تحليلها وتدقيقها بالكامل قبل الغداء.",
    "Start In Minutes Subtitle": "ارفع كراسة الشروط (RFP). احصل على متطلبات مستخرجة بالصفحة، وفحص امتثال معتمد، وبطاقة تقييم جاهزة — وابدأ إعداد العطاء فوراً.",
    "Start free, 3 days": "ابدأ تجربتك المجانية لمدة 3 أيام",
    "See pricing →": "عرض تفاصيل الأسعار ←",
    "REQUEST A DEMO": "طلب عرض حي ومباشر",
    "Demo Title": "شاهد BidWinning يعمل على كراسة مناقصة حقيقية من مشاريعك.",
    "Demo Subtitle": "أحضر كراسة مواصفات أو وثيقة نطاق عمل (SOW). سنستعرض معك استخراج المتطلبات، وحصر الكميات MTO، ومطابقة الامتثال في جلسة واحدة مباشرة.",
    "Demo Bullet 1": "مصمم لمقاولي وموردي المشاريع الكبرى، شركات الهندسة، والتصنيع والتقنية.",
    "Demo Bullet 2": "نظام متعدد المستخدمين، أدوار وصلاحيات دقيقة، وتدقيق كامل لجميع الإجراءات.",
    "Demo Bullet 3": "ذكاء اصطناعي يبرز مصادره من مستندات العميل وينتظر مراجعة واعتماد المهندس المختص.",
    "Build a winning strategy.": "ابنِ استراتيجية عطاءات احترافية تضمن الفوز بالمشاريع.",
    "All rights reserved.": "جميع الحقوق محفوظة.",
    "Tender workspace · RFP": "مساحة عمل المناقصة · كراسة الشروط",
    "Contract & commercial lead": "مسؤول العقود والمخاطر التجارية",
    "3 drafts cited to GCC p.71–88 · awaiting human review": "3 مسودات موثقة بالشروط العامة ص 71–88 · بانتظار مراجعة المهندس",
    "78/100 · GO · override logged": "78/100 · قرار المشاركة GO · مسجل في النظام",
    "tender health": "مؤشر صحة المناقصة",
    "AI drafts": "مسودات الذكاء",
    "Decision": "القرار",

    // Lifecycle
    "DISCOVER": "استكشاف",
    "QUALIFY": "تأهيل",
    "ANALYZE": "تحليل",
    "DECIDE": "قرار",
    "PLAN": "تخطيط",
    "ENGINEER": "هندسة",
    "PROCURE": "مشتريات",
    "COST": "تكاليف",
    "PRICE": "تسعير",
    "PROPOSE": "عطاء",
    "REVIEW": "مراجعة",
    "APPROVE": "اعتماد",
    "SUBMIT": "تقديم",
    "WIN": "فوز",
    "CONTRACT": "عقد",
    "PROJECT": "مشروع",
    "LEARN": "دروس مستفادة",

    // Documents & SOW
    "Scope & MTO Takeoff": "نطاق العمل وحصر الكميات MTO",
    "Files Repository": "مستودع الملفات والمرفقات",
    "Upload New Document": "رفع وثيقة جديدة",
    "Search documents...": "البحث في المستندات...",
    "Filter by tag": "تصفية حسب التصنيف",
    "All Tags": "جميع التصنيفات",
    "Total Files": "إجمالي الملفات",
    "Indexed Pages": "الصفحات المفهرسة",
    "Storage Used": "المساحة المستخدمة",
    "Pending OCR": "بانتظار المعالجة OCR",
  },
};

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (k, d) => d || k,
  isRtl: false,
  dir: "ltr",
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = (localStorage.getItem(STORAGE_KEY) || localStorage.getItem(SOW_STORAGE_KEY)) as Language | null;
      if (stored === "ar" || stored === "en") {
        setLangState(stored);
        applyDomDirection(stored);
      }
    } catch {}
    setMounted(true);

    const onStorage = (e: StorageEvent) => {
      if ((e.key === STORAGE_KEY || e.key === SOW_STORAGE_KEY) && (e.newValue === "ar" || e.newValue === "en")) {
        setLangState(e.newValue as Language);
        applyDomDirection(e.newValue as Language);
      }
    };

    const onCustom = (e: Event) => {
      const custom = e as CustomEvent<Language>;
      if (custom.detail === "ar" || custom.detail === "en") {
        setLangState(custom.detail);
        applyDomDirection(custom.detail);
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(LANG_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LANG_EVENT, onCustom);
    };
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      localStorage.setItem(SOW_STORAGE_KEY, newLang);
      applyDomDirection(newLang);
      window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: newLang }));
    } catch {}
  }, []);

  const isRtl = lang === "ar";
  const dir: "rtl" | "ltr" = isRtl ? "rtl" : "ltr";

  const t = useCallback((key: string, defaultEn?: string) => {
    const dict = translations[lang] || translations.en;
    if (dict[key]) return dict[key];
    if (lang === "en" && defaultEn) return defaultEn;
    // fallback to English translation if key exists in en
    if (translations.en[key]) return translations.en[key];
    return defaultEn || key;
  }, [lang]);

  const value = useMemo(() => ({
    lang,
    setLang,
    t,
    isRtl,
    dir,
  }), [lang, setLang, t, isRtl, dir]);

  return (
    <I18nContext.Provider value={value}>
      <div dir={dir} className={cn("min-h-full", isRtl && "rtl-layout font-sans")}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

function applyDomDirection(lang: Language) {
  if (typeof document === "undefined") return;
  const isRtl = lang === "ar";
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
  if (isRtl) {
    document.documentElement.classList.add("is-rtl");
  } else {
    document.documentElement.classList.remove("is-rtl");
  }
}

export function useI18n() {
  return useContext(I18nContext);
}

export const useLanguage = useI18n;

export function LanguageToggle({ className, compact }: { className?: string; compact?: boolean }) {
  const { lang, setLang } = useI18n();

  return (
    <div className={cn("inline-flex items-center rounded border border-app-border bg-app-panel p-0.5 text-xs", className)}>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "flex items-center gap-1 rounded px-2 py-1 transition-all",
          lang === "en" ? "bg-app-panel-2 font-medium text-app-text shadow-sm" : "text-app-muted hover:text-app-text"
        )}
        title="Switch to English"
      >
        <span>EN</span>
      </button>
      <button
        type="button"
        onClick={() => setLang("ar")}
        className={cn(
          "flex items-center gap-1 rounded px-2 py-1 transition-all font-sans",
          lang === "ar" ? "bg-app-panel-2 font-semibold text-app-accent shadow-sm" : "text-app-muted hover:text-app-text"
        )}
        title="التبديل إلى العربية"
      >
        <span>العربية</span>
      </button>
    </div>
  );
}

export function MarketingLanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();

  return (
    <div className={cn("inline-flex items-center rounded-full border border-line bg-white/70 p-0.5 text-xs backdrop-blur dark-card", className)}>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "rounded-full px-2.5 py-1 text-xs transition-colors",
          lang === "en" ? "bg-accent text-white font-medium shadow-sm" : "text-muted hover:text-ink"
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ar")}
        className={cn(
          "rounded-full px-2.5 py-1 text-xs transition-colors font-sans",
          lang === "ar" ? "bg-accent text-white font-bold shadow-sm" : "text-muted hover:text-ink"
        )}
      >
        العربية
      </button>
    </div>
  );
}
