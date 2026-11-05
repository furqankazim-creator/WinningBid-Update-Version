"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Clock,
  HardHat,
  AlertTriangle,
  Flame,
  Droplets,
  ShieldAlert,
  Search,
  Download,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  Users,
  Check,
  ChevronRight,
  AlertCircle,
  UploadCloud,
  RotateCcw,
  Languages
} from "lucide-react";
import { Button, Card, Badge, Label, SectionTitle } from "@/components/ui";
import { useScopedStore, useStore, fmtMoney } from "@/store/useStore";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { SOWTakeoffReal } from "./SOWTakeoffReal";

// SOW Takeoff Preliminary Register Item with Bilingual Support
export interface MTOItem {
  id: string;
  code: string;
  description: string;
  descriptionAr: string;
  category: "Water Meters" | "Enclosures" | "Valves & Spools" | "Fittings & Assemblies" | "Safety & Temporary Power";
  categoryAr: string;
  qty: number;
  unit: string;
  unitAr: string;
  sourceDoc: string;
  page: number;
  clause: string;
  estUnitRateSAR: number;
  status: "Verified Core BOM" | "Junk / Unverified Requisition";
  statusAr: string;
  notes: string;
  notesAr: string;
}

// SOW Labor & Crew Breakdown with Bilingual Support
export interface CrewDiscipline {
  id: string;
  role: string;
  roleAr: string;
  certification: string;
  certificationAr: string;
  crews: number;
  headcount: number;
  hours: number;
  shiftDetail: string;
  shiftDetailAr: string;
  rateSAR: number;
  equipmentAllocation: string;
  equipmentAllocationAr: string;
  mandatedRequirement: string;
  mandatedRequirementAr: string;
}

// Specialty High Cost Flag with Bilingual Support
export interface SpecialtyRiskFlag {
  id: string;
  title: string;
  titleAr: string;
  category: "Dewatering" | "Fire Pump Rooms" | "Sanitary Lift Stations";
  categoryAr: string;
  severity: "High" | "Critical";
  profitMarginLossRisk: string;
  profitMarginLossRiskAr: string;
  applicableStandards: string[];
  scopeTrigger: string;
  scopeTriggerAr: string;
  unpricedCostDrivers: string[];
  unpricedCostDriversAr: string[];
  mitigationRecommendation: string;
  mitigationRecommendationAr: string;
  provisionalSumSAR: number;
}

// Default Extracted Data from Saudi Aramco 98-Page Scope of Work File (GSC 8142331)
const DEFAULT_MTO_ITEMS: MTOItem[] = [
  {
    id: "mto-1",
    code: "MTO-WM-01",
    description: "3/4\" Smart Water Meter (Ultrasonic / Magnetic flow, AMI/AMR dual RF telemetry, tamper seal, 10-year internal lithium battery)",
    descriptionAr: "عداد مياه ذكي مقاس 3/4 بوصة (قياس بالموجات فوق الصوتية/الحث الكهرومغناطيسي، إرسال لاسلكي مزدوج AMI/AMR، ختم حماية، بطارية ليثيوم 10 سنوات)",
    category: "Water Meters",
    categoryAr: "عدادات المياه",
    qty: 3230,
    unit: "EA",
    unitAr: "حبة",
    sourceDoc: "SCOPE OF WORK Water meter.pdf",
    page: 5,
    clause: "Part II §1.0",
    estUnitRateSAR: 620,
    status: "Verified Core BOM",
    statusAr: "جدول المواد المعتمد",
    notes: "Residential installation for Main Camp & Dhahran Hills cluster homes.",
    notesAr: "تركيب سكني للمخيم الرئيسي ومنازل تلال الظهران."
  },
  {
    id: "mto-2",
    code: "MTO-WM-02",
    description: "1\" Smart Water Meter (AMI/AMR telemetry with pulsed output, IP68 submerged rating)",
    descriptionAr: "عداد مياه ذكي مقاس 1 بوصة (اتصال عن بُعد AMI/AMR مع مخرج نبضات، تصنيف مقاومة الغمر IP68)",
    category: "Water Meters",
    categoryAr: "عدادات المياه",
    qty: 60,
    unit: "EA",
    unitAr: "حبة",
    sourceDoc: "SCOPE OF WORK Water meter.pdf",
    page: 5,
    clause: "Part II §1.0",
    estUnitRateSAR: 840,
    status: "Verified Core BOM",
    statusAr: "جدول المواد المعتمد",
    notes: "Commercial / high-consumption residential villas.",
    notesAr: "فلل سكنية عالية الاستهلاك ومرافق تجارية."
  },
  {
    id: "mto-3",
    code: "MTO-WM-03",
    description: "1-1/2\" Smart Water Meter (AMI/AMR telemetry with pulsed output, IP68 rated)",
    descriptionAr: "عداد مياه ذكي مقاس 1-1/2 بوصة (اتصال عن بُعد AMI/AMR مع مخرج نبضات، تصنيف IP68)",
    category: "Water Meters",
    categoryAr: "عدادات المياه",
    qty: 96,
    unit: "EA",
    unitAr: "حبة",
    sourceDoc: "SCOPE OF WORK Water meter.pdf",
    page: 5,
    clause: "Part II §1.0",
    estUnitRateSAR: 1250,
    status: "Verified Core BOM",
    statusAr: "جدول المواد المعتمد",
    notes: "Main Community recreation and administration residential facilities.",
    notesAr: "المرافق الترفيهية والإدارية في مجتمع الظهران."
  },
  {
    id: "mto-4",
    code: "MTO-WM-04",
    description: "Rabiya Camp Smart Water Meter Kit (3/4\" with wall enclosure & straight-run spool)",
    descriptionAr: "مجموعة عداد مياه ذكي لمخيم الربية (مقاس 3/4 بوصة مع صندوق جداري وقطعة استقامة)",
    category: "Water Meters",
    categoryAr: "عدادات المياه",
    qty: 372,
    unit: "EA",
    unitAr: "حبة",
    sourceDoc: "SCOPE OF WORK Water meter.pdf",
    page: 5,
    clause: "Part II §1.0",
    estUnitRateSAR: 750,
    status: "Verified Core BOM",
    statusAr: "جدول المواد المعتمد",
    notes: "Rabiya Camp housing unit deployments.",
    notesAr: "مخصصة لوحدات مخيم الربية السكني."
  },
  {
    id: "mto-5",
    code: "MTO-NET-01",
    description: "2\" to 14\" District Network Bulk Water Meters (Flanged ultrasonic district network meters: 15×2\", 1×3\", 10×4\", 5×6\", 3×8\", 1×14\")",
    descriptionAr: "عدادات التدفق الرئيسية لشبكة المنطقة من 2 إلى 14 بوصة (شفة فلانجة، قياس بالموجات: 15×2\"، 1×3\"، 10×4\"، 5×6\"، 3×8\"، 1×14\")",
    category: "Water Meters",
    categoryAr: "عدادات المياه",
    qty: 38,
    unit: "EA",
    unitAr: "حبة",
    sourceDoc: "SCOPE OF WORK Water meter.pdf",
    page: 5,
    clause: "Part II §1.0 Table",
    estUnitRateSAR: 14500,
    status: "Verified Core BOM",
    statusAr: "جدول المواد المعتمد",
    notes: "District network metering for water consumption and mainline leak detection.",
    notesAr: "لقياس استهلاك شبكة المنطقة ومراقبة وكشف تسربات الخطوط الرئيسية."
  },
  {
    id: "mto-6",
    code: "MTO-BOX-01",
    description: "Wall-Mounted Weatherproof Lockable Meter Enclosure (Heavy-duty fiberglass/metal enclosure with inspection viewport, UV resistant)",
    descriptionAr: "صندوق عداد جداري مقاوم للعوامل الجوية وقابل للقفل (فيبرجلاس/معدني شديد التحمل مع نافذة فحص، مقاوم للأشعة فوق البنفسجية)",
    category: "Enclosures",
    categoryAr: "الصناديق والحاويات",
    qty: 3758,
    unit: "EA",
    unitAr: "حبة",
    sourceDoc: "SCOPE OF WORK Water meter.pdf",
    page: 7,
    clause: "Part II §2.1",
    estUnitRateSAR: 185,
    status: "Verified Core BOM",
    statusAr: "جدول المواد المعتمد",
    notes: "Mounted on exterior walls of residential buildings per Aramco building standard.",
    notesAr: "يثبت على الجدران الخارجية للمنازل السكنية وفق معايير أرامكو."
  },
  {
    id: "mto-7",
    code: "MTO-VALV-01",
    description: "3/4\" to 1-1/2\" Full-Port Brass Isolation Ball Valves (PN16, lock-shield design for upstream/downstream meter isolation)",
    category: "Valves & Spools",
    categoryAr: "المحابس وقطع الوصل",
    descriptionAr: "محابس عزل كروية نحاسية كاملة التدفق مقاس 3/4 إلى 1-1/2 بوصة (تصنيف PN16، تصميم قابل للقفل لعزل مدخل ومخرج العداد)",
    qty: 7516,
    unit: "EA",
    unitAr: "حبة",
    sourceDoc: "SCOPE OF WORK Water meter.pdf",
    page: 6,
    clause: "General Note",
    estUnitRateSAR: 95,
    status: "Verified Core BOM",
    statusAr: "جدول المواد المعتمد",
    notes: "2 isolation valves per residential meter installation to allow future replacement without main shutdown.",
    notesAr: "محبسان لكل عداد سكني للسماح بالاستبدال مستقبلاً دون إيقاف الشبكة الرئيسية."
  },
  {
    id: "mto-8",
    code: "MTO-SPOOL-01",
    description: "Straight-Run Upstream/Downstream Spool Assemblies (5D upstream / 3D downstream laminar flow pipe segments per meter specs)",
    descriptionAr: "وصلات أنابيب استقامة للتدفق (5 أضعاف القطر قبل العداد / 3 أضعاف بعد العداد لضمان تدفق انسيابي ودقة القياس)",
    category: "Valves & Spools",
    categoryAr: "المحابس وقطع الوصل",
    qty: 3758,
    unit: "Sets",
    unitAr: "مجموعة",
    sourceDoc: "SCOPE OF WORK Water meter.pdf",
    page: 7,
    clause: "General Note §1.0",
    estUnitRateSAR: 140,
    status: "Verified Core BOM",
    statusAr: "جدول المواد المعتمد",
    notes: "Mandated straight-run distance per General Note to guarantee metering accuracy.",
    notesAr: "مسافات استقامة إلزامية حسب الملاحظات العامة لضمان دقة القراءات."
  },
  {
    id: "mto-9",
    code: "MTO-SAF-01",
    description: "Temporary GFCI Power Distribution Panels (Heavy-duty 120V 15/20A GFCI protected portable panels for construction tools)",
    descriptionAr: "لوحات توزيع طاقة كهربائية مؤقتة مزودة بقواطع حماية أرضية GFCI (شديدة التحمل 120 فولت 15/20 أمبير لمعدات الموقع)",
    category: "Safety & Temporary Power",
    categoryAr: "السلامة والتغذية المؤقتة",
    qty: 18,
    unit: "Sets",
    unitAr: "مجموعة",
    sourceDoc: "SCOPE OF WORK Water meter.pdf",
    page: 10,
    clause: "§3.3.10",
    estUnitRateSAR: 1200,
    status: "Verified Core BOM",
    statusAr: "جدول المواد المعتمد",
    notes: "Mandated under Aramco Construction Safety Manual §3.3.10.",
    notesAr: "إلزامية بموجب دليل السلامة الإنشائية لأرامكو السعودية §3.3.10."
  },
  {
    id: "mto-10",
    code: "MTO-JNK-01",
    description: "⚠️ Discretionary Scope Variation Addition / Deletion Requisition (Unpriced Table 1.2 Rates)",
    descriptionAr: "⚠️ طلب تعديل نطاق تقديري إضافة/حذف غير مسعر (أسعار جدول 1.2 المفقودة)",
    category: "Fittings & Assemblies",
    categoryAr: "ملحقات ومجموعات التركيب",
    qty: 1,
    unit: "Lot",
    unitAr: "مقطوعية",
    sourceDoc: "SCOPE OF WORK Water meter.pdf",
    page: 7,
    clause: "Part II §1.2",
    estUnitRateSAR: 0,
    status: "Junk / Unverified Requisition",
    statusAr: "طلبات غير مسعرة / فروقات النطاق",
    notes: "CRITICAL ALERT: SOW §1.2 references additions/deletions at 'rates set forth in table 1.2' with 30 days notice, but Table 1.2 was omitted from the ITT package. Must be qualified in the commercial bid.",
    notesAr: "تنبيه حرج: يشير البند §1.2 إلى إضافة/حذف أعمال بأسعار 'الجدول 1.2' بإشعار 30 يوماً، لكن الجدول مفقود من كراسة العطاء. يجب التحفظ عليه تجارياً."
  },
  {
    id: "mto-11",
    code: "MTO-JNK-02",
    description: "⚠️ Unmetered Residential Gap Allowance (5,428 Camp Residences vs 3,758 Contract Meters)",
    descriptionAr: "⚠️ فارق الوحدات السكنية غير المحتسبة (5,428 مسكناً بالمخيم مقابل 3,758 عداداً بالعقد)",
    category: "Water Meters",
    categoryAr: "عدادات المياه",
    qty: 1670,
    unit: "EA",
    unitAr: "حبة",
    sourceDoc: "SCOPE OF WORK Water meter.pdf",
    page: 5,
    clause: "Part II §1.0",
    estUnitRateSAR: 0,
    status: "Junk / Unverified Requisition",
    statusAr: "طلبات غير مسعرة / فروقات النطاق",
    notes: "DISCREPANCY ALERT: Total camp residences count is 5,428, but SOW scope explicitly specifies only 3,758 meters. Exclude 1,670 unmetered residences from lump sum base price to avoid unpaid scope creep.",
    notesAr: "تنبيه فارق كميات: إجمالي منازل المخيم 5,428 منزلاً، بينما حدد النطاق 3,758 عداداً فقط. يجب استبعاد الفارق (1,670 منزلاً) من السعر المقطوع لتفادي أعمال غير مدفوعة."
  }
];

const DEFAULT_LABOR_SCHEDULE: CrewDiscipline[] = [
  {
    id: "lab-1",
    role: "Certified Pipe Fitters (Aramco Approved)",
    roleAr: "فنيو تمديد أنابيب معتمدون (بطاقة اعتماد أرامكو)",
    certification: "Saudi Aramco Pipe Fitter Card & Fitting Procedure Approval",
    certificationAr: "بطاقة فني أنابيب أرامكو السعودية واعتماد إجراءات التركيب",
    crews: 4,
    headcount: 8,
    hours: 3400,
    shiftDetail: "7 Days / Week · 07:00–16:00 (Per §4.1)",
    shiftDetailAr: "7 أيام / أسبوع · 07:00–16:00 (حسب البند §4.1)",
    rateSAR: 65,
    equipmentAllocation: "Pipe threaders, alignment clamps, grooving tools, torque wrenches",
    equipmentAllocationAr: "ماكينات قلوظة، مشابك محاذاة، أدوات تحزيز، مفاتيح عزم دوران",
    mandatedRequirement: "General Note p.6: 'CONTRACTOR shall ensure that only certified pipe fitters... are utilized.'",
    mandatedRequirementAr: "الملاحظات العامة ص 6: 'يجب على المقاول التأكد من استخدام فنيي أنابيب معتمدين فقط.'"
  },
  {
    id: "lab-2",
    role: "Certified Welders (3rd-Party & Aramco)",
    roleAr: "لحامون معتمدون (طرف ثالث وأرامكو)",
    certification: "3rd-Party Certified Welders (WPS/PQR Approved per AWS/ASME)",
    certificationAr: "لحامون معتمدون من جهة فحص مستقلة (إجراءات WPS/PQR معتمدة وفق AWS/ASME)",
    crews: 2,
    headcount: 4,
    hours: 1200,
    shiftDetail: "7 Days / Week · 07:00–16:00",
    shiftDetailAr: "7 أيام / أسبوع · 07:00–16:00",
    rateSAR: 75,
    equipmentAllocation: "Mobile diesel welding rigs, purging gas, hot-work fire blankets",
    equipmentAllocationAr: "ماكينات لحام ديزل متنقلة، غاز تطهير، بطانيات حريق للأعمال الساخنة",
    mandatedRequirement: "General Note p.6: 'Certified welders... following welding procedures.'",
    mandatedRequirementAr: "الملاحظات العامة ص 6: 'لحامون معتمدون يتبعون إجراءات اللحام المعتمدة.'"
  },
  {
    id: "lab-3",
    role: "Work Permit Receivers (Dedicated per Site)",
    roleAr: "مستلمو تصاريح العمل (حضور فعلي بالموقع)",
    certification: "Saudi Aramco Form 924 Receiver Card (GI 2.100 & GI 6.012)",
    certificationAr: "بطاقة مستلم تصاريح معتمد نموذج 924 (GI 2.100 & GI 6.012)",
    crews: 3,
    headcount: 3,
    hours: 1800,
    shiftDetail: "Physical presence mandatory on site during all working shifts",
    shiftDetailAr: "الحضور الفعلي إلزامي بالموقع طوال فترات العمل اليومية",
    rateSAR: 85,
    equipmentAllocation: "Multi-gas detectors, lockout/tagout station, permit board",
    equipmentAllocationAr: "أجهزة كشف غازات متعددة، محطة قفل وعزل LOTO، لوحة تصاريح",
    mandatedRequirement: "§3.3.5 / §6.2: 'Work permit obtained each shift; receiver physically present on site.'",
    mandatedRequirementAr: "البند §3.3.5 / §6.2: 'استخراج تصريح عمل لكل وردية؛ حضور مستلم التصريح إلزامياً.'"
  },
  {
    id: "lab-4",
    role: "HSE Officers & Safety Manager (OSHA 30)",
    roleAr: "مسؤولو ومدير السلامة والصحة المهنية (OSHA 30)",
    certification: "OSHA 30-Hour Construction + Aramco Loss Prevention Card",
    certificationAr: "شهادة أوشا 30 ساعة للإنشاءات + بطاقة إدارة منع الخسائر بأرامكو",
    crews: 2,
    headcount: 3,
    hours: 1600,
    shiftDetail: "Full-time site safety inspections & hazard identification",
    shiftDetailAr: "تفتيش مستمر على السلامة وتحديد المخاطر الميدانية طوال الوقت",
    rateSAR: 95,
    equipmentAllocation: "First-aid medical vehicle (Saudi Labor Law Art. 134-135), fire extinguishers (SAES-B-7)",
    equipmentAllocationAr: "مركبة إسعاف أولي (نظام العمل م 134-135)، طفايات حريق (SAES-B-7)",
    mandatedRequirement: "§3.3.1 p.9 + Client review instruction: 'All safety staff shall be OSHA certified.'",
    mandatedRequirementAr: "البند §3.3.1 وتوجيهات العميل: 'جميع موظفي السلامة يجب أن يكونوا حاصلين على اعتماد OSHA.'"
  },
  {
    id: "lab-5",
    role: "Site Mechanical Engineers & QA/QC Supervisors",
    roleAr: "مهندسو ميكانيكا ومراقبو جودة وتوكيد QA/QC",
    certification: "Aramco Approved QC Inspector Card (Plumbing/Mechanical)",
    certificationAr: "بطاقة مفتش جودة معتمد من أرامكو (أعمال صحية وميكانيكية)",
    crews: 2,
    headcount: 2,
    hours: 1400,
    shiftDetail: "Dimensional verification, as-built surveys, English record books",
    shiftDetailAr: "التحقق من الأبعاد ومطابقة المخططات المنفذة وسجلات المشروع بالإنجليزية",
    rateSAR: 120,
    equipmentAllocation: "Laser survey equipment, pressure data loggers, inspection tablets",
    equipmentAllocationAr: "أجهزة مسح ليزري، مسجلات بيانات الضغط، أجهزة لوحية للمطابقة",
    mandatedRequirement: "General Note p.6–7: 'Prepare as-built drawings and project record books in English.'",
    mandatedRequirementAr: "الملاحظات العامة ص 6-7: 'إعداد المخططات المنفذة وسجلات المشروع باللغة الإنجليزية.'"
  },
  {
    id: "lab-6",
    role: "Commissioning & AMR/AMI Telemetry Specialists",
    roleAr: "أخصائيو تشغيل وربط شبكات العدادات الذكية AMR/AMI",
    certification: "Smart Meter Manufacturer Authorized Commissioning Engineer",
    certificationAr: "مهندس تشغيل معتمد من الشركة المصنعة للعدادات الذكية",
    crews: 1,
    headcount: 2,
    hours: 800,
    shiftDetail: "RF network signal verification, pairing with Dhahran Community head-end",
    shiftDetailAr: "التحقق من إشارة التردد اللاسلكي والاقتران بالنظام المركزي لمجتمع الظهران",
    rateSAR: 130,
    equipmentAllocation: "Handheld RF interrogators, calibration pulse testers, LoRaWAN sniffer",
    equipmentAllocationAr: "أجهزة قراءة لاسلكية محمولة، أجهزة معايرة نبضية، ماسح إشارات LoRaWAN",
    mandatedRequirement: "General Note p.6: 'Provide commissioning and start-up assistance.'",
    mandatedRequirementAr: "الملاحظات العامة ص 6: 'تقديم الدعم الكامل لأعمال بدء التشغيل والتدشين.'"
  }
];

const DEFAULT_SPECIALTY_FLAGS: SpecialtyRiskFlag[] = [
  {
    id: "risk-dewatering",
    title: "Ground Dewatering & Subsurface Water-Table Exposure",
    titleAr: "نزح المياه الجوفية وأعمال الحفريات المشبعة بالمياه (SAES-A-114)",
    category: "Dewatering",
    categoryAr: "نزح المياه",
    severity: "High",
    profitMarginLossRisk: "3.5% – 6.0% Profit Loss if Unpriced",
    profitMarginLossRiskAr: "خسارة 3.5% إلى 6.0% من هامش الربح في حال عدم التسعير",
    applicableStandards: [
      "SAES-A-114 (Excavation and Backfill)",
      "Saudi Aramco Construction Safety Manual §II",
      "Saudi Aramco GI 150.001 (Environmental Protection)"
    ],
    scopeTrigger: "Deep excavation pits for 38 District Network Bulk Meters (2\" to 14\") and submerged residential service valves in Dhahran Hills water table.",
    scopeTriggerAr: "حفريات عميقة لغرف 38 عداداً رئيسياً (2 إلى 14 بوصة) ومحابس الخدمة المغمورة في منسوب المياه السطحية بتلال الظهران.",
    unpricedCostDrivers: [
      "Submersible continuous slurry dewatering pumps (24/7 run)",
      "Wellpoint header systems and fuel generators in residential areas",
      "Environmental wastewater sedimentation & neutralization tanks",
      "Permits from Aramco Environmental Protection Department"
    ],
    unpricedCostDriversAr: [
      "مضخات نزح مياه غاطسة للخدمة الشاقة تعمل على مدار 24 ساعة",
      "شبكات نزح بنظام الإبر الرأسية ومولدات كهرباء بمناطق سكنية",
      "خزانات ترسيب ومعالجة بيئية لمياه الصرف المسحوبة",
      "تصاريح من إدارة حماية البيئة بأرامكو السعودية"
    ],
    mitigationRecommendation: "Include a mandatory Provisional Sum of SAR 180,000 in Commercial Proposal; submit Clarification C-14 to obtain Aramco borehole hydrology data.",
    mitigationRecommendationAr: "تضمين مبلغ احتياطي إلزامي قدره 180,000 ر.س في العرض التجاري؛ وتقديم الاستفسار C-14 لطلب بيانات تقارير المياه الجوفية والتربة.",
    provisionalSumSAR: 180000
  },
  {
    id: "risk-firepump",
    title: "Fire Pump Rooms & Life Safety System Interconnections",
    titleAr: "غرف مضخات الحريق والربط بالأنظمة الحيوية لحماية الأرواح (SAES-B-014)",
    category: "Fire Pump Rooms",
    categoryAr: "غرف مضخات الحريق",
    severity: "Critical",
    profitMarginLossRisk: "4.0% – 8.0% Profit Loss if Rejected",
    profitMarginLossRiskAr: "خسارة 4.0% إلى 8.0% من هامش الربح في حال رفض الاعتماد",
    applicableStandards: [
      "SAES-B-014 (Safety Requirements for Support Buildings)",
      "SAES-B-017 (Fire Water System Design)",
      "SAES-M-100 (Saudi Aramco Building Code)",
      "NFPA 20 / NFPA 24"
    ],
    scopeTrigger: "District main water loop interfaces directly with dedicated Community Fire Pump Houses and residential hydrants (§7.2 p.12).",
    scopeTriggerAr: "تداخل خطوط التغذية الرئيسية مع شبكة غرف مضخات الحريق لمجتمع الظهران وحنفيات الحريق السكنية (§7.2 ص 12).",
    unpricedCostDrivers: [
      "Strict ban on operating Aramco valves without direct Fire Protection supervisor (§3.3.11)",
      "Mandatory UL/FM-listed backflow preventers and pressure-tested flanged spool pieces",
      "Hydrostatic testing witness inspections by Aramco Loss Prevention",
      "Non-excusable liquidated delays for fire line shut-off overruns"
    ],
    unpricedCostDriversAr: [
      "حظر صارم لتشغيل محابس أرامكو دون إشراف مباشر من ممثل الإطفاء (§3.3.11)",
      "إلزامية استخدام صمامات منع التدفق العكسي معتمدة UL/FM وقطع وصل فلانجة مختبرة الضغط",
      "حضور مفتشي إدارة منع الخسائر لمعاينة اختبارات الضغط الهيدروستاتيكي",
      "غرامات تأخير غير مبررة في حال تجاوز مدة إغلاق خطوط مياه الحريق"
    ],
    mitigationRecommendation: "Formally exclude direct internal modification of Fire Pump Rooms from the lump sum base price; state that Fire Water isolations remain Company-performed.",
    mitigationRecommendationAr: "استبعاد أي تعديلات داخلية على غرف مضخات الحريق من السعر المقطوع صراحة؛ وتحديد أن عزل خطوط مياه الإطفاء يقع على مسؤولية أرامكو.",
    provisionalSumSAR: 220000
  },
  {
    id: "risk-liftstation",
    title: "Sanitary Lift Stations & Wastewater Disposal Containment",
    titleAr: "محطات الرفع الصحي واحتواء تصريف مياه الصرف (SAES-S-010)",
    category: "Sanitary Lift Stations",
    categoryAr: "محطات الرفع الصحي",
    severity: "High",
    profitMarginLossRisk: "2.5% – 5.0% Profit Loss from Penalties",
    profitMarginLossRiskAr: "خسارة 2.5% إلى 5.0% من هامش الربح جراء الغرامات البيئية",
    applicableStandards: [
      "SAES-S-010 (Sanitary Sewers)",
      "SAES-S-060 (Saudi Aramco Plumbing Code)",
      "Saudi Aramco SOW §3.3.16 (Disposal of Debris)"
    ],
    scopeTrigger: "Meter installation piping cuts adjacent to residential greywater drainage lines and community sanitary lift stations.",
    scopeTriggerAr: "أعمال قطع الأنابيب بجوار خطوط الصرف الصحي للمنازل ومحطات الرفع بمجتمع الظهران (§3.3.16).",
    unpricedCostDrivers: [
      "Strict prohibition of cross-connections between potable water and sanitary sewers",
      "Vacuum suction containment tankers for pipe flushing and debris evacuation",
      "Disposal to Aramco-designated authorized waste treatment facility only",
      "Daily inspection checklists required before permit closeout"
    ],
    unpricedCostDriversAr: [
      "حظر تام لأي ربط تبادلي بين مياه الشرب وخطوط الصرف الصحي",
      "صهاريج شفط تفريغية لاحتواء نواتج غسيل الأنابيب ومخلفات القطع",
      "التفريغ بمواقع المعالجة المعتمدة والمخصصة من أرامكو حصراً",
      "قوائم فحص يومية إلزامية قبل إغلاق تصاريح العمل"
    ],
    mitigationRecommendation: "Partner with an approved Aramco environmental waste transport vendor; add SAR 95,000 waste containment buffer to preliminary pricing.",
    mitigationRecommendationAr: "التعاقد مع مقاول نقل نفايات بيئية معتمد لدى أرامكو؛ وإضافة مخصص طوارئ قدره 95,000 ر.س لاحتواء الصرف بالتسعير المبدئي.",
    provisionalSumSAR: 95000
  }
];

export function SOWTakeoffWorkbench({
  onUploadRequest,
  defaultLang = "en"
}: {
  onUploadRequest?: () => void;
  defaultLang?: "en" | "ar";
}) {
  const { addCostLine, updateCostLine, activeTenderId, docs, tenders } = useScopedStore();
  const s = useStore();
  const activeTender = tenders.find((t) => t.id === activeTenderId);

  // Language state synchronized with global useI18n
  const { lang, setLang } = useI18n();
  const isAr = lang === "ar";

  const handleLanguageChange = (newLang: "en" | "ar") => {
    setLang(newLang);
  };

  // Check if an SOW document is already present in this workspace
  const sowDoc = docs.find(
    (d) =>
      d.name.toLowerCase().includes("sow") ||
      d.name.toLowerCase().includes("scope") ||
      d.kind === "Scope of Work"
  );

  const isSeedT5 = activeTenderId === "t5";
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Determine if takeoff data should be displayed
  const isIngested = isSeedT5 || Boolean(sowDoc) || demoLoaded || showSample;
  // The screens below this point are the built-in Aramco SAMPLE. The user's own documents use SOWTakeoffReal.
  const hasRealDocs = docs.some((d) => d.status === "INDEXED" && d.text);
  const sampleMode = showSample || demoLoaded || isSeedT5;

  const [activeTab, setActiveTab] = useState<"summary" | "mto" | "labor" | "specialty">("summary");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [pushedToPricing, setPushedToPricing] = useState(false);

  // Filtered MTO Items
  const filteredMTO = DEFAULT_MTO_ITEMS.filter((item) => {
    const textToSearch = isAr
      ? `${item.code} ${item.descriptionAr} ${item.notesAr}`
      : `${item.code} ${item.description} ${item.notes}`;
    const matchesSearch = textToSearch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate Totals
  const totalMTOQuantity = DEFAULT_MTO_ITEMS.reduce((sum, item) => sum + item.qty, 0);
  const totalBOMEstimateSAR = DEFAULT_MTO_ITEMS.reduce((sum, item) => sum + item.qty * item.estUnitRateSAR, 0);
  const totalManHours = DEFAULT_LABOR_SCHEDULE.reduce((sum, crew) => sum + crew.hours, 0);
  const totalLaborCostSAR = DEFAULT_LABOR_SCHEDULE.reduce((sum, crew) => sum + crew.hours * crew.rateSAR, 0);
  const totalSpecialtyContingencySAR = DEFAULT_SPECIALTY_FLAGS.reduce((sum, flag) => sum + flag.provisionalSumSAR, 0);

  // Push Extracted MTO to Store Cost Lines
  const handlePushToPricing = () => {
    DEFAULT_MTO_ITEMS.filter((i) => i.status === "Verified Core BOM").forEach((item, idx) => {
      const wbs = `1.${idx + 1}`;
      addCostLine();
      setTimeout(() => {
        const storeLines = useStore.getState().costLines;
        const lastLine = storeLines[storeLines.length - 1];
        if (lastLine) {
          updateCostLine(lastLine.id, {
            wbs,
            description: `${item.code}: ${isAr ? item.descriptionAr : item.description}`,
            category: "Material",
            qty: item.qty,
            unit: item.unit,
            rate: item.estUnitRateSAR,
            contingency: 8
          });
        }
      }, 50 * idx);
    });

    s.notify(
      isAr ? "تم ترحيل حصر الكميات للتسعير" : "MTO Pushed to Pricing",
      isAr
        ? "تم تصدير 9 بنود مواد معتمدة مباشرة إلى سجل تسعير العطاء (WBS)."
        : "9 Verified Core BOM lines exported directly into the Pricing Build-up register.",
      "/app/pricing/build-up"
    );
    setPushedToPricing(true);
  };

  // Re-run extraction simulation or load sample SOW
  const handleLoadDemoSOW = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setDemoLoaded(true);
      s.notify(
        isAr ? "اكتمل استخراج نطاق العمل" : "SOW Extraction Complete",
        isAr
          ? "تم استيعاب كراسة أرامكو السعودية المكونة من 98 صفحة (GSC 8142331) وتوليد حصر المواد، العمالة، ومؤشرات المخاطر."
          : "Ingested 98-page Saudi Aramco Scope of Work (GSC 8142331) with preliminary MTO, labor schedule, and risk flags.",
        "/app/documents"
      );
    }, 900);
  };

  // =========================================================================
  // EMPTY INTAKE SCREEN FOR NEW WORKSPACES (WHEN NO SOW IS INGESTED YET)
  // =========================================================================
  // Real documents -> the real takeoff screen (nothing from the built-in sample is shown).
  if (hasRealDocs && !sampleMode) return <SOWTakeoffReal onUploadRequest={onUploadRequest} onShowSample={() => setShowSample(true)} />;

  if (!isIngested) {
    return (
      <div className={cn("space-y-6", isAr && "text-right")} dir={isAr ? "rtl" : "ltr"}>
        {/* Language Switcher Bar */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-app-muted">
              {isAr ? "نظام استيعاب العقود والمواصفات" : "Contract & Specification Intake System"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded border border-app-border bg-app-panel p-1 text-xs">
            <Languages size={13} className="text-app-muted" />
            <button
              onClick={() => handleLanguageChange("en")}
              className={cn(
                "rounded px-2 py-0.5 font-mono text-[11px] transition-colors",
                lang === "en" ? "bg-app-accent text-white font-bold" : "text-app-muted hover:text-app-text"
              )}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange("ar")}
              className={cn(
                "rounded px-2.5 py-0.5 font-sans text-[11px] transition-colors",
                lang === "ar" ? "bg-app-accent text-white font-bold" : "text-app-muted hover:text-app-text"
              )}
            >
              العربية
            </button>
          </div>
        </div>

        <Card className="border-app-border bg-gradient-to-r from-app-panel via-app-panel-2 to-app-accent/5 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-app-accent/15 text-app-accent">
            <Layers size={28} />
          </div>

          <h2 className="mt-4 font-display text-2xl text-app-text">
            {isAr
              ? "محرك استيعاب نطاق العمل وحصر الكميات الآلي (SOW)"
              : "Scope of Work (SOW) Intake & Automated Takeoff Engine"}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs text-app-muted leading-relaxed">
            {isAr
              ? `لم يتم تحليل مستند نطاق عمل لمشروع (${activeTender?.name || "هذا المشروع"}) بعد. ارفع مستند نطاق العمل أو كراسة الشروط والمواصفات (PDF أو Word حتى 98 صفحة) لاستخراج مخرجات النطاق، جداول حصر المواد المبدئية، جداول العمالة، ومؤشرات المخاطر التشغيلية تلقائياً.`
              : `No Scope of Work has been analyzed for ${activeTender?.name || "this workspace"} yet. Upload your project SOW, ITT, or RFP document (PDF or Word up to 98 pages) to automatically extract scope deliverables, bill of materials, time schedules, and operational risk flags.`}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={onUploadRequest}
              className="gap-2 px-5 py-2"
            >
              <UploadCloud size={16} />
              {isAr ? "رفع مستند نطاق العمل (حتى 98 صفحة)" : "Upload SOW Document (Up to 98 Pages)"}
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={handleLoadDemoSOW}
              disabled={isProcessing}
              className="gap-2 px-4 py-2"
            >
              <Sparkles size={15} className={cn("text-app-accent", isProcessing && "animate-spin")} />
              {isProcessing
                ? isAr ? "جاري استيعاب كراسة أرامكو..." : "Loading Sample SOW..."
                : isAr ? "استكشاف كراسة أرامكو السعودية (98 صفحة)" : "Explore with Sample Saudi Aramco SOW (98 pp)"}
            </Button>
          </div>
        </Card>

        {/* 4 Feature Deliverables Cards Preview */}
        <div>
          <SectionTitle>
            {isAr ? "مخرجات خط الاستخراج والتحقق الآلي" : "Automated Extraction Pipeline Deliverables"}
          </SectionTitle>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 bg-app-panel space-y-2">
              <div className="flex items-center gap-2 text-app-accent font-mono text-xs font-semibold">
                <FileText size={15} />
                {isAr ? "١. النطاق والتواريخ" : "1. Scope & Dates"}
              </div>
              <h3 className="font-semibold text-xs text-app-text">
                {isAr ? "ملخص النطاق والتواريخ الرئيسية" : "Scope Summary & Key Dates"}
              </h3>
              <p className="text-[11px] text-app-muted leading-relaxed">
                {isAr
                  ? "استخراج أبعاد المشروع، إدارات العميل، الموعد النهائي لتقديم العطاء، نظام العمل لـ 7 أيام، وبوابة اعتماد العينات."
                  : "Extracts project magnitude, client departments, strict closing deadlines, 7-day shift regimes, and sample approval gates."}
              </p>
            </Card>

            <Card className="p-4 bg-app-panel space-y-2">
              <div className="flex items-center gap-2 text-app-green font-mono text-xs font-semibold">
                <Layers size={15} />
                {isAr ? "٢. حصر المواد (MTO)" : "2. Material Takeoff (MTO)"}
              </div>
              <h3 className="font-semibold text-xs text-app-text">
                {isAr ? "جدول حصر المواد المبدئي (BOM)" : "BOM Preliminary Register"}
              </h3>
              <p className="text-[11px] text-app-muted leading-relaxed">
                {isAr
                  ? "حصر دقيق للمحابس والصناديق والعدادات مع تصفية بنود التعديل غير المسعرة وفروقات الكميات الإلزامية."
                  : "Quantifies pipe spools, valves, enclosures, and meters, while actively filtering \"Junk Requisitions\" and unpriced variations."}
              </p>
            </Card>

            <Card className="p-4 bg-app-panel space-y-2">
              <div className="flex items-center gap-2 text-app-blue font-mono text-xs font-semibold">
                <Users size={15} />
                {isAr ? "٣. أطقم التنفيذ وساعات العمل" : "3. Time & Crew Takeoff"}
              </div>
              <h3 className="font-semibold text-xs text-app-text">
                {isAr ? "جداول العمالة والآليات والمعدات" : "Labor & Equipment Schedules"}
              </h3>
              <p className="text-[11px] text-app-muted leading-relaxed">
                {isAr
                  ? "احتساب ساعات العمل للأطقم المعتمدة: فنيو الأنابيب، اللحامون، مستلمو التصاريح، ومسؤولو السلامة المعتمدون من OSHA."
                  : "Builds man-hour budgets across certified pipe fitters, welders, work permit receivers, and OSHA safety officers."}
              </p>
            </Card>

            <Card className="p-4 bg-app-panel space-y-2">
              <div className="flex items-center gap-2 text-app-red font-mono text-xs font-semibold">
                <ShieldAlert size={15} />
                {isAr ? "٤. مؤشرات المخاطر التشغيلية" : "4. Specialty Risk Flags"}
              </div>
              <h3 className="font-semibold text-xs text-app-text">
                {isAr ? "حماية هامش الربح من خسائر التنفيذ" : "Operational Loss Protection"}
              </h3>
              <p className="text-[11px] text-app-muted leading-relaxed">
                {isAr
                  ? "عزل مخاطر نزح المياه، غرف مضخات الحريق، ومحطات الرفع الصحي لمنع نزيف 5% إلى 10% من قيمة العقد بعد الترسية."
                  : "Isolates unpriced Dewatering, Fire Pump Rooms, and Sanitary Lift Station hazards to prevent 5%–10% execution margin loss."}
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // FULL EXTRACTED WORKBENCH VIEW (WHEN AN SOW HAS BEEN INGESTED)
  // =========================================================================
  return (
    <div className={cn("space-y-6", isAr && "text-right font-sans")} dir={isAr ? "rtl" : "ltr"}>
      {/* The data on this screen is the built-in Saudi Aramco sample, never the user's own file */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-app-yellow/50 bg-app-yellow/10 px-4 py-2.5">
        <p className="flex items-center gap-2 text-xs font-semibold text-app-yellow"><AlertTriangle size={14} />{isAr ? "بيانات تجريبية — هذا مثال مدمج وليس من ملفاتك" : "SAMPLE DATA — a built-in example (Saudi Aramco smart meters). It is not read from your files."}</p>
        {hasRealDocs && <Button size="sm" variant="outline" onClick={() => { setShowSample(false); setDemoLoaded(false); }}>{isAr ? "العودة إلى مستنداتي" : "Back to my documents"}</Button>}
      </div>

      {/* Top Banner: Scope Takeoff Engine */}
      <Card className="border-app-accent/40 bg-gradient-to-r from-app-panel via-app-panel-2 to-app-accent/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge tone="accent">
                {isAr ? "محرك الاستخراج الذكي" : "Automated AI Pipeline"}
              </Badge>
              <Badge tone="green">
                {isAr ? "شاشة مهندس التسعير المعتمد" : "Lead Estimator View"}
              </Badge>
              <Badge tone="outline">
                {isAr ? "معايير أرامكو السعودية" : "Saudi Aramco SOW Engine"}
              </Badge>
            </div>
            <h2 className="font-display text-xl text-app-text">
              {isAr
                ? "محرك استيعاب نطاق العمل وحصر الكميات الآلي (SOW & MTO Engine)"
                : "Scope of Work (SOW) Intake & Automated Takeoff Engine"}
            </h2>
            <p className="max-w-3xl text-xs text-app-muted leading-relaxed">
              {isAr
                ? "استيعاب متقدم لكراسات الشروط والمواصفات المعقدة (حتى 98 صفحة). استخراج تلقائي لبيانات النطاق، جداول حصر المواد المبدئية (MTO)، جداول ساعات وأطقم العمالة، وعزل مؤشرات المخاطر التشغيلية لمنع خسارة 5%–10% أثناء التنفيذ."
                : "Deep ingestion of complex tender specifications (up to 98 pages). Automatically extracts project scope, preliminary Material Takeoffs (MTO), time & crew labor schedules, and isolates high-cost specialty operational flags to prevent execution margin loss."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 rounded border border-app-border bg-app-panel px-1 py-0.5 text-xs">
              <Languages size={13} className="text-app-muted" />
              <button
                onClick={() => handleLanguageChange("en")}
                className={cn(
                  "rounded px-2 py-0.5 font-mono text-[11px] transition-colors",
                  lang === "en" ? "bg-app-accent text-white font-bold" : "text-app-muted hover:text-app-text"
                )}
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageChange("ar")}
                className={cn(
                  "rounded px-2.5 py-0.5 font-sans text-[11px] transition-colors",
                  lang === "ar" ? "bg-app-accent text-white font-bold" : "text-app-muted hover:text-app-text"
                )}
              >
                العربية
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadDemoSOW}
              disabled={isProcessing}
              className="gap-1.5"
            >
              <Sparkles size={13} className={cn("text-app-accent", isProcessing && "animate-spin")} />
              {isProcessing
                ? isAr ? "جاري الاستيعاب..." : "Ingesting SOW (98 pp)..."
                : isAr ? "إعادة تحليل الكراسة (98 صفحة)" : "Re-Extract 98-Page SOW"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePushToPricing}
              disabled={pushedToPricing}
              className="gap-1.5"
            >
              {pushedToPricing ? <Check size={13} /> : <SlidersHorizontal size={13} />}
              {pushedToPricing
                ? isAr ? "تم الترحيل لجدول التسعير" : "Exported to Pricing Build-up"
                : isAr ? "ترحيل حصر المواد لجدول التسعير" : "Push MTO to Pricing Build-Up"}
            </Button>
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-app-border pt-4 sm:grid-cols-4 lg:grid-cols-6">
          <div>
            <Label>{isAr ? "المستند المستوعب" : "Ingested Document"}</Label>
            <p className="mt-0.5 font-mono text-xs font-semibold text-app-text truncate">
              {sowDoc?.name || "SCOPE OF WORK Water meter.pdf"}
            </p>
            <span className="text-[10px] text-app-dim">
              {isAr ? "رقم العقد GSC 8142331 (98 صفحة)" : "Control GSC 8142331 (98 pp)"}
            </span>
          </div>
          <div>
            <Label>{isAr ? "محرك الاستخراج" : "Extraction Engine"}</Label>
            <p className="mt-0.5 text-xs font-semibold text-app-accent">
              {isAr ? "ذكاء اصطناعي موثق (هجين)" : "Verified Hybrid AI"}
            </p>
            <span className="text-[10px] text-app-dim">
              {isAr ? "قاعدة LanceDB (64,980 قاعدة)" : "LanceDB 64,980 Rules"}
            </span>
          </div>
          <div>
            <Label>{isAr ? "إجمالي بنود المواد (MTO)" : "Total MTO Components"}</Label>
            <p className="mt-0.5 font-display text-lg text-app-text">
              {totalMTOQuantity.toLocaleString()}{" "}
              <span className="text-xs font-normal text-app-muted">{isAr ? "وحدة" : "units"}</span>
            </p>
            <span className="text-[10px] text-app-green">
              {isAr ? "9 بنود معتمدة + تنبيهان" : "9 Core BOM + 2 Junk Flags"}
            </span>
          </div>
          <div>
            <Label>{isAr ? "ساعات العمل المعتمدة" : "Mandated Man-Hours"}</Label>
            <p className="mt-0.5 font-display text-lg text-app-green">
              {totalManHours.toLocaleString()}{" "}
              <span className="text-xs font-normal text-app-muted">{isAr ? "ساعة" : "hrs"}</span>
            </p>
            <span className="text-[10px] text-app-dim">
              {isAr ? "الحد الأدنى 3,000 (+240%)" : "Min 3,000 threshold (+240%)"}
            </span>
          </div>
          <div>
            <Label>{isAr ? "حجم المخاطر التشغيلية" : "Specialty Risk Exposure"}</Label>
            <p className="mt-0.5 font-display text-lg text-app-yellow">
              {fmtMoney(totalSpecialtyContingencySAR, "SAR")}
            </p>
            <span className="text-[10px] text-app-red">
              {isAr ? "3 مؤشرات حرجة معزولة" : "3 Critical Flags Isolated"}
            </span>
          </div>
          <div>
            <Label>{isAr ? "حالة الاعتماد" : "Review Status"}</Label>
            <p className="mt-0.5 text-xs font-semibold text-app-yellow">
              {isAr ? "بانتظار توقيع مهندس التسعير" : "Pending Estimator Sign-off"}
            </p>
            <span className="text-[10px] text-app-dim">
              {isAr ? "فريق التسعير والعقود" : "Commercial & Estimating Team"}
            </span>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-app-border pb-2 gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("summary")}
            className={cn(
              "flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === "summary"
                ? "bg-app-accent/15 text-app-accent border border-app-accent/40"
                : "text-app-muted hover:bg-app-panel-2 hover:text-app-text"
            )}
          >
            <FileText size={13} />
            {isAr ? "١. ملخص النطاق والتواريخ" : "1. Scope Summary & Key Dates"}
          </button>
          <button
            onClick={() => setActiveTab("mto")}
            className={cn(
              "flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === "mto"
                ? "bg-app-accent/15 text-app-accent border border-app-accent/40"
                : "text-app-muted hover:bg-app-panel-2 hover:text-app-text"
            )}
          >
            <Layers size={13} />
            {isAr ? "٢. جدول حصر المواد المبدئي (MTO)" : "2. Material Takeoff (MTO) Register"}
            <span className="ml-1 rounded bg-app-panel-2 px-1 py-0.2 font-mono text-[10px]">
              {DEFAULT_MTO_ITEMS.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("labor")}
            className={cn(
              "flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === "labor"
                ? "bg-app-accent/15 text-app-accent border border-app-accent/40"
                : "text-app-muted hover:bg-app-panel-2 hover:text-app-text"
            )}
          >
            <Users size={13} />
            {isAr ? "٣. جدول العمالة وأطقم التنفيذ" : "3. Time & Labor Takeoff Schedule"}
            <span className="ml-1 rounded bg-app-panel-2 px-1 py-0.2 font-mono text-[10px]">
              {totalManHours.toLocaleString()} {isAr ? "ساعة" : "hrs"}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("specialty")}
            className={cn(
              "flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === "specialty"
                ? "bg-app-red/15 text-app-red border border-app-red/40"
                : "text-app-muted hover:bg-app-panel-2 hover:text-app-text"
            )}
          >
            <ShieldAlert size={13} className="text-app-red" />
            {isAr ? "٤. مؤشرات المخاطر التشغيلية" : "4. High-Cost Specialty Flags"}
            <span className="ml-1 rounded bg-app-red/20 px-1 py-0.2 font-mono text-[10px] text-app-red">
              {isAr ? "3 تنبيهات" : "3 Alerts"}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-app-dim">
            {isAr
              ? "المرجع: كراسة الشروط والمواصفات الفنية (GSC 8142331)"
              : "Source: SOW Volume 1 & Technical Annexures (GSC 8142331)"}
          </span>
          {demoLoaded && (
            <button
              onClick={() => { setDemoLoaded(false); setShowSample(false); }}
              className="flex items-center gap-1 rounded border border-app-border px-2 py-0.5 text-[10px] text-app-muted hover:text-app-red"
            >
              <RotateCcw size={10} /> {isAr ? "مسح النموذج" : "Clear Sample"}
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: SCOPE SUMMARY & KEY DATES */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5 space-y-4">
              <SectionTitle right={<Badge tone="accent">{isAr ? "سعر مقطوع (Lump Sum)" : "Lump-Sum SOW"}</Badge>}>
                {isAr ? "ملخص نطاق المشروع" : "Project Scope Overview"}
              </SectionTitle>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-app-border pb-2">
                  <span className="text-app-muted">{isAr ? "العميل والإدارة:" : "Client & Department:"}</span>
                  <span className="font-medium text-app-text text-left ltr:text-right">
                    {isAr ? "شركة الزيت العربية السعودية (أرامكو السعودية)" : "Saudi Arabian Oil Company (Saudi Aramco)"}
                    <br />
                    <span className="text-app-dim">
                      {isAr ? "إدارة خدمات المجتمع المركزية · صيانة الظهران" : "Central Community Services · Dhahran Maintenance"}
                    </span>
                  </span>
                </div>

                <div className="flex justify-between border-b border-app-border pb-2">
                  <span className="text-app-muted">{isAr ? "صيغة العقد:" : "Contract Form:"}</span>
                  <span className="font-mono text-app-text">
                    {isAr ? "عقد أمر خدمات عامة (GSC 8142331)" : "General Service Order Contract (GSC 8142331)"}
                  </span>
                </div>

                <div className="flex justify-between border-b border-app-border pb-2">
                  <span className="text-app-muted">{isAr ? "الموقع الجغرافي:" : "Geographical Location:"}</span>
                  <span className="font-medium text-app-text text-left ltr:text-right">
                    {isAr ? "مجتمع الظهران السكني، المنطقة الشرقية، المملكة" : "Dhahran Community Camp, Eastern Province, KSA"}
                    <br />
                    <span className="text-app-dim">
                      {isAr ? "المخيم الرئيسي، تلال الظهران، مخيم الربية" : "Main Camp, Dhahran Hills, Rabiya Camp"}
                    </span>
                  </span>
                </div>

                <div className="flex justify-between border-b border-app-border pb-2">
                  <span className="text-app-muted">{isAr ? "حجم النطاق التعاقدي:" : "Scope Magnitude:"}</span>
                  <span className="font-semibold text-app-accent text-left ltr:text-right">
                    {isAr ? "3,758 وحدة سكنية + 38 عداداً للشبكة" : "3,758 Residential Units + 38 District Meters"}
                    <br />
                    <span className="text-app-dim">
                      {isAr ? "المخيم الرئيسي (3,386 وحدة) · مخيم الربية (372 وحدة)" : "Main Camp (3,386 units) · Rabiya Camp (372 units)"}
                    </span>
                  </span>
                </div>

                <div className="flex justify-between border-b border-app-border pb-2">
                  <span className="text-app-muted">{isAr ? "التزامات المقاول:" : "Contractor Deliverables:"}</span>
                  <span className="text-app-text max-w-xs text-left ltr:text-right">
                    {isAr
                      ? "التصميم الهندسي، التوريد، التصنيع، الإزالة، التركيب على الجدران، قطع الاستقامة، الاختبارات، بدء التشغيل، والمخططات المنفذة والسجلات بالإنجليزية."
                      : "Engineering design, procurement, fabrication, demolition, wall-enclosure mounting, straight-run spools, testing, pre-commissioning, as-builts & English record books."}
                  </span>
                </div>

                <div className="rounded bg-app-yellow/10 border border-app-yellow/30 p-3 mt-2">
                  <p className="font-semibold text-app-yellow flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    {isAr ? "تنبيه فارق كميات حرج (1,670 وحدة سكنية غير مسعرة)" : "Critical Scope Discrepancy (1,670 Residences Unaccounted)"}
                  </p>
                  <p className="mt-1 text-[11px] text-app-text leading-relaxed">
                    {isAr
                      ? "تسجل كراسة الشروط أن 5,428 مسكناً في الظهران لا تحتوي على عدادات، في حين أن النطاق المطلوب تسعيره مقصور على 3,758 عداداً فقط. تجنب تسعير الـ 5,428 مسكناً ضمن العطاء المقطوع؛ واستبعد الفارق (1,670 مسكناً) لتجنب أعباء غير مدفوعة."
                      : "SOW Part II §1.0 records that 5,428 residences in Dhahran Community Camp lack water meters, yet the contracted billable scope is capped at 3,758 meters. Do not price all 5,428 units into lump-sum; exclude the 1,670 residence differential to avoid uncompensated work."}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <SectionTitle right={<Badge tone="outline">{isAr ? "الجدول الزمني" : "Project Timeline"}</Badge>}>
                {isAr ? "مواعيد تقديم العطاء والتواريخ الهامة" : "Submission Deadlines & Key Dates"}
              </SectionTitle>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded border border-app-border bg-app-panel-2 p-3">
                  <Calendar size={18} className="text-app-red shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-app-text">
                        {isAr ? "الموعد النهائي لتقديم العطاء" : "Bid Submission Deadline"}
                      </span>
                      <Badge tone="red">{isAr ? "إغلاق صارم" : "Strict Closing"}</Badge>
                    </div>
                    <p className="font-mono text-sm font-bold text-app-red mt-0.5">2026-10-28 · 16:00 AST</p>
                    <p className="text-[11px] text-app-dim mt-0.5">
                      {isAr
                        ? "تقديم العرضين الفني والمالي تمهيداً للاجتماع بالرئيس التنفيذي بالمنطقة الشرقية."
                        : "Technical & Commercial proposal submission ahead of Eastern Area executive review."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded border border-app-border bg-app-panel-2 p-3">
                  <Clock size={18} className="text-app-yellow shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-app-text">
                        {isAr ? "آخر موعد لتقديم الاستفسارات الفنية" : "Clarification Request Cut-Off"}
                      </span>
                      <Badge tone="yellow">{isAr ? "قبل 10 أيام" : "10 Days Prior"}</Badge>
                    </div>
                    <p className="font-mono text-xs font-semibold text-app-yellow mt-0.5">2026-10-18 · 17:00 AST</p>
                    <p className="text-[11px] text-app-dim mt-0.5">
                      {isAr
                        ? "الموعد النهائي لإرسال الاستفسارات C-11 (الأمن)، C-12 (مستلم التصاريح)، و C-13 (معايير MEP)."
                        : "Deadline to send Clarification C-11 (Security), C-12 (Permit receiver presence), and C-13 (MEP standards)."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded border border-app-border bg-app-panel-2 p-3">
                  <HardHat size={18} className="text-app-blue shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-app-text">
                        {isAr ? "نظام الورديات وساعات العمل المعتمدة" : "Working Hours & Shift Regime"}
                      </span>
                      <Badge tone="blue">{isAr ? "7 أيام / أسبوع" : "7 Days / Week"}</Badge>
                    </div>
                    <p className="font-mono text-xs font-semibold text-app-text mt-0.5">
                      {isAr ? "07:00 إلى 16:00 يومياً (وردية 9 ساعات)" : "07:00 to 16:00 Daily (9h Shift)"}
                    </p>
                    <p className="text-[11px] text-app-dim mt-0.5">
                      {isAr
                        ? "إلزامي وفق البند §4.1. تصريح عمل أرامكو نموذج 924 لكل وردية مع تواجد مستلم التصريح ميدانياً."
                        : "Mandated by SOW §4.1. Work Permit (Form 924) required per crew per shift with physical receiver on site."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded border border-app-border bg-app-panel-2 p-3">
                  <CheckCircle2 size={18} className="text-app-green shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-app-text">
                        {isAr ? "محطة اعتماد العينات" : "Sample Approval Milestone"}
                      </span>
                      <Badge tone="green">{isAr ? "شرط بدء الإنشاء" : "Pre-Construction Gate"}</Badge>
                    </div>
                    <p className="font-mono text-xs font-semibold text-app-text mt-0.5">
                      {isAr ? "خلال 14 يوماً من الحشد" : "Day 14 Post Mobilization"}
                    </p>
                    <p className="text-[11px] text-app-dim mt-0.5">
                      {isAr
                        ? "تركيب نماذج فعلية للعدادات بالصناديق في منازل سكنية محددة لمعاينتها واعتمادها من أرامكو قبل التصنيع الموسع."
                        : "Install physical sample meter boxes at designated residential cluster homes for Aramco approval prior to bulk manufacturing."}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="border-app-border p-4 bg-app-panel-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert size={20} className="text-app-accent shrink-0" />
              <div>
                <p className="text-xs font-semibold text-app-text">
                  {isAr
                    ? "حماية هامش الربح من خسائر التنفيذ (منع نزيف 5% إلى 10% بعد الفوز بالعطاء)"
                    : "Project Execution Margin Leakage Protection (Targeting 5%–10% Loss Mitigation)"}
                </p>
                <p className="text-[11px] text-app-muted">
                  {isAr
                    ? "يعزل محرك حصر الكميات البنود غير المسعرة (فروقات جدول 1.2، نزح المياه، غرف مضخات الحريق) لحماية قيمة العقد المالي المتفق عليها."
                    : "Automated MTO analysis isolates missing items (Table 1.2 unpriced variations, dewatering, fire pump room tie-ins) to safeguard the initial winning bid amount during field execution."}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveTab("specialty")} className="gap-1 shrink-0">
              {isAr ? "عرض مؤشرات المخاطر" : "View Specialty Flags"}{" "}
              <ChevronRight size={12} className={cn(isAr && "rotate-180")} />
            </Button>
          </Card>
        </div>
      )}

      {/* TAB 2: MATERIAL TAKEOFF (MTO) PRELIMINARY REGISTER */}
      {activeTab === "mto" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search size={13} className={cn("absolute top-2.5 text-app-muted", isAr ? "right-2.5" : "left-2.5")} />
                <input
                  type="text"
                  placeholder={isAr ? "البحث عن رمز، مواصفة، عنصر..." : "Search item, code, spec..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    "w-full rounded border border-app-border bg-app-panel py-1.5 text-xs text-app-text outline-none focus:border-app-accent",
                    isAr ? "pr-8 pl-3" : "pl-8 pr-3"
                  )}
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded border border-app-border bg-app-panel px-2.5 py-1.5 text-xs text-app-text outline-none"
              >
                <option value="All">{isAr ? "جميع الفئات" : "All Categories"}</option>
                <option value="Water Meters">{isAr ? "عدادات المياه" : "Water Meters"}</option>
                <option value="Enclosures">{isAr ? "الصناديق والحاويات" : "Enclosures"}</option>
                <option value="Valves & Spools">{isAr ? "المحابس وقطع الوصل" : "Valves & Spools"}</option>
                <option value="Safety & Temporary Power">{isAr ? "السلامة والتغذية المؤقتة" : "Safety & Power"}</option>
                <option value="Fittings & Assemblies">{isAr ? "ملحقات التركيب" : "Fittings"}</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded border border-app-border bg-app-panel px-2.5 py-1.5 text-xs text-app-text outline-none"
              >
                <option value="All">{isAr ? "جميع الحالات" : "All Statuses"}</option>
                <option value="Verified Core BOM">{isAr ? "جدول المواد المعتمد" : "Verified Core BOM"}</option>
                <option value="Junk / Unverified Requisition">{isAr ? "طلبات غير مسعرة / فروقات" : "Junk / Variance Alert"}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const csv = [
                    ["Code", "Description", "Category", "Qty", "Unit", "Est Rate (SAR)", "Status", "Notes"].join(","),
                    ...DEFAULT_MTO_ITEMS.map((i) =>
                      [
                        i.code,
                        `"${isAr ? i.descriptionAr : i.description}"`,
                        isAr ? i.categoryAr : i.category,
                        i.qty,
                        isAr ? i.unitAr : i.unit,
                        i.estUnitRateSAR,
                        isAr ? i.statusAr : i.status,
                        `"${isAr ? i.notesAr : i.notes}"`
                      ].join(",")
                    )
                  ].join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = isAr ? "Saudi_Aramco_MTO_Register_AR.csv" : "Saudi_Aramco_Smart_Meters_MTO_Register.csv";
                  a.click();
                }}
                className="gap-1.5"
              >
                <Download size={12} /> {isAr ? "تصدير جدول المواد (CSV)" : "Export MTO (CSV)"}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded border border-app-border bg-app-panel">
            <table className="w-full text-left ltr:text-left rtl:text-right text-xs">
              <thead>
                <tr className="border-b border-app-border bg-app-panel-2 font-mono text-[10px] uppercase tracking-wider text-app-muted">
                  <th className="px-3 py-2.5">{isAr ? "رمز العنصر" : "Item Code"}</th>
                  <th className="px-3 py-2.5">{isAr ? "وصف المكون والمواصفات" : "Component Description & Specification"}</th>
                  <th className="px-3 py-2.5">{isAr ? "الفئة" : "Category"}</th>
                  <th className="px-3 py-2.5 text-right rtl:text-left">{isAr ? "الكمية" : "Quantity"}</th>
                  <th className="px-3 py-2.5">{isAr ? "الوحدة" : "Unit"}</th>
                  <th className="px-3 py-2.5 text-right rtl:text-left">{isAr ? "سعر الوحدة (ر.س)" : "Est. Unit (SAR)"}</th>
                  <th className="px-3 py-2.5 text-right rtl:text-left">{isAr ? "الإجمالي التقديري" : "Total Est (SAR)"}</th>
                  <th className="px-3 py-2.5">{isAr ? "التصنيف" : "Classification & Flags"}</th>
                  <th className="px-3 py-2.5">{isAr ? "المرجع بالسند" : "Source Ref"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {filteredMTO.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "hover:bg-app-panel-2/60 transition-colors",
                      item.status === "Junk / Unverified Requisition" && "bg-app-red/5"
                    )}
                  >
                    <td className="px-3 py-2.5 font-mono text-app-accent font-semibold whitespace-nowrap">
                      {item.code}
                    </td>
                    <td className="px-3 py-2.5 max-w-sm">
                      <p className="font-medium text-app-text">{isAr ? item.descriptionAr : item.description}</p>
                      <p className="text-[10px] text-app-dim mt-0.5">{isAr ? item.notesAr : item.notes}</p>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-app-muted">
                      {isAr ? item.categoryAr : item.category}
                    </td>
                    <td className="px-3 py-2.5 text-right rtl:text-left font-mono font-semibold text-app-text">
                      {item.qty.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-app-dim">
                      {isAr ? item.unitAr : item.unit}
                    </td>
                    <td className="px-3 py-2.5 text-right rtl:text-left font-mono text-app-muted">
                      {item.estUnitRateSAR ? fmtMoney(item.estUnitRateSAR, "SAR") : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right rtl:text-left font-mono font-semibold text-app-text">
                      {item.estUnitRateSAR ? fmtMoney(item.qty * item.estUnitRateSAR, "SAR") : (isAr ? "مستبعد" : "Excluded")}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {item.status === "Verified Core BOM" ? (
                        <Badge tone="green" className="gap-1">
                          <CheckCircle2 size={10} /> {isAr ? "جدول المواد المعتمد" : "Verified Core BOM"}
                        </Badge>
                      ) : (
                        <Badge tone="red" className="gap-1">
                          <AlertTriangle size={10} /> {isAr ? "طلبات غير مسعرة / فارق" : "Junk / Scope Gap"}
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-app-dim font-mono whitespace-nowrap">
                      {isAr ? `ص ${item.page} (${item.clause})` : `p.${item.page} (${item.clause})`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-3.5 bg-app-panel-2">
              <Label>{isAr ? "إجمالي جدول المواد المعتمد" : "Verified Core BOM Subtotal"}</Label>
              <p className="font-display text-xl text-app-green mt-1">{fmtMoney(totalBOMEstimateSAR, "SAR")}</p>
              <p className="text-[10px] text-app-dim">
                {isAr ? "تقدير المواد الأساسية لـ 3,758 عداداً وصندوقاً" : "Materials base estimate for 3,758 meters & enclosures"}
              </p>
            </Card>
            <Card className="p-3.5 bg-app-panel-2">
              <Label>{isAr ? "المخاطر والبنود غير المسعرة" : "Unpriced / Junk Requisition Risk"}</Label>
              <p className="font-display text-xl text-app-red mt-1">
                {isAr ? "بندان معزولان" : "2 Items Flagged"}
              </p>
              <p className="text-[10px] text-app-dim">
                {isAr ? "حذف جدول 1.2 + فارق 1,670 منزلاً غير مسعر" : "Table 1.2 omissions + 1,670 unmetered house gap"}
              </p>
            </Card>
            <Card className="p-3.5 bg-app-panel-2">
              <Label>{isAr ? "حالة ترحيل التسعير" : "Pricing Transfer Status"}</Label>
              <p className="font-display text-xl text-app-accent mt-1">
                {pushedToPricing
                  ? isAr ? "تم الربط مع التسعير" : "Synced to Pricing Build-up"
                  : isAr ? "جاهز للترحيل" : "Ready to Push"}
              </p>
              <p className="text-[10px] text-app-dim">
                {isAr ? "ربط مباشر مع هيكل التكلفة WBS وهامش الربح" : "Direct link to WBS Cost Lines and margin markup"}
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: TIME & LABOR TAKEOFF SCHEDULE */}
      {activeTab === "labor" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <Card className="p-3.5 bg-app-panel-2">
              <Label>{isAr ? "إجمالي ساعات العمل التقديرية" : "Total Estimated Man-Hours"}</Label>
              <p className="font-display text-2xl text-app-green mt-1">
                {totalManHours.toLocaleString()} {isAr ? "ساعة" : "hrs"}
              </p>
              <span className="text-[10px] text-app-green font-medium">
                {isAr ? "يتجاوز شرط الـ 3,000 ساعة (+240%)" : "Surpasses Client 3,000 hrs Mandate (+240%)"}
              </span>
            </Card>
            <Card className="p-3.5 bg-app-panel-2">
              <Label>{isAr ? "أطقم العمل وذروة العمالة" : "Field Crews & Peak Headcount"}</Label>
              <p className="font-display text-2xl text-app-text mt-1">
                {isAr ? "32 فنياً ومهندساً" : "32 Personnel"}
              </p>
              <span className="text-[10px] text-app-dim">
                {isAr ? "عبر 4 جبهات تركيب متزامنة" : "Across 4 concurrent installation fronts"}
              </span>
            </Card>
            <Card className="p-3.5 bg-app-panel-2">
              <Label>{isAr ? "نظام الورديات الأسبوعي" : "Work Schedule Window"}</Label>
              <p className="font-display text-xl text-app-blue mt-1">
                {isAr ? "7 أيام / أسبوع" : "7 Days / Week"}
              </p>
              <span className="text-[10px] text-app-dim">
                {isAr ? "وردية يومية 07:00–16:00 (§4.1)" : "07:00–16:00 Daily shift (§4.1)"}
              </span>
            </Card>
            <Card className="p-3.5 bg-app-panel-2">
              <Label>{isAr ? "ميزانية الأجور المباشرة" : "Direct Labor Budget Est."}</Label>
              <p className="font-display text-xl text-app-text mt-1">{fmtMoney(totalLaborCostSAR, "SAR")}</p>
              <span className="text-[10px] text-app-dim">
                {isAr ? "معدلات معتمدة تشمل تجهيزات السلامة" : "Certified rates including Aramco PPE"}
              </span>
            </Card>
          </div>

          <div className="overflow-x-auto rounded border border-app-border bg-app-panel">
            <table className="w-full text-left ltr:text-left rtl:text-right text-xs">
              <thead>
                <tr className="border-b border-app-border bg-app-panel-2 font-mono text-[10px] uppercase tracking-wider text-app-muted">
                  <th className="px-3 py-2.5">{isAr ? "التخصص / الحرفة" : "Craft / Discipline"}</th>
                  <th className="px-3 py-2.5">{isAr ? "الاعتماد الإلزامي" : "Mandatory Certification"}</th>
                  <th className="px-3 py-2.5 text-center">{isAr ? "الأطقم" : "Crews"}</th>
                  <th className="px-3 py-2.5 text-center">{isAr ? "العدد" : "Headcount"}</th>
                  <th className="px-3 py-2.5 text-right rtl:text-left">{isAr ? "ساعات العمل" : "Man-Hours"}</th>
                  <th className="px-3 py-2.5 text-right rtl:text-left">{isAr ? "المعدل (ر.س/ساعة)" : "Rate (SAR/h)"}</th>
                  <th className="px-3 py-2.5 text-right rtl:text-left">{isAr ? "الإجمالي (ر.س)" : "Labor Total (SAR)"}</th>
                  <th className="px-3 py-2.5">{isAr ? "المعدات والأدوات المخصصة" : "Required Tools & Equipment Allocation"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {DEFAULT_LABOR_SCHEDULE.map((crew) => (
                  <tr key={crew.id} className="hover:bg-app-panel-2/60 transition-colors">
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-app-text">{isAr ? crew.roleAr : crew.role}</p>
                      <p className="text-[10px] text-app-dim mt-0.5">
                        {isAr ? crew.mandatedRequirementAr : crew.mandatedRequirement}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge tone="accent" className="font-mono text-[10px]">
                        {isAr ? crew.certificationAr : crew.certification}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono text-app-muted">{crew.crews}</td>
                    <td className="px-3 py-2.5 text-center font-mono font-medium text-app-text">{crew.headcount}</td>
                    <td className="px-3 py-2.5 text-right rtl:text-left font-mono font-bold text-app-green">
                      {crew.hours.toLocaleString()} {isAr ? "ساعة" : "hrs"}
                    </td>
                    <td className="px-3 py-2.5 text-right rtl:text-left font-mono text-app-muted">{crew.rateSAR}</td>
                    <td className="px-3 py-2.5 text-right rtl:text-left font-mono font-semibold text-app-text">
                      {fmtMoney(crew.hours * crew.rateSAR, "SAR")}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-app-dim max-w-xs">
                      {isAr ? crew.equipmentAllocationAr : crew.equipmentAllocation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Card className="p-4 bg-app-panel-2 space-y-3">
            <SectionTitle right={<Badge tone="blue">{isAr ? "مطابقة لمواصفات أرامكو للمعدات الثقيلة" : "Aramco Heavy Equipment Compliant"}</Badge>}>
              {isAr ? "أسطول الآليات والمعدات المعتمدة للإنشاء (§5.2)" : "Allocated Construction Machinery & Fleet (§5.2)"}
            </SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 text-xs">
              <div className="rounded border border-app-border bg-app-panel p-2.5">
                <p className="font-semibold text-app-text">
                  {isAr ? "2 × شاحنات رافعة (Boom Trucks)" : "2 × Utility Boom Trucks"}
                </p>
                <p className="text-[10px] text-app-dim mt-0.5">
                  {isAr ? "فحص ولواصق أرامكو سارية؛ نقل السقالات والتركيب المرتفع" : "Aramco sticker inspected; scaffolding transport & high wall box mounting"}
                </p>
              </div>
              <div className="rounded border border-app-border bg-app-panel p-2.5">
                <p className="font-semibold text-app-text">
                  {isAr ? "2 × محطات اختبار ضغط هيدروستاتيكي" : "2 × Hydrostatic Pressure Rigs"}
                </p>
                <p className="text-[10px] text-app-dim mt-0.5">
                  {isAr ? "ساعات قياس رقمية معايرة؛ اختبار بـ 1.5 ضعف ضغط التشغيل" : "Calibrated digital gauges; 1.5× operating pressure testing on spool joints"}
                </p>
              </div>
              <div className="rounded border border-app-border bg-app-panel p-2.5">
                <p className="font-semibold text-app-text">
                  {isAr ? "12 × مجموعات سقالات معدنية معتمدة" : "12 × Metal Scaffolding Sets"}
                </p>
                <p className="text-[10px] text-app-dim mt-0.5">
                  {isAr ? "مكونات معتمدة بموجب دليل السلامة لإدارة منع الخسائر" : "Approved metal components per Loss Prevention Scaffold Safety Handbook"}
                </p>
              </div>
              <div className="rounded border border-app-border bg-app-panel p-2.5">
                <p className="font-semibold text-app-text">
                  {isAr ? "4 × مركبات خدمة وفرق ميدانية" : "4 × Site Crew Service Vans"}
                </p>
                <p className="text-[10px] text-app-dim mt-0.5">
                  {isAr ? "حقائب إسعاف أولي (نظام العمل م 134-135) وطفايات حريق" : "Fitted with first-aid kits per Saudi Labor Law Art. 134-135 & fire extinguishers"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: HIGH-COST SPECIALTY FLAGS */}
      {activeTab === "specialty" && (
        <div className="space-y-5">
          <div className="rounded border border-app-red/40 bg-app-red/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-app-red shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-app-red text-sm">
                  {isAr
                    ? "تنبيه المخاطر التنفيذية: حماية هامش الربح من خسارة 5% إلى 10% أثناء المشروع"
                    : "Operational Cost Drivers & 5%–10% Margin Loss Leakage Protection"}
                </h3>
                <p className="text-xs text-app-text mt-1 leading-relaxed">
                  {isAr
                    ? "تاريخياً يخسر المقاولون من 5% إلى 10% من قيمة العقد بعد الفوز به بسبب إغفال اشتراطات الموقع التخصصية. قام محرك الذكاء الاصطناعي بعزل ثلاثة مؤشرات تشغيلية حرجة من كراسة الشروط يجب تغطيتها بمبالغ طوارئ مشروطة أو تحفظات تجارية."
                    : "During project execution, contractors historically lose 5% to 10% of their winning contract value due to omitted specialty site conditions. The BidWinning AI engine has isolated three critical operational triggers from the SOW that must be covered by provisional sums or commercial qualifications."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {DEFAULT_SPECIALTY_FLAGS.map((flag) => {
              const isFire = flag.category === "Fire Pump Rooms";
              const isDewat = flag.category === "Dewatering";
              const Icon = isFire ? Flame : isDewat ? Droplets : ShieldAlert;

              return (
                <Card
                  key={flag.id}
                  className={cn(
                    "p-5 flex flex-col justify-between border-t-4 transition-shadow hover:shadow-md",
                    isFire
                      ? "border-t-app-red bg-app-panel"
                      : isDewat
                      ? "border-t-app-blue bg-app-panel"
                      : "border-t-app-yellow bg-app-panel"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-app-muted">
                        <Icon
                          size={14}
                          className={isFire ? "text-app-red" : isDewat ? "text-app-blue" : "text-app-yellow"}
                        />
                        {isAr ? flag.categoryAr : flag.category}
                      </span>
                      <Badge tone={flag.severity === "Critical" ? "red" : "yellow"}>
                        {isAr
                          ? flag.severity === "Critical" ? "مخاطرة حرجة" : "مخاطرة مرتفعة"
                          : `${flag.severity} Exposure`}
                      </Badge>
                    </div>

                    <h4 className="font-display text-sm font-bold text-app-text leading-snug">
                      {isAr ? flag.titleAr : flag.title}
                    </h4>

                    <div className="rounded bg-app-panel-2 p-2 border border-app-border">
                      <Label>{isAr ? "الأثر المحتمل على هامش الربح" : "Potential Margin Hit"}</Label>
                      <p className="font-mono text-xs font-bold text-app-red mt-0.5">
                        {isAr ? flag.profitMarginLossRiskAr : flag.profitMarginLossRisk}
                      </p>
                      <p className="text-[10px] text-app-dim">
                        {isAr ? "المبلغ الاحتياطي المقترح:" : "Recommended Provisional Sum:"}{" "}
                        {fmtMoney(flag.provisionalSumSAR, "SAR")}
                      </p>
                    </div>

                    <div>
                      <Label>{isAr ? "موقع الخطر بكراسة الشروط" : "Scope Trigger in SOW"}</Label>
                      <p className="text-xs text-app-text mt-1 leading-normal">
                        {isAr ? flag.scopeTriggerAr : flag.scopeTrigger}
                      </p>
                    </div>

                    <div>
                      <Label>{isAr ? "معايير أرامكو ذات الصلة" : "Aramco Standards Required"}</Label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {flag.applicableStandards.map((std) => (
                          <span
                            key={std}
                            className="rounded bg-app-panel-2 border border-app-border px-1.5 py-0.5 font-mono text-[10px] text-app-accent"
                          >
                            {std}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>{isAr ? "عوامل التكلفة غير المسعرة" : "Unpriced Operational Cost Drivers"}</Label>
                      <ul className="mt-1 space-y-1 text-[11px] text-app-muted">
                        {(isAr ? flag.unpricedCostDriversAr : flag.unpricedCostDrivers).map((driver, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-app-red shrink-0">•</span>
                            <span>{driver}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-app-border">
                    <Label className="text-app-green">
                      {isAr ? "الإجراء التعاقدي المقترح لمهندس التسعير" : "Recommended Estimator Action"}
                    </Label>
                    <p className="mt-1 text-[11px] text-app-text font-medium leading-normal">
                      {isAr ? flag.mitigationRecommendationAr : flag.mitigationRecommendation}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-4 bg-app-panel-2 border border-app-accent/30 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-app-text">
                {isAr
                  ? "تثبيت التحفظات التجارية وإضافة مبالغ الطوارئ الاحتياطية"
                  : "Prepare Commercial Qualifications & Add Contingency Sums"}
              </p>
              <p className="text-[11px] text-app-muted">
                {isAr
                  ? `ترحيل مبالغ الطوارئ الاحتياطية الثلاثة (إجمالي: ${fmtMoney(totalSpecialtyContingencySAR, "SAR")}) إلى سجل الطوارئ والمخاطر يضمن سلامة العقد من نزيف الخسائر.`
                  : `Pushing these three specialty provisional sums (Total: ${fmtMoney(totalSpecialtyContingencySAR, "SAR")}) into the Risk & Contingency register ensures zero loss on the winning bid.`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  s.notify(
                    isAr ? "تم نقل مبالغ الطوارئ" : "Contingency Transferred",
                    isAr
                      ? `تمت إضافة مبالغ احتياطية بقيمة ${fmtMoney(totalSpecialtyContingencySAR, "SAR")} إلى سجل المخاطر والطوارئ.`
                      : `Provisional sums of ${fmtMoney(totalSpecialtyContingencySAR, "SAR")} added to Risk Contingency register.`,
                    "/app/risks/register"
                  );
                }}
              >
                {isAr
                  ? `ترحيل ${totalSpecialtyContingencySAR.toLocaleString()} ر.س لمخصص الطوارئ`
                  : `Apply SAR ${totalSpecialtyContingencySAR.toLocaleString()} to Contingency`}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
